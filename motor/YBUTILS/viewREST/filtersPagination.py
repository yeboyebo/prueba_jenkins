"""
    Utilidades de filtro y paginacion propias para viewsets.
"""
import inspect
import importlib
from collections import OrderedDict

from django.http import QueryDict
from django.db.models import Q

from rest_framework import filters, pagination
from rest_framework.response import Response
from rest_framework.utils.urls import replace_query_param


# -----------------------------METODOS PRIVADOS-----------------------------------------------------------
#     Permite convertir en diccionario normal un querydict o alguno que tenga
#     parametros con []. De manera que los parametros multiples sean siempre una lista.
def _estandarizadict(dictEntrada):
    auxdict = {}
    bEsqueryDict = isinstance(dictEntrada, QueryDict)
    for k in dictEntrada.keys():
        bEsLista = False
        criterio = k
        # si viene ya con final asi
        if criterio.endswith("[]"):
            bEsLista = True
            criterio = criterio[:-2]
        # Obtenemos valor
        v = dictEntrada[k]
        if bEsqueryDict:
            v2 = dictEntrada.getlist(k, [])
            if (v2 != [] and len(v2) > 1):
                v = v2
                bEsLista = True
        if bEsLista:
            v = tolist(v)
        auxdict[k] = v
    return auxdict


def tolist(a):
    if not isinstance(a, list):
        return [a]
    else:
        return a


def _get_count(queryset):
    """
    Determine an object count, supporting either querysets or regular lists.
    """
    try:
        return queryset.count()
    except (AttributeError, TypeError):
        return len(queryset)


def _generaPostParam(dictEntrada):
    postParam = {}
    paramdict = {}
    try:
        for k in dictEntrada.keys():
            v = dictEntrada[k]
            paramdict[k] = v
    except Exception:
        pass
    postParam["POST"] = paramdict
    return postParam


def _generaParamFromRequest(dictEntrada):
    paramdict = {}
    auxdict = {}
    for k in dictEntrada.keys():
        if k.startswith("p_"):
            v = dictEntrada[k]
            criterio = k[len("p_"):]
            paramdict[criterio] = v
        if k.startswith("qr_td"):
            v = dictEntrada[k]
            criterio = k[len("qr_td"):]
            auxdict[criterio] = v
        print(auxdict)
    return paramdict


def _generaParamFromFilters(dictEntrada):
    paramdict = {}
    for k in dictEntrada.keys():
        if k.startswith("qr_td"):
            v = dictEntrada[k]
            criterio = k[len("qr_td"):]
            paramdict[criterio] = v
    return paramdict


def _generaMsgFromRequest(dictEntrada):
    paramdict = {}
    for k in dictEntrada.keys():
        if k.startswith("m_"):
            v = dictEntrada[k]
            criterio = k[len("m_"):]
            paramdict[criterio] = v
    return paramdict


# metodo generico para construir kwags de busqueda a partir un dict
def _getsearchParam(dictEntrada, serializer, template=None, prefix="s_"):
    searchdict = {}
    # juanma(añadido qdict para poder hacer consultas or de filtrado)
    qdict = []
    # juanma(añadido sdict para poder hacer consultas con and de filtrado con q_ y s_)
    sdict = []
    for k in dictEntrada.keys():
        # Filtros de servidor, deben venir en formato JSON con criterio:valor
        if k.startswith("f_"):
            name = k[2:]
            data = dictEntrada[k]
            if name == "" and data != "":
                name = data
                data = None
            try:
                mimodel = serializer.Meta.model
                expected_args = inspect.getargspec(mimodel.getFilters)[0]
                new_args = [mimodel, mimodel._meta.verbose_name, name, data]
                serverFilters = mimodel.getFilters(*new_args[-len(expected_args):])
                for f in serverFilters:
                    searchdict[f["criterio"]] = f["valor"]
                    sdict.append((f["criterio"], f["valor"]))

            except (NameError, TypeError) as e:
                raise NameError("Ocurrió un error al recuperar los filtros (getFilters) de {}: {}".format(mimodel.__module__, e))

        if k.startswith("q_"):
            bEsLista = False
            v = dictEntrada[k]
            try:
                v2 = dictEntrada.getlist(k, [])
                if (v2 != [] and len(v2) > 1):
                    v = v2
                    bEsLista = True
            except Exception:
                pass
            criterio = k[len("q_"):]
            if not bEsLista:
                qdict.append((criterio, v))
            else:
                for value in v:
                    qdict.append((criterio, value))
        if k.startswith(prefix):
            v = dictEntrada[k]
            criterio = k[len(prefix):]
            bEsLista = False
            # eliminacion de campos Lista por serializacion $.param de jquery
            try:
                v2 = dictEntrada.getlist(k, [])
                if (v2 != [] and len(v2) > 1):
                    v = v2
                    bEsLista = True
            except Exception:
                pass
            if criterio.endswith("[]"):
                bEsLista = True
                criterio = criterio[:-2]
            separadores = criterio.split("__")
            if len(separadores) > 1:
                campo = separadores[0]
            try:
                if isinstance(v, list):
                    valor = list()
                    for v2 in v:
                        valor.append(serializer.fields[campo].to_internal_value(v2))
                elif bEsLista:
                    valor = list()
                    valor.append(serializer.fields[campo].to_internal_value(v))
                else:
                    valor = serializer.fields[campo].to_internal_value(v)
            except Exception:
                valor = v
            # Tratamiento para IN, exact, hacer OR
            # TODO CRITERIO EXACT LO PASAMOS A IN
            if criterio.endswith("_exact"):
                criterio = criterio[:-5] + "in"
            # Criterio es un in
            bCriterioEsIN = criterio.endswith("_in")
            if bCriterioEsIN and not isinstance(valor, list):
                milist = list()
                milist.append(valor)
                valor = milist
            # Si existe lo añadimos
            bCriterioExiste = criterio in searchdict
            if bCriterioExiste and bCriterioEsIN:
                milist = list()
                milist.append(valor)
                valor2 = searchdict[criterio]
                valor = milist + valor2
                searchdict[criterio] = valor
                sdict.append((criterio, valor))
            else:
                searchdict[criterio] = valor
                sdict.append((criterio, valor))
    if qdict:
        queries = [Q(x) for x in qdict]
        # query = reduce(OR,query)
        query = queries.pop()
        for item in queries:
            query |= item
        if searchdict:
            squeries = [Q(x) for x in sdict]
            for item in squeries:
                query &= item
        return query
    else:
        return searchdict


# Genera dos diccionarios para hacer update sobre DATA y SCHEMA
# *  OcultarCampos. (Prefijo fh_campo)
# * Establecer valor de campos (defecto) (Pefijo fv_campo)
# * DeshabilitarCampos (Prefijo fd_campo)

# *Dado que lo mas comun sera deshabilitar y establecer valor se establece ff_ como shorcut, sera por ejemplo ff_user=1 (bloquear campo user y establecer valor =1)


def _getParamEspeciales(dictEntrada, serializer):
    DATA_UPD = {}
    SCHEMA_UPD = {}
    # DATA que no pertenece al model
    DATAREL_UPD = {}
    for k, v in dictEntrada.items():
        # Ya no se usan
        bValor = k.startswith("fv_") or k.startswith("ff_")
        bOcultar = k.startswith("fh_")
        bRelated = k.startswith("fr_")
        bField = k.startswith("fs_")
        bLock = k.startswith("fd_") or k.startswith("ff_")
        bProcesar = bLock or bOcultar or bValor or bField or bRelated
        if bProcesar:
            campo = k[3:]
            if bRelated:
                # DATAREL
                DATAREL_UPD.update({campo: None})
            if bValor:
                valor = v
                try:
                    valor = serializer.fields[campo].to_internal_value(v)
                except Exception:
                    pass
            if bValor:
                DATA_UPD.update({campo: valor})
            if bLock:
                SCHEMA_UPD.update({campo: {"locked": True}})
            if bOcultar:
                SCHEMA_UPD.update({campo: {"visible": False}})
            if bField:
                SCHEMA_UPD.update({campo: {"field": True}})
    return SCHEMA_UPD, DATA_UPD


def _filterDict(dictEntrada, prefijo):
    """
        Da diccionario solo con claves que cumplen
    """
    midict = dict()
    milen = len(prefijo)
    for k, v in dictEntrada.items():
        if k.startswith(prefijo):
            midict[k[milen:]] = v
    return midict


def _filterJSON(dictEntrada, prefijo):
    """
        Da diccionario solo con claves que cumplen
    """
    midict = {}
    milen = len(prefijo)
    for k, v in dictEntrada.items():
        if k.startswith(prefijo):
            clave = k[milen:].replace("[", "")
            clave = clave.replace("]", "")
            midict[clave] = v
    return midict


# metodo generico para construir ordenes
# TODO:Luego lo haremos por orden
def _getOrder(dictEntrada, prefix="o_"):
    milist = []
    for k, v in sorted(dictEntrada.items()):
        if k.startswith(prefix):
            milist.append(v)
    # Si no se indica ningun orden se ordena por clave primaria
    # if len(milist) == 0:
    milist.append("pk")
    return milist


def _filter_queryset2(query_params, queryset, serializer, template=None):
    searchdict = _getsearchParam(query_params, serializer, template)

    # TODO capturar error int() with base 10
    orders = _getOrder(query_params)
    # print(queryset[0]._meta.pk.__class__.__name__)
    # juanma(Capturo una excepcion porque si viene una consulta con Q object no se debe tratar como un kwargs)
    try:
        obj = queryset.filter(**searchdict).order_by(*orders)
    except Exception:
        obj = queryset.filter(searchdict).order_by(*orders)
    return (searchdict, orders, obj, query_params)


def _getGridFilters(prefix, usuario):
    fgrid = {}
    modelos = importlib.import_module("YBSYSTEM.models.flsisppal.models")
    sis_gridfilter = getattr(modelos, "mtd_sis_gridfilter", None)
    if sis_gridfilter:
        try:
            user_gridfilter = sis_gridfilter.objects.filter(Q(usuario=usuario) & Q(prefix=prefix))
            for obj in user_gridfilter:
                fgrid[obj.descripcion] = {}
                fgrid[obj.descripcion]["pk"] = obj.id
                fgrid[obj.descripcion]["filtro"] = obj.filtro
                fgrid[obj.descripcion]["default"] = obj.inicial
        except Exception as e:
            print(e)
            pass
    return fgrid


class YBFilterBackend(filters.BaseFilterBackend):
    """
    Filtro a partir de parametros s_ y o_
    """

    @classmethod
    def filter_queryset(cls, request, queryset, view):
        aux1, aux2, obj, queryset = _filter_queryset2(request.query_params, queryset, view.get_serializer(partial=True), request.user)
        return obj


# class YBFilterBackend(filters.BaseFilterBackend):
#    """
#    Filtro a partir de parametros s_ y o_
#    """
#    @classmethod
#    def filter_queryset(cls, request, queryset, view):
#        searchdict=_getsearchParam(request.query_params,view.get_serializer(partial=True),"s_")
#        resul=queryset.filter(**searchdict)
#        order=_getOrder(request.query_params,"o_")
#        if len(order):
#            return resul.order_by(order)
#        return resul

class YBPagination(pagination.LimitOffsetPagination):
    """
        Permite paginar no realizando siempre count
        y nos da link anterior y posterior
    """
    default_limit = 100
    limit_query_param = "p_l"
    offset_query_param = "p_o"
    max_limit = 2000
    template = None

    def paginate_queryset(self, queryset, request, view=None, bCount=False):
        self.request = request
        bCount2 = bCount or ("p_c" in request.query_params)
        return self.paginate_queryset2(queryset, request.query_params, bCount2)

    def paginate_queryset2(self, queryset, query_params, bCount=False):
        self.limit = self.get_limit(query_params)
        if self.limit is None:
            return None

        self.offset = self.get_offset(query_params)
        self.count = None
        # TODO forzar bCount si p_c en query_string.
        if bCount:
            self.count = _get_count(queryset)
            resul = list(queryset[self.offset:self.offset + self.limit])
            self.bNext = self.count > self.offset + self.limit
        else:
            # Intentamos obtenr un elemento mas
            resul = list(queryset[self.offset: self.offset + self.limit + 1])
            iLen = len(resul)
            self.bNext = iLen > self.limit
            # tratamos segun haya mas o no
            if self.bNext:
                # quitamos elemento de mas incluido
                resul.pop()
            else:
                # Informamos count si lo sabemos
                self.count = iLen + self.offset
        return resul

    def get_paginated_response(self, data):
        return Response(OrderedDict([("PAG", OrderedDict([
            ("COUNT", self.count),
            ("NEXT", self.get_next_link()),
            ("PREVIOUS", self.get_previous_link()),
            ("NO", self.get_next_offset()),
            ("PO", self.get_previous_offset()),
        ])),
            ("data", data)
        ]))

    def get_next_link(self):
        if not self.bNext:
            return None

        url = self.request.build_absolute_uri()
        offset = self.offset + self.limit
        return replace_query_param(url, self.offset_query_param, offset)

    def get_next_offset(self):
        if not self.bNext:
            return None
        return self.offset + self.limit

    def get_previous_offset(self):
        offset = self.offset - self.limit
        if offset > 0:
            return offset

    def get_limit(self, query_params):
        if self.limit_query_param:
            try:
                return pagination._positive_int(
                    query_params[self.limit_query_param],
                    cutoff=self.max_limit
                )
            except (KeyError, ValueError):
                pass

        return self.default_limit

    def get_offset(self, query_params):
        try:
            return pagination._positive_int(
                query_params[self.offset_query_param],
            )
        except (KeyError, ValueError):
            return 0
