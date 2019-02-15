import json
import inspect

from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.utils.translation import ugettext_lazy as _

from rest_framework import viewsets, exceptions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from YBWEB.ctxJSON import templateCTX
from YBUTILS import mylogging as log
from YBUTILS import queryTable
from YBUTILS import jsonTable
from YBUTILS import gesDoc
from YBUTILS.viewREST import factorias
from YBUTILS.viewREST import filtersPagination
from YBUTILS.viewREST import YBLayout
from YBUTILS.viewREST import cacheController
from YBUTILS.viewREST import helpers
from YBUTILS.viewREST import fileAttachment
from YBUTILS.viewREST import serializers
from YBUTILS.viewREST import accessControl
from YBUTILS.viewREST import wsController
from YBUTILS.viewREST.accion import generaCursor


class YBRModelViewSetBase(viewsets.ModelViewSet, log.logMixin):
    """
        Clase Base que incluye parametrizacion
    """

    pagination_class = filtersPagination.YBPagination
    filter_backends = (filtersPagination.YBFilterBackend,)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
    # --------------------------METODOS A SOBREESCRIBIR-----------------------
    _aplicacion = ""
    _prefix = ""  # Sera el modelName por defecto tambien
    _model = None
    # ------------------------------------------------------------------------

    # --------------------------METODOS FUNCIONALIDADES ADICIONALES-----------

    # METODOS PARA OBTENER APLICACION Y modelo/prefijo
    def getModelName(self):
        return self._prefix

    def getAplic(self):
        return self._aplicacion

    def YBgetModel(self):
        return self._model

    # Sobreescribe metodos para obtener queryset y clase serializador
    def get_queryset(self):
        # Tratemiento de propiedades de busqueda del queryset
        return self.YBgetModel().objects.all()

    def get_serializer(self, *args, **kwargs):
        """
        Return the serializer instance that should be used for validating and
        deserializing input, and for serializing output.
        """
        metaKwargs = kwargs.pop("YB_meta_kwargs", {})
        # I
        serializer_class = self.get_serializer_class(meta_kwargs=metaKwargs)
        kwargs["context"] = self.get_serializer_context()
        return serializer_class(*args, **kwargs)

    def get_serializer_class(self, meta_kwargs=None):
        return factorias.FactoriaSerializadoresBase.getRepositorioWithMeta(modelName=self._prefix, model=self._model, meta=meta_kwargs)

    # Metodos directos para obten
    def getdataInd(self):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return serializer.data

    def getdataMult(self, bPagination=False):
        queryset = self.filter_queryset(self.get_queryset())
        if bPagination:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return serializer.data


class YBRESTModelViewSet(YBRModelViewSetBase):
    """Incluye funcionalidad REST basica
        update, add...
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    @classmethod
    def cargaListaQuery(self, prefix, request):
        params = None
        qparams = {}
        qparams["filter"] = True
        if not request.query_params:
            params = request.data
        else:
            params = request.query_params
        base_serializer, meta_model = factorias.FactoriaSerializadoresBase.getSerializer(prefix, None)

        master = False
        if "qr_pk" not in params or not params["qr_pk"]:
            querytable_function = getattr(meta_model, "queryGrid_" + params["qr_t"])
            master = True
        else:
            querytable_function = getattr(meta_model.objects.all().get(pk=params["qr_pk"]), "queryGrid_" + params["qr_t"])

        # where, orderby = queryTable.dameParamsFiltros(request.query_params)
        filterParams = filtersPagination._generaParamFromFilters(request.query_params)
        if filterParams:
            qparams["filter"] = False
        expected_args = inspect.getargspec(querytable_function)[0]

        if master:
            new_args = [None, filterParams]
            query = querytable_function(*new_args[:len(expected_args)])
        else:
            new_args = [filterParams]
            query = querytable_function(*new_args[:len(expected_args)])

        if query:
            qparams["query"] = params
            data = {}
            resp = {}
            LAYOUT, data["IDENT"], data["DATA"], data["SCHEMA"], data["META"], a, data["INFO"] = queryTable.genera_querytable(query, params["qr_t"], qparams, meta_model, app=self._aplicacion)
            resp["PAG"] = data["IDENT"]["PAG"]
            resp["data"] = data["DATA"]
            resp["INFO"] = data["INFO"]
            return Response(resp)

    @helpers.decoradores.checkAuthentication
    def list(self, request, *args, **kwargs):
        params = request.query_params
        if not request.query_params:
            params = request.data
        # Si es una queryTable invocamos a su funcion
        if "qr_t" in params:
            return self.cargaListaQuery(self._prefix, request)

        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        # Permite establecer los campos mediante fs
        listaCampos = list(filtersPagination._filterDict(request.query_params, "fs_").keys())
        vYB_meta_kwargs = {}
        if len(listaCampos) > 0:
            vYB_meta_kwargs = {"fields": tuple(listaCampos)}
        if page is not None:
            serializer = self.get_serializer(page, many=True, YB_meta_kwargs=vYB_meta_kwargs)
            paginated_list = self.get_paginated_response(serializer.data)
            base_serializer, meta_model = factorias.FactoriaSerializadoresBase.getSerializer(self._prefix)

            modelinfo = YBMIXINCTXtemplate.get_info(meta_model, paginated_list.data["data"], paginated_list.data["PAG"])

            paginated_list.data["INFO"] = modelinfo
            return Response(paginated_list.data)
            # return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True, YB_meta_kwargs=vYB_meta_kwargs)
        # retu = OrderedDict([("INFO", "info"),
        #     ("data", serializer.data)
        # ])
        # return Response(retu)
        return Response(serializer.data)

    @helpers.decoradores.checkAuthentication
    def quicklist(self, request, *args, **kwargs):
        """
            Permite acceder a pk - descripcion para obtener listas rapidas
        """
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True, YB_meta_kwargs={"fields": ("pk", "desc")})
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True, YB_meta_kwargs={"fields": ("pk", "desc")})
        return Response(serializer.data)

    @helpers.decoradores.checkAuthentication
    def detailedlist(self, request, *args, **kwargs):
        """
            Serializa con un nivel superior en el arbol de relaciones
        """
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True, YB_meta_kwargs={"depth": 1})
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True, YB_meta_kwargs={"depth": 1})
        return Response(serializer.data)

    @helpers.decoradores.checkAuthentication
    def accionlist(self, request, tipo, *args, **kwargs):
        # TODO->PEndiente control por seguridad
        acciones = factorias.FactoriaAccion.getAcciones(self.getModelName(), tipo)
        return Response(acciones.keys())

    @helpers.decoradores.checkAuthentication
    def ejecutaraccionFileInd(self, request, accion=None, pk=None, *args, **kwargs):
        # print("ejecutando accion file", pk, accion, request.data, request.FILES)
        accion = accion.lower()
        action = factorias.FactoriaAccion.getAcciones(self.getModelName(), "I").get(accion, None)
        if action:
            action_obj = action(pk=pk)
            data = {}
            data["oParam"] = request.data
            data["oParam"]["FILES"] = request.FILES
            resul = action_obj.ejecutarExterna(data, request)
            if "autoUpload" in request.data and request.data["autoUpload"] == "false":
                return Response(resul)

            if request.FILES:
                gesDoc.fileUpload(self._prefix, pk, request.FILES)
            return Response(resul)
        else:
            log.error("Accion individual no registrada %s", accion)
            print(_("Accion no existente %s") % accion)
            raise exceptions.APIException(_("Accion no existente %s") % accion)

    @helpers.decoradores.checkAuthentication
    def ejecutaraccionInd(self, request, accion=None, pk=None, *args, **kwargs):
        # Obtener accion
        pk = pk.replace("_$_", "/")
        accion = accion.lower()
        action = factorias.FactoriaAccion.getAcciones(self.getModelName(), "I").get(accion, None)
        if pk == "NF":
            action = factorias.FactoriaAccion.getAcciones(self.getModelName(), "O").get(accion, None)
            pk = None
        if action:
            # Control de acciones BULK
            if (pk == "_BULK") or ("a_BULK" in request.query_params):
                # Cambiamos serializer de entrada por este
                bconDatosIN = True
                # opcion NORESUL
                bRESUL = not ("a_NORESUL" in request.query_params)
                data = request.data
                resul2 = list()
                for elem in data:
                    action_obj = action(pk=elem["PK"])
                    if bconDatosIN:
                        oparam = {}
                        oparam["oParam"] = elem["DATAIN"]
                        resul = action_obj.ejecutarExterna(oparam, request)
                    else:
                        resul = action_obj.ejecutarExterna({}, request)
                    if bRESUL:
                        resul2.append(resul)
                return Response(resul2)
            # ACCIONES NORMALES
            else:
                action_obj = action(pk=pk)
                resul = action_obj.ejecutarExterna(request.data, request)
                return Response(resul)
        else:
            log.error("Accion individual no registrada %s", accion)
            print(_("Accion no existente %s") % accion)
            raise exceptions.APIException(_("Accion no existente %s") % accion)

    # @csrf_exempt
    def ejecutaraccionCsrAux(self, request, accion=None, *args, **kwargs):
        key = None
        if "HTTP_KEY" in request.META:
            key = request.META["HTTP_KEY"]
        source = None
        if "HTTP_SOURCE" in request.META:
            source = request.META["HTTP_SOURCE"]
        contentType = None
        if "CONTENT_TYPE" in request.META:
            contentType = request.META["CONTENT_TYPE"]
        remoteAddr = None
        if "REMOTE_ADDR" in request.META:
            remoteAddr = request.META["REMOTE_ADDR"]
        try:
            params = {}
            if contentType and contentType == "application/xml":
                params["POST"] = {"xml": request.body.decode("utf-8")}
            else:
                params["POST"] = json.loads(request.body.decode("utf-8"))
        except Exception as e:
            print(e)
            params = filtersPagination._generaPostParam(request._data)
        try:
            action = factorias.FactoriaAccion.getAcciones(self.getModelName(), "csr").get(accion, None)
            params["POST"]["key"] = key
            params["POST"]["source"] = source
            params["POST"]["contentType"] = contentType
            params["POST"]["remoteAddr"] = remoteAddr
            if action:
                return Response(action(params["POST"]))
            else:
                print("Error inesperado action")
                raise exceptions.APIException(_("Accion no existente %s") % accion)
        except Exception as e:
            print("Error inesperado invocacion", e)
            raise exceptions.APIException(_("Accion no existente %s") % accion)

    # # @csrf_exempt
    # def ejecutaraccionCsrAuxDownFile(self, request, accion=None, *args, **kwargs):
    #     try:
    #         print(factorias.FactoriaAccion.getAcciones(self.getModelName(), "csr"))
    #         action = factorias.FactoriaAccion.getAcciones(self.getModelName(), "csr").get(accion, None)
    #         if action:
    #             return action("2")
    #         else:
    #             print("Error inesperado action")
    #             raise exceptions.APIException(_("Accion no existente %s") % accion)
    #     except Exception as e:
    #         print("Error inesperado invocacion", e)
    #         raise exceptions.APIException(_("Accion no existente %s") % accion)

    # @csrf_exempt
    def ejecutaraccionCsr(self, request, accion=None, pk=None, *args, **kwargs):
        try:
            params = {}
            params["POST"] = json.loads(request.body.decode("utf-8"))
        except Exception:
            params = filtersPagination._generaPostParam(request._data)
        # Obtener accion
        accion = accion.lower()
        action = factorias.FactoriaAccion.getAcciones(self.getModelName(), "I").get(accion, None)
        if action:
            action_obj = action(pk=pk)
            resul = action_obj.ejecutarExterna(request.data, request, params)
            return Response(resul["resul"])
        else:
            log.error("Accion individual no registrada %s", accion)
            print(_("Accion no existente %s") % accion)
            raise exceptions.APIException(_("Accion no existente %s") % accion)

    def ejecutaraccionList(self, request, accion=None, *args, **kwargs):
        accion = accion.lower()
        action = factorias.FactoriaAccion.getAcciones(self.getModelName(), "Q").get(accion, None)
        if action:
            query = dict()
            query["ORDER"] = filtersPagination._getOrder(request.query_params, "o_")
            query["FILTER"] = filtersPagination._getsearchParam(request.query_params, self.get_serializer(partial=True), None)
            action_obj = action(query=query)
            resul = action_obj.ejecutarExterna(request.data, request)
            return Response(resul)
        else:
            # TODO: Tratamiento de acciones individuales como multiples
            action = factorias.FactoriaAccion.getAcciones(self.getModelName(), "I").get(accion, None)
            bRESUL = not ("a_NORESUL" in request.query_params)
            if action:
                queryset = self.filter_queryset(self.get_queryset())
                resul2 = list()
                for obj in queryset:
                    action_obj = action(pk=obj.pk)
                    resul = action_obj.ejecutarExterna(request.data, request)
                    if bRESUL:
                        resul2.append(resul)
                return Response(resul2)
            else:
                log.error("Accion Query no registrada %s", accion)
                raise exceptions.APIException(_("Accion no existente %s") % accion)

    @helpers.decoradores.checkAuthentication
    def generaCSVAux(self, request, accion=None, *args, **kwargs):
        return None

    @helpers.decoradores.checkAuthentication
    def generaCSVInd(self, request, accion=None, pk=None, *args, **kwargs):
        params = request.query_params or None
        response = fileAttachment.generaCSV(self._prefix, pk, accion, params)
        return response

    @helpers.decoradores.checkAuthentication
    def generaJReportInd(self, request, accion=None, pk=None, *args, **kwargs):
        response = fileAttachment.generaJReport(self._prefix, pk, accion)
        return response

    @helpers.decoradores.checkAuthentication
    def generaJReport(self, request, report=None, pk=None, *args, **kwargs):
        response = fileAttachment.getJReport(pk, report)
        return response

    @helpers.decoradores.checkAuthentication
    def generaAttachment(self, request, pk=None, *args, **kwargs):
        response = gesDoc.generaFiles(self._prefix, pk)
        return response

    @helpers.decoradores.checkAuthentication
    def ejecutaraccionAux(self, request, accion=None, *args, **kwargs):
        accion = accion.lower()
        action = factorias.FactoriaAccion.getAcciones(self.getModelName(), "O").get(accion, None)
        if action:
            if "a_BULK" in request.query_params:
                bRESUL = not ("a_NORESUL" in request.query_params)
                serializer = action.serializerClassIN(many=True, data=request.data)
                serializer.is_valid(raise_exception=True)
                data = serializer.validated_data
                resul2 = list()
                for elem in data:
                    action_obj = action()
                    resul = action_obj.ejecutarExterna(elem, request)
                    if bRESUL:
                        resul2.append(resul)
                return Response(resul2)
            else:
                action_obj = action()
                resul = action_obj.ejecutarExterna(request.data, request)
                return Response(resul)
        else:
            log.error("Accion Otra no registrada %s", accion)
            print(_("Accion no existente %s") % accion)
            raise exceptions.APIException(_("Accion no existente %s") % accion)
        pass


class YBMIXINCTXtemplate(object):
    """
        Permite incluir funcionalidad defecto sin depender de otros temas
    """

    @classmethod
    def get_serializer(self, modelName, model=None, addFieldsFuncion=None, template=None):
        return factorias.FactoriaSerializadoresBase.getSerializer(modelName, model, addFieldsFuncion, template)

    @classmethod
    def getDefaultLayOUT(cls, schema):
        return YBLayout.getDefaultLayOUT(schema)

    @classmethod
    def incluyeContextTipo(cls, ctxrequest, prefix, tipo, modif, template, param):
        serializer = None
        dict = {
            "YB": {
                "IDENT": {
                    "PREFIX": prefix,
                    "MODIF": modif,
                    "TIPO": tipo,
                    "NOMBRE": template
                },
                "PARAM": param,
                "OPTS": {}
            }
        }
        if tipo == "accion":
            if modif:
                serializer = factorias.FactoriaAccion.getAccionNom(prefix, modif).serializerClassIN
                dict["YB"]["SCHEMA"], dict["YB"]["META"] = YBLayout.getYBschema(serializer)
                dict["YB"]["LAYOUT"] = cls.getDefaultLayOUT(dict["YB"]["SCHEMA"])
            else:
                pass
        else:
            # Obtenemos serializer por defecto del modelo
            try:
                serializer, meta_model = cls.get_serializer(prefix)
                dict["YB"]["SCHEMA"], dict["YB"]["META"] = YBLayout.getYBschema(serializer)
                dict["YB"]["LAYOUT"] = cls.getDefaultLayOUT(dict["YB"]["SCHEMA"])
            except Exception:
                pass

        ctxrequest.update(dict)
        return serializer

    @classmethod
    def get_info(self, model, data, pagination=None):
        app_info = None
        model_info = None

        try:
            viewset = factorias.FactoriaSerializadoresBase.get_app_viewset(self._aplicacion)
            if viewset and viewset.get_app_info is not None:
                app_info = {self._aplicacion: viewset.get_app_info(model, data)}
        except (ImportError, AttributeError):
            app_info = None
        except Exception:
            raise

        try:
            model_info = model.get_model_info(model, data, pagination)
        except AttributeError:
            model_info = None
        except Exception:
            raise

        info = {"app": app_info, "model": model_info}
        return info

    @classmethod
    def get_foreignfields(self, serializer, meta_model, template=None):
        try:
            if not template:
                template = "master"

            calculateFields = meta_model.getForeignFields(meta_model, template)
            for field in calculateFields:
                serializer._declared_fields.update({field["verbose_name"]: serializers.serializers.ReadOnlyField(label=field["verbose_name"], source=field["func"])})

            return serializer

        except (NameError, TypeError) as e:
            raise NameError("Ocurrió un error al recuperar los campos calculados (foreignFields) de {}: {}".format(meta_model.__module__, e))

    @classmethod
    def init_validation(self, schema, template, request, data=None):
        if not schema or "initValidation" not in schema:
            return True, None

        validation_schema = schema["initValidation"]
        if not validation_schema:
            return True, None

        # sessionUser = request.user.username
        params = filtersPagination._generaParamFromRequest(request.query_params)
        if not data:
            data = {}

        data["params"] = params
        base_serializer, meta_model = self.get_serializer(self._prefix, template)

        try:
            validation_func = meta_model.initValidation
            expected_args = inspect.getargspec(validation_func)[0]
            new_args = [meta_model, template, data]
            if not meta_model.initValidation(*new_args[-len(expected_args):]):
                # TODO añadir root url
                url = "/" + validation_schema["error"]["aplic"] + "/" + validation_schema["error"]["prefix"] + "/custom/" + validation_schema["error"]["template"]
                if validation_schema["error"]["template"] == "master":
                    url = "/" + validation_schema["error"]["aplic"] + "/" + validation_schema["error"]["prefix"] + "/" + validation_schema["error"]["template"]
                msg = ""
                if "msg" in validation_schema["error"]:
                    msg = validation_schema["error"]["msg"]
                    url += "?m_error=" + msg
                return False, HttpResponseRedirect(url)

        except (NameError, TypeError) as e:
            raise NameError("Ocurrió un error al realizar la validación inicial (initValidation) de {}: {}".format(meta_model.__module__, e))

        return True, None

    @classmethod
    def carga_datos_labels(self, pk, request, template=None, data=None):
        try:
            base_serializer, meta_model = self.get_serializer(self._prefix, None)
            cursor = None
            if pk:
                cursor = generaCursor.getCursor(meta_model, pk)

            return meta_model.iniciaValoresLabel(meta_model, template=template, cursor=cursor, data=data)

        except (NameError, TypeError) as e:
            raise NameError("Ocurrió un error al cargar los datos iniciales de labels (iniciaValoresLabel) de {}: {}".format(meta_model.__module__, e))

    @classmethod
    def carga_datos_pk(self, prefix, pk, user, template=None):
        base_serializer, meta_model = self.get_serializer(prefix, prefix, None, template)
        base_serializer = self.get_foreignfields(base_serializer, meta_model, template)

        obj = meta_model.objects.all().get(pk=pk)
        schema, meta = YBLayout.getYBschema(base_serializer)
        serializer = base_serializer(instance=obj)
        modelinfo = self.get_info(meta_model, serializer.data)

        return {"DATA": serializer.data, "SCHEMA": schema, "META": meta, "INFO": modelinfo}

    @classmethod
    def carga_datos_custom(self, prefix, name, pk, schema, method, template):
        base_serializer, meta_model = self.get_serializer(prefix, None)
        funcName = schema["custom"]
        try:
            if not pk:
                querytable_function = getattr(meta_model, funcName)
            else:
                querytable_function = getattr(meta_model.objects.all().get(pk=pk), funcName)
            data = querytable_function(template)

            return {}, data, {}, {}, {}
        except Exception as e:
            print(e)
            return {}, {}, {}, {}, {}

    @classmethod
    def carga_datos_querytable(self, prefix, name, pk, schema, request, template):
        method = request._method
        base_serializer, meta_model = self.get_serializer(prefix, None)
        initFilter = None
        if method == "GET":
            try:
                initfilter_function = None
                if not pk:
                    initfilter_function = getattr(meta_model, "queryGrid_" + name + "_initFilter")
                else:
                    initfilter_function = getattr(meta_model.objects.all().get(pk=pk), "queryGrid_" + name + "_initFilter")

                if initfilter_function:
                    expected_args = inspect.getargspec(initfilter_function)[0]
                    new_args = [template]
                    initFilter = initfilter_function(*new_args[:len(expected_args)])

            except (NameError, TypeError) as e:
                raise NameError("Ocurrió un error al recuperar los filtros iniciales (queryGrid_{}_initFilter) de la query {} de {}: {}".format(name, name, meta_model.__module__, e))
            except AttributeError:
                pass

        try:
            master = False
            filterParams = None
            if not pk:
                querytable_function = getattr(meta_model, "queryGrid_" + name)
                master = True
            else:
                querytable_function = getattr(meta_model.objects.all().get(pk=pk), "queryGrid_" + name)
            filterParams = filtersPagination._generaParamFromFilters(request.query_params)
            expected_args = inspect.getargspec(querytable_function)[0]

            if master:
                new_args = [None, filterParams]
                data = querytable_function(*new_args[:len(expected_args)])
            else:
                new_args = [filterParams]
                data = querytable_function(*new_args[:len(expected_args)])

            if data:
                return queryTable.genera_querytable(data, name, schema, meta_model, initFilter, app=self._aplicacion)

            return {}, {}, {}, {}, {}, {}, {}
        except Exception as e:
            print(e)
            return {}, {}, {}, {}, {}, {}, {}

    @classmethod
    def carga_datos_jsontable(self, data, name, schema):
        return jsonTable.genera_jsontable(data, name, schema)

    @classmethod
    def carga_datos_customfilter(self, table, schema, usuario):
        try:
            filters = filtersPagination._getGridFilters(table, usuario)
            return filters
        except Exception as e:
            print("Customfilter____", e)
            return {}

    @classmethod
    def carga_datos_schema(self, prefix, schema, pk, template):
        YB = {}

        queryDict = schema["querystring"]

        if "rel" in schema:
            rel = "s_" + schema["rel"] + "__exact"
            queryDict[rel] = pk

        YB["IDENT"], YB["DATA"], YB["SCHEMA"], YB["META"], YB["INFO"] = self.cargaDatosQuery(prefix, queryDict, template)

        return YB

    @classmethod
    def carga_datos_report(self, name, schema, pk, template):
        try:
            prefix = schema["reportTable"]
            base_serializer, meta_model = self.get_serializer(prefix, None)

            cursor = None
            report_function = None
            if not pk:
                report_function = getattr(meta_model, "report_" + name)
            else:
                cursor = generaCursor.getCursor(meta_model, pk)
                report_function = getattr(meta_model.objects.all().get(pk=pk), "report_" + name)

            return report_function(cursor)

        except Exception as e:
            # Si no existe funcion report devuelve objeto vacio y avisa
            print("No se encuentra report_", name, " tabla: ", schema["reportTable"], " ", e)
            return {}

    @classmethod
    def carga_datos_prefixschema(self, prefix, schema, pk, template):
        YB = {}
        alias = prefix
        queryDict = schema["querystring"]

        if "prefix" in schema:
            prefix = schema["prefix"]

        YB["IDENT"], YB["DATA"], YB["SCHEMA"], YB["META"], YB["INFO"] = self.cargaDatosQuery(prefix, queryDict, alias)

        if len(YB["DATA"]) == 1 and "array" not in schema:
            YB["DATA"] = YB["DATA"][0]

        return YB

    @classmethod
    def cargaDatosQuery(self, prefix, query, template=None):
        # TODO ver si tiene permiso para ver
        base_serializer, meta_model = self.get_serializer(prefix, template=template)
        base_serializer = self.get_foreignfields(base_serializer, meta_model, template)

        try:
            # IDENT
            (filtros, order, obj, queryset) = filtersPagination._filter_queryset2(query, meta_model.objects.all(), base_serializer, template=template)
            filtros = queryset
            pagination = filtersPagination.YBPagination()
            # Añadido bCount para la paginacion)
            bCount2 = False or ("p_c" in query)
            obj = pagination.paginate_queryset2(obj, query, bCount2)

            # SCHEMA, META
            schema, meta = YBLayout.getYBschema(base_serializer)
            serializer = base_serializer(instance=obj, many=True)
            # GetParam especiales ya no se usa, pero podria limitar el numero de campos que enviamos con data y schema
            SCHEMA_UPD, DATA_UPD = filtersPagination._getParamEspeciales(queryset, base_serializer())
            # DATA
            if DATA_UPD != {}:
                serializer.data.update(DATA_UPD)

            # este actualiza propiedades
            for k, v in SCHEMA_UPD.items():
                if "related" in v:
                    schema[k] = v
                try:
                    schema[k].update(v)
                except Exception:
                    pass

            # METADATA
            # TODO de donde sacamos los metadatos?
            # metadata = YBLayout.getYBMetadata(base_serializer, serializer.data)
            PAG = {"PAG": {"NO": pagination.get_next_offset(), "PO": pagination.get_previous_offset(), "COUNT": pagination.count}}

            modelinfo = self.get_info(meta_model, serializer.data, PAG)

            return {"MAINFILTER": query, "FILTER": filtros, "ORDER": order, "PAG": {"NO": pagination.get_next_offset(), "PO": pagination.get_previous_offset(), "COUNT": pagination.count}}, serializer.data, schema, meta, modelinfo

        except Exception as e:
            log.error("Error cargaDatosQuery: \n%s", e)
            return {"MAINFILTER": "", "FILTER": "", "ORDER": "", "PAG": {}}, [], {}, {}, ""

    @classmethod
    def carga_datos_form_newrecord(self, prefix, request):
        data = {}

        accion = "iniciaValores"
        base_serializer, meta_model = self.get_serializer(prefix, "newRecord")

        data["SCHEMA"], data["META"] = YBLayout.getYBschema(base_serializer)
        try:
            action = factorias.FactoriaAccion.getAcciones(prefix, "O").get(accion, None)
            action_obj = action(request)
            d = action_obj.ejecutarExterna(request)
            data["DATA"] = d["data"]
        except Exception as e:
            print(e)
            data = {}

        return data

    @classmethod
    def carga_datos_chat(self, user):
        chatObj = wsController.chatController.getChat(user)
        return chatObj

    @classmethod
    def get_ws(self, schema):
        # wsObj = wsController.wsController.getWS()
        if "ws" in schema:
            return schema["ws"]
        return False


class YBLayOutModelViewSet(viewsets.ViewSet, log.logMixin, YBMIXINCTXtemplate, APIView):
    permission_classes = (IsAuthenticated,)
    appLabels = None
    """
        Incluye funcionalidad Visualizacion basica
    """
    # A IMPLEMENTAR AL DEFINIR CLASE
    _aplicacion = ""
    _prefix = ""

    # INICIALIZACION
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def get_app_label(self, aplic):
        if self.appLabels is None:
            self.appLabels = {}
            portalMenu = templateCTX.cargaMenuJSON("portal/menu_portal.json")
            for app in portalMenu["items"]:
                self.appLabels[app["NAME"]] = app["TEXT"]

        if aplic in self.appLabels:
            return self.appLabels[aplic]

        return ""

    def get_aux_data(self, request, pk, template, schema):
        data = {}
        data["otros"] = {}
        data["persistente"] = {}
        data["default"] = {}
        data["labels"] = {}
        data["info"] = {}
        filtros = {}
        otros = {}
        labels = {}
        postDrawif = {}
        querystring = {}
        refresh = None

        if request._method == "PUT":
            params = {}
            try:
                params["POST"] = json.loads(request.body.decode("utf-8"))
            except Exception:
                if request._data:
                    params = filtersPagination._generaPostParam(request._data)

            if "FILTER" in params["POST"]:
                filtros = params["POST"]["FILTER"]
            if "querystring" in params["POST"]:
                querystring = params["POST"]["querystring"]
            if "otros" in params["POST"]:
                otros = params["POST"]["otros"] or {}
            if "labels" in params["POST"]:
                labels = params["POST"]["labels"] or {}
            if "drawIf" in params["POST"]:
                postDrawif = params["POST"]["drawIf"] or {}
            if "refresh" in params["POST"]:
                refresh = params["POST"]["refresh"]

        try:
            accion = "init"
            drawIf = schema["drawIf"] if "drawIf" in schema else None
            action = factorias.FactoriaAccion.getAcciones(self._prefix, "O").get(accion, None)
            action_obj = action(diI=drawIf, pk=pk)
            dIf = action_obj.ejecutarExterna(diI=drawIf, pk=pk)
        except Exception:
            dIf = {}
            dIf["drawif"] = {}
            dIf["resul"] = False

        data["otros"]["pk"] = pk
        data["persistente"]["pk"] = pk
        data["drawIf"] = postDrawif
        data["otros"].update(otros)
        data["labels"].update(self.carga_datos_labels(pk, request, template) or {})
        data["labels"].update(labels)

        if dIf["drawif"]:
            data["drawIf"].update(dIf["drawif"])
        if "navbar" in schema:
            if not schema["navbar"]:
                data["drawIf"]["navbar"] = False

        ws = self.get_ws(schema)
        chat = self.carga_datos_chat(request.user.username)
        data["chat"] = chat
        if ws:
            data["ws"] = ws

        return data, filtros, querystring, refresh

    def get_master_data(self, request, template):
        template_list = templateCTX.damechainMasterTemplate(self._aplicacion, self._prefix, template)
        schema = templateCTX.cargaPlantillaJSON(template_list)
        YB = {}
        data, filtros, querystring, refresh = self.get_aux_data(request, None, template, schema)

        validate, response = self.init_validation(schema, template, request)
        if not validate:
            return False, response

        # Mantener filtros al refrescar
        if self._prefix in filtros:
            schema["querystring"] = filtros[self._prefix]

        YB["IDENT"], YB["DATA"], YB["SCHEMA"], YB["META"], YB["INFO"] = self.cargaDatosQuery(self._prefix, schema["querystring"], template)

        if YB["INFO"]:
            data["info"].update(YB["INFO"])

        data[self._prefix] = YB
        data[self._prefix]["customfilter"] = self.carga_datos_customfilter(self._prefix, schema["querystring"], request.user)

        schema["schema"].update(querystring)
        for table in schema["schema"]:
            save = True
            if refresh:
                if refresh != table:
                    save = False
            if table == self._prefix:
                pass
            elif "custom" in schema["schema"][table] and save:
                data[table] = {}
                data[table]["IDENT"], data[table]["DATA"], data[table]["SCHEMA"], data[table]["META"], data["persistente"] = self.carga_datos_custom(self._prefix, table, None, schema["schema"][table], request._method, template)
            elif "query" in schema["schema"][table] and save:
                if table in filtros:
                    schema["schema"][table]["query"] = filtros[table]
                data[table] = {}
                LAYOUT = {}
                LAYOUT, data[table]["IDENT"], data[table]["DATA"], data[table]["SCHEMA"], data[table]["META"], data["persistente"], data[table]["INFO"] = self.carga_datos_querytable(self._prefix, table, None, schema["schema"][table], request, template)
            elif "json" in schema["schema"][table]:
                data[table] = {}
                LAYOUT = {}
                LAYOUT, data[table]["IDENT"], data[table]["DATA"], data[table]["SCHEMA"], data[table]["META"], data[table]["INFO"] = self.carga_datos_jsontable(data[self._prefix]["DATA"][0][schema["schema"][table]["json"]], table, schema["schema"][table])
            elif "prefix" in schema["schema"][table] and save:
                if table in filtros:
                    schema["schema"][table]["querystring"] = filtros[table]
                data[table] = self.carga_datos_prefixschema(table, schema["schema"][table], None, template)
            elif save:
                if table in filtros:
                    schema["schema"][table]["querystring"] = filtros[table]
                data[table] = self.carga_datos_schema(table, schema["schema"][table], None, template)
            if data[table]["INFO"]:
                data["info"].update(data[table]["INFO"])
            data[table]["customfilter"] = self.carga_datos_customfilter(table, schema["schema"][table], request.user)
        return data, schema

    def get_formrecord_data(self, request, pk, template):
        template_list = templateCTX.damechainTemplate(self._aplicacion, self._prefix, template)
        schema = templateCTX.cargaPlantillaJSON(template_list)
        data, filtros, querystring, refresh = self.get_aux_data(request, pk, template, schema)
        data[self._prefix] = self.carga_datos_pk(self._prefix, pk, request.user, template)
        if data[self._prefix]["INFO"]:
            data["info"].update(data[self._prefix]["INFO"])
        data_prefix = data[self._prefix] if pk != "master" or pk != "custom" else None
        validate, response = self.init_validation(schema, template, request, data_prefix)
        if not validate:
            return False, response

        # TODO añadir querystring durante una peticion PUT
        schema["schema"].update(querystring)
        for table in schema["schema"]:
            if "customfilter" in schema["schema"][table]:
                data[self._prefix]["customfilter"] = self.carga_datos_customfilter(table, schema["schema"][table], request.user)
            if table == self._prefix:
                pass
            if "reportTable" in schema["schema"][table]:
                if "report" not in data:
                    data["report"] = {}
                data["report"][table] = self.carga_datos_report(table, schema["schema"][table], pk, template)
            elif "query" in schema["schema"][table]:
                if table in filtros:
                    schema["schema"][table]["query"] = filtros[table]
                data[table] = {}
                LAYOUT = {}
                LAYOUT, data[table]["IDENT"], data[table]["DATA"], data[table]["SCHEMA"], data[table]["META"], data["persistente"], data[table]["INFO"] = self.carga_datos_querytable(self._prefix, table, pk, schema["schema"][table], request, template)
                LAYOUT.update(schema["layout"])
                schema["layout"].update(LAYOUT)
            elif "json" in schema["schema"][table]:
                data[table] = {}
                LAYOUT = {}
                LAYOUT, data[table]["IDENT"], data[table]["DATA"], data[table]["SCHEMA"], data[table]["META"], data[table]["INFO"] = self.carga_datos_jsontable(data[self._prefix]["DATA"][schema["schema"][table]["json"]], table, schema["schema"][table])
                LAYOUT.update(schema["layout"])
                schema["layout"].update(LAYOUT)
            elif "fieldRelation" in schema["schema"][table]:
                if table in filtros:
                    schema["schema"][table] = filtros[table]
                fieldRelation = data[self._prefix]["DATA"][schema["schema"][table]["fieldRelation"]]
                data[table] = self.carga_datos_schema(table, schema["schema"][table], fieldRelation, template)
            else:
                if table in filtros:
                    schema["schema"][table]["querystring"] = filtros[table]
                data[table] = self.carga_datos_schema(table, schema["schema"][table], pk, template)

            if data[table]["INFO"]:
                if data[table]["INFO"]["model"]:
                    if data["info"]["model"]:
                        data["info"]["model"].update(data[table]["INFO"]["model"])
                    else:
                        data["info"]["model"] = data[table]["INFO"]["model"]

                if data[table]["INFO"]["app"]:
                    if data["info"]["app"]:
                        data["info"]["app"].update(data[table]["INFO"]["app"])
                    else:
                        data["info"]["app"] = data[table]["INFO"]["app"]

        return data, schema

    def render_template(self, request, pk, data, schema, template):
        # Validaciones inciales
        superuser = request.user.is_superuser
        msg = filtersPagination._generaMsgFromRequest(request.query_params) or None

        usuario = request.user.username
        groups = request.user.groups.all()
        menu = {}
        try:
            menu = templateCTX.cargaMenuJSON(self._aplicacion + "/menu_" + self._aplicacion + ".json")
        except Exception:
            pass

        history = cacheController.addHistory(request, self._aplicacion, self._prefix, pk, template)
        history = history["list"][history["pos"] - 1] if history["pos"] > 0 else history["list"][history["pos"]]
        app_label = self.get_app_label(self._aplicacion)

        render_obj = {"aplic": self._aplicacion, "prefix": self._prefix, "menu": menu, "data": data, "layout": schema, "msg": msg, "superuser": superuser, "usuario": usuario, "grupos": groups, "history": history, "aplicLabel": app_label, "custom": template}

        if request._method == "PUT":
            return Response(render_obj)

        return render(request, "YBWEB/AQdetail.html", render_obj)

    # METODOS DE INVOCACION POR DEFECTO---------------------------------------------------
    @helpers.decoradores.checkAuthentication
    def invocaAQdashboard(self, request):
        usuario = request.user.username
        superuser = request.user.is_superuser

        history = cacheController.addHistory(request, self._aplicacion, "dashboard", None, None)
        history = history["list"][history["pos"] - 1] if history["pos"] > 0 else history["list"][history["pos"]]
        menu = templateCTX.cargaMenuJSON(self._aplicacion + "/menu_" + self._aplicacion + ".json")
        app_label = self.get_app_label(self._aplicacion)

        menu_items = accessControl.accessControl.dameDashboard(request.user, menu["items"])

        render_obj = {"aplic": self._aplicacion, "menuJson": menu_items, "usuario": usuario, "superuser": superuser, "history": history, "aplicLabel": app_label}

        if len(menu_items) == 1 or ("format" in menu and menu["format"] == "navBarMenu"):
            url = menu_items[0]["URL"]
            return HttpResponseRedirect("/" + url)

        return render(request, "YBWEB/dashboard.html", render_obj)

    @helpers.decoradores.checkAuthentication
    def invocaAQNtemplate(self, request, pk, template):
        data, schema = self.get_formrecord_data(request, pk, template)
        if not data:
            return schema
        return self.render_template(request, pk, data, schema, template)

    @helpers.decoradores.checkAuthentication
    def invocaAQMtemplate(self, request, template):
        data, schema = self.get_master_data(request, template)
        if not data:
            return schema
        return self.render_template(request, "custom", data, schema, template)

    @helpers.decoradores.checkAuthentication
    def invocaAQN(self, request, pk):
        data, schema = self.get_formrecord_data(request, pk, "formRecord")
        if not data:
            return schema
        return self.render_template(request, pk, data, schema, "formRecord")

    @helpers.decoradores.checkAuthentication
    def invocaAQNmaster(self, request):
        data, schema = self.get_master_data(request, "master")
        if not data:
            return schema
        return self.render_template(request, "master", data, schema, None)

    @helpers.decoradores.checkAuthentication
    def formNewRecord(self, request):
        template_list = templateCTX.damechainMasterTemplate(self._aplicacion, self._prefix, "newrecord")
        schema = templateCTX.cargaPlantillaJSON(template_list)

        data = {}
        data["otros"] = {}
        data["persistente"] = {}
        data["default"] = {}
        data["labels"] = {}
        ws = self.get_ws(schema)
        chat = self.carga_datos_chat(request.user.username)
        data["chat"] = chat
        if ws:
            data["ws"] = ws

        data[self._prefix] = self.carga_datos_form_newrecord(self._prefix, request)
        for s in schema["schema"]:
            if "create" in schema["schema"][s] and schema["schema"][s]["create"]:
                data[s] = self.carga_datos_form_newrecord(s, request)
            else:
                data[s] = self.carga_datos_schema(s, schema["schema"][s], None, "newrecord")

        # Validaciones inciales
        msg = filtersPagination._generaMsgFromRequest(request.query_params) or None

        template_name = "newrecord" + self._prefix
        validate, response = self.init_validation(schema, template_name, request, data[self._prefix]["DATA"])
        if not validate:
            return response

        try:
            accion = "init"
            drawIf = schema["drawIf"] if "drawIf" in schema else None
            action = factorias.FactoriaAccion.getAcciones(self._prefix, "O").get(accion, None)
            action_obj = action(diI=drawIf, data=data[self._prefix]["DATA"])
            dIf = action_obj.ejecutarExterna(diI=drawIf, data=data[self._prefix]["DATA"])
        except Exception:
            dIf = {}
            dIf["drawif"] = {}
            dIf["resul"] = False

        # if params:
        #     for name in params:
        #         data[self._prefix]["DATA"][name] = params[name]
        data["drawIf"] = dIf["drawif"]
        data["labels"].update(self.carga_datos_labels(None, request, "newrecord") or {})

        history = cacheController.getHistory(request)
        history = history["list"][history["pos"]]
        usuario = request.user.username
        superuser = request.user.is_superuser
        appLabel = self.get_app_label(self._aplicacion)

        objRender = {"aplic": self._aplicacion, "prefix": self._prefix, "data": data, "layout": schema, "msg": msg, "usuario": usuario, "superuser": superuser, "history": history, "aplicLabel": appLabel}
        if request._method == "PUT":
            return Response(objRender)
        return render(request, "YBWEB/AQdetail.html", objRender)
