import collections
import importlib

from django.db import transaction
from django.db.models.fields import NOT_PROVIDED
from django.utils.translation import ugettext_lazy as _
from django.contrib.sessions import *

from rest_framework.fields import empty

from YBLEGACY import qsatype
from YBLEGACY.FLSqlCursor import FLSqlCursor
from YBLEGACY.FLUtil import FLUtil
from YBLEGACY.FLManager import FLManager
from YBLEGACY.constantes import ustr
from YBUTILS import mylogging as log
from YBUTILS.viewREST import filtersPagination
from YBUTILS.viewREST import cacheController
from YBUTILS.viewREST import clasesBase

# Definicion de parametro de accion o Salida de Una funcion -----------------------------------------------------------------


class ParametroAccion(collections.namedtuple("ParamAccion2", ["campoModelo", "nombreParam", "verbose_name", "isList"])):
    """ Esta clase permite la definicion de parametros de entrada (serializadores) manera rapida a partir de
    elementos de modelos)
    """
    def __new__(cls, campoModelo, nombreParam, verbose_name=None, isList=False):
        return super().__new__(cls, campoModelo, nombreParam, verbose_name, isList)


class RespuestaFuncion(collections.namedtuple("RespuestaFuncion2", ["func", "campoModelo", "verbose_name", "isList"])):
    """ Esta clase permite la definicion de parametros de entrada (serializadores) manera rapida a partir de
    elementos de modelos)
    """
    def __new__(cls, func, campoModelo, verbose_name=None, isList=False):
        return super().__new__(cls, func, campoModelo, verbose_name, isList)


# ------- Mixin para gestion dinamica de acciones -------
class MixinConAcciones(object):
    """Esta clase permite definir un objeto con acciones
    Simplemente permite enumerarlas y establece un metodo para que se indique si alguna no
    es activa"""

    def getAccionesNoActivas(self):
        """ Este metodo se tendra que sobreescribir si depende del estado las acciones posibles
            Se podra llamar al super y hacer pop de todas las acciones no activas
         """
        return []

    def getAccionesNoPermitidas(self, User):
        """ Este metodo se tendra que sobreescribir si las acciones dependen de los permisos
            del usuario.
        """
        return []

    @classmethod
    def _getAcciones(cls):
        """ Obtiene las acciones de una clase
            Lo alamacena dentro de un atributo interno para no calcularlo cada vez
        """
        try:
            return getattr(cls, "_YB_Acciones")
        except Exception:
            aux = {}
            for attr, item in cls.__dict__.items():
                if callable(item) and hasattr(item, "isaccion"):
                    aux[item.__name__] = {"verbose_name": item.verbose_name}
            setattr(cls, "_YB_Acciones", aux)
            return aux


# Clases de acciones -------------------------------------
class Accion(log.logMixin):
    """ Una accion sera similar al patron de comando.
        Tendra un nombre y un metodo ejecutarInterno que recibira una coleccion de datos tipo kwarg
        Opcionalmente:
            -Serializador de entrada para validar datos
            -Serializador de salida si los datos son de tipo Model
        El serializador sera una clase y se podran dar kwargs adicionales a pasar en la instanciacion del objeto.
        Las acciones se construiran mediante la Factoria de clases normalmente.

    """
    # METODOS INTERNOS -------------------------

    def __init__(self, *args, **kwargs):
        super().__init__(self, *args, **kwargs)

    def datosValidados(self, data):
        """
            Validamos parametros con serializador
            Si el parametro es un oParam, no es necesario pasaro por serializador
        """
        if "oParam" in data:
            return data
        serializer = self.getSerializer(bIN=True, data=data)
        if serializer:
            try:
                serializer.is_valid(raise_exception=True)
                return serializer.validated_data
            except Exception:
                self.log.error("ERROR DE VALIDACION %s", serializer.errors)
                raise
        return None

    @classmethod
    def getSerializer(cls, bIN=True, instance=None, data=None):
        # Si no requiere validarlo
        if data is None:
            data = empty
        if bIN:
            clase = cls.serializerClassIN
            if clase:
                return clase(instance=instance, data=data, **cls.serializerIN_kwargs)
            else:
                return None
        else:
            clase = cls.serializerClassOUT
            if clase:
                return clase(instance=instance, data=data, **cls.serializerOUT_kwargs)
            else:
                return None

    @transaction.atomic
    def ejecutarExterna(self, inJSONLike, request, aux=None):
        try:
            resul = self.ejecutar(inJSONLike, request, aux)
            if not resul and resul != [] and resul != {}:
                raise NameError("Acción {} sin resultado".format(self.name))
        except NameError as e:
            raise
        except Exception as e:
            raise NameError("Error en acción {}: {}".format(self.name, e))

        return self.procesasalida(resul)

    # METODOS SOBREESCRIBIBLES -------------------------

    def procesasalida(self, resul):
        """Procesara la salida de la funcion
        """
        return resul

    def ejecutar(self, inJSONLike, request):
        """ Este metodo se sobreescribira en las clases bases """
        return self.ejecutarInterna(self.datosValidados(inJSONLike), **self.funcion_kwargs)

    def ejecutarInterna(self, inJSONLikeValidated, *args, **kwargs):
        """Este metodo debera implementarse"""
        raise NotImplementedError("Metodo de ejecutar no implementado en Accion")

    name = "NOMBRE"
    """El nombre de la accion"""

    verbose_name = ""
    """El nombre de la clase sera el nombre de accion de principio"""

    serializerClassIN = None
    serializerClassOUT = None
    serializerOUT_kwargs = {}
    serializerIN_kwargs = {}
    funcion_kwargs = {}


class AccionConObjeto(Accion):
    """
    Esta clase permitira la Ejecucion de una accion que incluya un objeto(Lease model...).
    """

    def ejecutar(self, inJSONLike, request):
        return self.ejecutarInterna(self.getObject(), self, self.datosValidados(inJSONLike), **self._funcion_kwargs)

    # METODOS SOBREESCRIBIBLES--- --------------------------------------------------------------
    # def ejecutarInterna(self,obj,inJSONLike,*args,**kwargs):
    #    """Este metodo debera implementarse"""
    #    raise NotImplementedError("Metodo de ejecutar no implementado en Accion")

    # def getObject(self):
    #    """Este metodo debera implementarse"""
    #    raise NotImplementedError("Metodo de ejecutar no implementado en Accion")


class AccionFuncion(Accion):
    """ Permitira definir una accion a partir de una funcion
    """

    @staticmethod
    def obtenerKwargs(datos, listaParam, obj=None):
        dict = {}
        for nomvalor in listaParam:
            if nomvalor == "sessionUser":
                dict[nomvalor] = FLUtil.nameUser()
            elif nomvalor == "oParam":
                dict[nomvalor] = datos[nomvalor]
            elif nomvalor == "cursor":
                # TODO usar la funcion getCursor
                model = obj.getObject()
                cursor = FLSqlCursor(model._meta.db_table)
                cursor.select(ustr(model._meta.pk.name, " = '", obj._pk, "'"))
                cursor.setModeAccess(cursor.Edit)
                cursor.refreshBuffer()
                if cursor.first():
                    dict["cursor"] = cursor
                else:
                    dict["cursor"] = None
            else:
                pass

        return dict

    def ejecutar(self, inJSONLike, request):
        dict2 = self.obtenerKwargs(self.datosValidados(inJSONLike), self.func_parameters)
        dict2.update(self.funcion_kwargs)
        func2 = self.__class__.__dict__["func"]
        return func2(**dict2)

    # METODOS SOBREESCRIBIBLES --------------------------
    func = None
    func_parameters = None


class AccionConObjetoFuncion(AccionFuncion):

    def ejecutar(self, inJSONLike, request, aux=None):
        func2 = self.__class__.__dict__["func"]
        if self.func_parameters is None:
            if aux:
                return func2(self.getObject(), aux["POST"])
            return func2(self.getObject())
        else:
            dict2 = AccionFuncion.obtenerKwargs(self.datosValidados(inJSONLike), self.func_parameters, self)
            # dict2.update({"user": request.user.username})
            dict2.update(self.funcion_kwargs)
            # Quitar el objdictJSON si cambiamos el tipo de param
            # dict2 = ObjDictJSON.ObjDictJSON(dict2)
            return func2(self.getObject(), **dict2)
            # return func2(self.getObject(),dict2)

    # METODOS SOBREESCRIBIBLES -------------------------
    # def getObject(self):
    #    """Este metodo debera implementarse"""
    #    raise NotImplementedError("Metodo de ejecutar no implementado en Accion")


class MixinAccionModel(object):
    """
        Esta clase estara ligada a un modelo
        Permitira la ejecucion para un elemento o varios
        requiere en su inicializacion:
            pk o query (si no se indica ninguno de ellos se pundra el metodo es
            del Model

    """
    _modelo = None

    def __init__(self, *args, **kwargs):
        """Esto permitira indicar el objeto de modelo
        o query seleccionada"""
        self._pk = kwargs.pop("pk", None)
        # La query poseera dos atributos
        # filter y order, que seran diccionarios que se pasaran a filter/order
        self._query = kwargs.pop("query", None)

    def getObject(self):
        if self._pk:
            return self._modelo.objects.get(pk=self._pk)
        else:
            if self._query:
                return self._modelo.objects.all().filter(**self._query.get("FILTER", {})).order_by(*self._query.get("ORDER", []))
            else:
                return self._modelo.objects

    # METODOS SOBREESCRIBIBLES--------------------------------
    @classmethod
    @property
    def modelo(cls):
        return None


class AccionConObjetoFuncionModel(AccionConObjetoFuncion, MixinAccionModel):

    # FuncionesDefectoParaProcesarsalida
    def procesasalida1(self, resul):
        instance = self.getObject()
        serializer = self.getSerializer(False, instance=instance)
        dict = {}
        dict["data"] = serializer.data
        dict["resul"] = resul
        return dict

    # Especial para metods del querySet
    def procesasalida2(self, resul):
        dict = {}
        if isinstance(resul, QuerySet):
            self.serializerOUT_kwargs.update({"many": True})
            serializer = self.getSerializer(False, instance=resul)
            dict["data"] = serializer.data
        else:
            dict["resul"] = resul
        return dict

    # Especial para acciones de tipo O
    def procesasalida3(self, resul):
        dict = {}
        dict["resul"] = resul
        return dict


class init(AccionConObjetoFuncion, MixinAccionModel):
    name = "init"
    verbose_name = _("Iniciar")

    def ejecutarExterna(self, pk=None, data=None, masterFilter=False, diI={}):
        dict = {}
        dict["drawif"] = None
        dict["resul"] = False

        # Guardamos el drawIf de entrada en cache
        cacheController.setSessionVariable("drawIf", diI)

        modelo = self._modelo._meta.db_table
        cursor = FLSqlCursor(modelo)

        if pk:
            cursor.select(self._modelo._meta.pk.name + " = '" + pk + "'")
            if not cursor.first():
                return dict
            cursor.setModeAccess(cursor.Browse)
            cursor.refreshBuffer()
        elif data:
            cursor.setActivatedBufferChanged(False)
            cursor.setModeAccess(cursor.Edit)
            cursor.refreshBuffer()

            for d in data:
                cursor.setValueBuffer(d, data[d])
        elif masterFilter:
            where, order = clasesBase.dameParamsFiltros(masterFilter)
            cursor.select(where or "1 = 1")

        diO = clasesBase.getDrawIf(diI, self._modelo, cursor)

        dict["drawif"] = diO
        dict["resul"] = True
        return dict


class iniciaValores(AccionConObjetoFuncion, MixinAccionModel):
    name = "iniciaValores"
    verbose_name = _("Iniciar valores")

    def ejecutarExterna(self, request=None):
        params = None
        params = filtersPagination._generaParamFromRequest(request.query_params)

        modelo = self._modelo._meta.db_table
        cursor = FLSqlCursor(modelo)
        cursor.setModeAccess(cursor.Insert)
        cursor.refreshBuffer()

        try:
            cursor.setActivatedBufferChanged(True)
            if params:
                for name in params:
                    cursor.setValueBuffer(name, params[name])

            cursor.inicia_valores_cursor_signal()
            cursor.setActivatedBufferChanged(False)
        except Exception as exc:
            print("Exc", exc)

        inJSONLike = {}
        inJSONLike["data"] = {}
        fieldList = FLManager().metadata(modelo).fieldList().split(",")
        # TODO Si es una fecha/hora tiene null=False y esta vacio poner fecha/hora actual
        for f in fieldList:
            v = cursor.valueBuffer(f)
            try:
                field = self._modelo._meta.get_field(f)
                default = getattr(field, "default", None)
                if default is not None and not v:
                    if default != NOT_PROVIDED:
                        v = default
                if (field.get_internal_type() == "FloatField" or field.get_internal_type() == "DecimalField") and not v:
                    v = 0
                if field.get_internal_type() == "DateField" and not getattr(field, "null", True) and not v:
                    v = str(qsatype.Date())[:10]
                if field.get_internal_type() == "TimeField" and not getattr(field, "null", True) and not v:
                    v = str(qsatype.Date())[-8:]
            except Exception as e:
                print(e)
            inJSONLike["data"][f] = v
        inJSONLike["data"]["pk"] = cursor.valueBuffer(self._modelo._meta.pk.name)

        dict = {}
        dict["data"] = inJSONLike["data"]
        dict["resul"] = True
        return dict


class bufferchanged(AccionConObjetoFuncion, MixinAccionModel):
    name = "bufferchanged"
    verbose_name = _("Buffer Changed")

    def ejecutarExterna(self, inJSONLike, request=None):
        modelo = self._modelo._meta.db_table
        cursor = FLSqlCursor(modelo)
        cursor.setModeAccess(cursor.Edit)
        cursor.refreshBuffer()

        for p in inJSONLike["data"]:
            if not inJSONLike["data"][p] and inJSONLike["data"][p] != 0:
                inJSONLike["data"][p] = None
            cursor.setValueBuffer(p, inJSONLike["data"][p])

        try:
            cursor.setActivatedBufferChanged(True)
            cursor.buffer_changed_signal(inJSONLike["field"])
            cursor.setActivatedBufferChanged(False)
        except Exception as exc:
            print("Exc", exc)
            pass

        diI = cacheController.getSessionVariable("drawIf")
        diO = clasesBase.getDrawIf(diI, self._modelo, cursor)

        fieldList = FLManager().metadata(modelo).fieldList().split(",")
        inJSONLike["data"] = {}
        for f in fieldList:
            inJSONLike["data"][f] = cursor.valueBuffer(f)

        inJSONLike["data"]["pk"] = cursor.valueBuffer(self._modelo._meta.pk.name)

        inJSONLike["labels"] = {}
        try:
            inJSONLike["labels"] = cursor.buffer_changed_label_signal(inJSONLike["field"])
        except Exception as exc:
            print("Exc", exc)

        dict = {}
        dict["data"] = inJSONLike["data"]
        dict["labels"] = inJSONLike["labels"]
        dict["drawif"] = diO
        dict["resul"] = True
        return dict


class clientbufferchanged(AccionConObjetoFuncion, MixinAccionModel):
    name = "clientbufferchanged"
    verbose_name = _("Client Buffer Changed")

    def ejecutarExterna(self, inJSONLike, request=None):
        field = inJSONLike["field"]
        prefix = inJSONLike["prefix"]
        if "pk" in inJSONLike:
            pk = inJSONLike["pk"]
        else:
            pk = "newRecord"
        template = inJSONLike["template"] or None

        nFunc = None
        if template and template is not None and template != "" and template != "formRecord":
            nFunc = prefix + "_" + template
        elif pk == "newRecord":
            nFunc = pk + "_" + prefix
        elif pk == "master":
            nFunc = "form" + prefix
        else:
            nFunc = "formRecord" + prefix

        dict = {}
        dict["otros"] = inJSONLike["otros"]
        dict["labels"] = inJSONLike["labels"]
        dict["drawIf"] = inJSONLike["drawIf"]
        dict["data"] = inJSONLike["data"] if "data" in inJSONLike else {}
        dict["resul"] = True
        try:
            if nFunc:
                model = importlib.import_module("models.models.clientBch")
                objeto = model.FormInternalObj()
                objeto._class_init()
                oObj = objeto.iface
                objeto.iface.ctx = oObj
                objeto.iface.iface = oObj
                if objeto:
                    func = getattr(objeto.iface, nFunc, None)
                    if func is not None:
                        dict = func(fN=field, dict=dict, prefix=prefix, pk=pk)
                        dict["resul"] = True
        except Exception as e:
            print("Exc", e)
            return False

        return dict


class create(AccionConObjetoFuncion, MixinAccionModel):
    name = "create"
    verbose_name = _("Crear")

    @transaction.atomic
    def ejecutarExterna(self, inJSONLike, request=None):
        mainPrefix = self._modelo._meta.db_table
        pkName = self._modelo._meta.pk.name

        modelos = [mainPrefix]
        if "multiForm" in inJSONLike and inJSONLike["multiForm"]:
            for m in inJSONLike:
                if m != "multiForm" and m != mainPrefix:
                    modelos.append(m)

        if pkName in inJSONLike[mainPrefix]:
            inJSONLike[mainPrefix][pkName] = str(inJSONLike[mainPrefix][pkName])
            inJSONLike[mainPrefix]["pk"] = inJSONLike[mainPrefix][pkName]

        for m in modelos:
            cursor = FLSqlCursor(m)
            cursor.setModeAccess(cursor.Insert)
            cursor.refreshBuffer()

            for p in inJSONLike[m]:
                if not inJSONLike[m][p] and inJSONLike[m][p] != 0:
                    inJSONLike[m][p] = None
                cursor.setValueBuffer(p, inJSONLike[m][p])
            validate_cursor = cursor.validate_cursor_signal()
            if not validate_cursor:
                print("No validate")
                error = FLUtil.msgError()
                if error:
                    resul = {}
                    resul["status"] = -31
                    resul["msg"] = error
                    return resul
                raise ValueError("No validate")
            else:
                if (not isinstance(validate_cursor, bool) and "resul" in validate_cursor):
                    fieldList = FLManager().metadata(m).fieldList().split(",")
                    validate_cursor["resul"]["data"] = {}
                    for f in fieldList:
                        validate_cursor["resul"]["data"][f] = cursor.valueBuffer(f)
                    print(validate_cursor)
                    return validate_cursor

            if not cursor.cursor_accepted_signal():
                print("No accepted", m)
                raise ValueError("No accepted " + m)

            cursor.setActivatedBufferCommited(True)
            if not cursor.commitBuffer():
                print("No commit", m)
                raise ValueError("No valid insert " + m)

            pk = inJSONLike[m]["pk"]
            fieldList = FLManager().metadata(m).fieldList().split(",")
            inJSONLike[m] = {}
            for f in fieldList:
                inJSONLike[m][f] = cursor.valueBuffer(f)
            inJSONLike[m]["pk"] = pk

        cursor = FLSqlCursor(mainPrefix)
        select = pkName + " = '" + inJSONLike[mainPrefix]["pk"] + "'"

        cursor.select(select)
        if not cursor.first():
            raise ValueError("No record find")
        cursor.setModeAccess(cursor.Edit)
        cursor.refreshBuffer()

        if not cursor.validate_transaction_signal():
            print("No validate transaction")
            raise ValueError("No validate transaction")

        dict = {}
        dict["data"] = inJSONLike
        dict["resul"] = True
        return dict


class update(Accion, MixinAccionModel):
    name = "update"
    verbose_name = _("Modificar")

    @transaction.atomic
    def ejecutarExterna(self, inJSONLike, request=None):
        mainPrefix = self._modelo._meta.db_table
        pkName = self._modelo._meta.pk.name

        modelos = [mainPrefix]
        if "multiForm" in inJSONLike and inJSONLike["multiForm"]:
            for m in inJSONLike:
                if m != "multiForm" and m != mainPrefix:
                    modelos.append(m)

        if pkName in inJSONLike[mainPrefix]:
            inJSONLike[mainPrefix][pkName] = str(inJSONLike[mainPrefix][pkName])
            inJSONLike[mainPrefix]["pk"] = inJSONLike[mainPrefix][pkName]

        for m in modelos:
            cursor = FLSqlCursor(m)
            select = pkName + " = '" + str(inJSONLike[m]["pk"]) + "'"

            cursor.select(select)
            if not cursor.first():
                raise ValueError("No record find")
            cursor.setModeAccess(cursor.Edit)
            cursor.refreshBuffer()
            for p in inJSONLike[m]:
                if not inJSONLike[m][p] and inJSONLike[m][p] != 0:
                    inJSONLike[m][p] = None
                cursor.setValueBuffer(p, inJSONLike[m][p])

            validate_cursor = cursor.validate_cursor_signal()
            if not validate_cursor:
                print("No validate")
                error = FLUtil.msgError()
                if error:
                    resul = {}
                    resul["status"] = -31
                    resul["msg"] = error
                    return resul
                raise ValueError("No validate")
            else:
                if (not isinstance(validate_cursor, bool) and "resul" in validate_cursor):
                    fieldList = FLManager().metadata(m).fieldList().split(",")
                    validate_cursor["resul"]["data"] = {}
                    for f in fieldList:
                        validate_cursor["resul"]["data"][f] = cursor.valueBuffer(f)
                    print(validate_cursor)
                    return validate_cursor

            if not cursor.cursor_accepted_signal():
                print("No accepted")
                raise ValueError("No accepted")

            cursor.setActivatedBufferCommited(True)
            if not cursor.commitBuffer():
                print("No commit")
                raise ValueError("No valid update")

            pk = inJSONLike[m]["pk"]
            fieldList = FLManager().metadata(m).fieldList().split(",")
            inJSONLike[m] = {}
            for f in fieldList:
                inJSONLike[m][f] = cursor.valueBuffer(f)
            inJSONLike[m]["pk"] = pk

        dict = {}
        dict["data"] = inJSONLike
        dict["resul"] = True
        return dict


class delete(Accion, MixinAccionModel):
    name = "delete"
    verbose_name = _("Eliminar")

    @transaction.atomic
    def ejecutarExterna(self, inJSONLike, request=None):
        instance = self.getObject()
        modelo = self._modelo._meta.db_table

        cursor = FLSqlCursor(modelo)
        select = self._modelo._meta.pk.name + " = '" + str(instance.pk) + "'"

        cursor.select(select)
        if not cursor.first():
            raise ValueError("No record find")

        cursor.setModeAccess(cursor.Del)
        cursor.refreshBuffer()

        cursor.setActivatedBufferCommited(True)
        if not cursor.commitBuffer():
            print("No commit")
            raise ValueError("No valid delete")

        inJSONLike["pk"] = instance.pk

        dict = {}
        dict["data"] = inJSONLike
        dict["resul"] = True
        return dict


class generaCursor:

    @classmethod
    def getCursor(cls, model, pk):
        cursor = FLSqlCursor(model._meta.db_table)
        cursor.select(ustr(model._meta.pk.name, " = '", pk, "'"))
        cursor.setModeAccess(cursor.Edit)
        cursor.refreshBuffer()
        if cursor.first():
            return cursor
        else:
            return None

        return False
