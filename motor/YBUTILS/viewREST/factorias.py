"""
    Este modulo permite la generacion de las clases de accion, serializadores
    y viewset , almacenando las mismas para su reutilizacion
"""
import importlib
from YBUTILS.viewREST import serializers
from YBUTILS.viewREST import accion

# ---------------------FACTORIA SERIALIZADORES -------------------------------------


def getSerializerClassWithMeta(clase, meta={}, otherdict={}):
    if meta != {}:
        miMeta = type("Serializer_Meta", (object,), meta)
        # Añadimos al serializador el tipo de la pk
        otherdict.update({"Meta": miMeta, "pkType": miMeta.model._meta.pk.__class__.__name__})
    if otherdict != {}:
        miSerializer = type("Serializer", (clase,), otherdict)
        clase = miSerializer
    return clase


def getSerializerClass(meta={}, model=None, addFieldsFuncion=None, claseBaseIN=None, template=None):
    if model is None:
        if meta != {}:
            model = meta.get("model", None)
    claseBase = claseBaseIN
    if claseBase is None:
        if model is None:
            # claseBase = YBSerializer
            pass
        else:
            if isinstance(model, accion.MixinConAcciones):
                claseBase = serializers.YBModelSerializerAccion
            else:
                claseBase = serializers.YBModelSerializer
    if model is not None:
        meta.update({"model": model})
    otherdict = {}

    if addFieldsFuncion:
        dictFunciones = {}
        # TODO PEndiente Crear Serializador Propio que herede de modelField(coja sus propiedades pero llame a funcion)
        for funcion in addFieldsFuncion:
            if funcion.isList:
                dictFunciones.update({funcion.func: serializers.serializers.ListField(child=serializers.serializers.ReadOnlyField(source=funcion.func), label=funcion.verbose_name)})
            else:
                dictFunciones.update({funcion.func: serializers.serializers.ReadOnlyField(label=funcion.verbose_name)})
        otherdict = dictFunciones
    # TODO funciona añadir calculado desde aqui, no se puede poner el mismo nombre en source que en en la clave("calculado"!="my_field")
    # otherdict.update({"calculado":serializers.serializers.ReadOnlyField(label="my_field",source="my_field")})
    return getSerializerClassWithMeta(claseBase, meta, otherdict)


def getSerializerParam(sClave, param, model):
    """
    Construye una clase serializador a partie de una lista de objetos
    PArametroAccion
    campoModelo,nombreParam, verbose_name=None,isList
    """
    dict = {}
    if param:
        for para in param:
            campo = para.campoModelo
            if para.isList:
                dict[para.nombreParam] = serializers.serializers.ListField(child=serializers.serializers.ModelField(campo), label=para.verbose_name)
            else:
                dict[para.nombreParam] = serializers.serializers.ModelField(model_field=campo, label=para.verbose_name)

    # TO DO, me da problemas al generarlo heredero de YBSerializer, lo dejo del base
    return serializers.serializers.SerializerMetaclass(sClave, (serializers.serializers.Serializer,), dict)


class _FactoriaSerializadoresBase(object):

    _repositorio = {}
    _repositorioid = {}
    _viewsets_dict = {}

    def get_app_viewset(self, app):
        if app not in self._viewsets_dict:
            view = importlib.import_module(app + ".viewset.views_" + app)
            objView = view.FormInternalObj()
            objView._class_init()
            views = objView.iface
            objView.iface.ctx = views
            objView.iface.iface = views

            self._viewsets_dict[app] = views

        return self._viewsets_dict[app]

    def getSerializer(self, modelName, model=None, addFieldsFuncion=None, template=None):
        serializer = self.getRepositorio(modelName, model, addFieldsFuncion, template)
        meta_model = serializer.Meta.model
        return serializer, meta_model

    def getRepositorio(self, modelName, model=None, addFieldsFuncion=None, template=None):
        clase = self._repositorio.get("models" + modelName, None)
        # Comprueba si repositorio esta registrado, si no, lo intenta registrar
        if clase is not None:
            return clase
        # Si el modelo no esta registrado lo registra
        clase = getSerializerClass(model=model, addFieldsFuncion=addFieldsFuncion, template=template)
        self._repositorio["models" + modelName] = clase
        self._repositorioid[id(model)] = clase
        return clase

    def getRepositorioByClass(self, model):
            return self._repositorioid.get(id(model), None)

    def getRepositorioWithMeta(self, modelName, model, meta):
        # Tratamiento comun para simplificar
        if (meta is None):
            meta = {}
        # Unificacion si el meta es vacio o tiene solo model
        if (meta == {}) or (len(meta) == 1 and meta.get("model", None) == model):
            return self.getRepositorio(modelName, model)
        else:
            if meta.get("model", None) is None:
                meta["model"] = model
            clase = self._repositorio.get("models" + modelName + str(meta), None)
        if clase is not None:
            return clase
        # Lo generamos a partir de la base
        clase = getSerializerClass(model=model, meta=meta, claseBaseIN=self.getRepositorio(modelName, model))
        if (meta == {}) or (len(meta) == 1 and meta.get("model", None) == model):
            meta = ""
        self._repositorio["models" + modelName + str(meta)] = clase
        return clase


# singleton
FactoriaSerializadoresBase = _FactoriaSerializadoresBase()


# ---------------------FACTORIA ACCIONES -------------------------------------
class _FactoriaAccion(object):
    """Clase que generara las acciones de los distintos tipos
       Se implementara un singleton y almacenara en repositorio
       LAs acciones se clasificaran en :
       I- Individuales (sobre objeto Modelo)
       Q- Sobre Query
       O-Otras (Incluiran las de sobre Model pero no hay que pasarle parametros)
    """
    # Por clave Unica
    _repositorio = {}
    _repositorioAux = {}

    class _generador(object):
        """ Se integran dentro de esta todos los metodo para que no sean visibles
        """

        # Metodos para obtener clases de accion dinamicámente
        @staticmethod
        def dameNombre(nombre):
            return {"name": nombre}

        @staticmethod
        def dameVerboseNombre(nombre):
            return {"verbose_name": classmethod(property(fget=(lambda x: nombre)))}

        @staticmethod
        def dameSerializer(bIN, model, meta={}):
            if bIN:
                nombre = "serializerClassIN"
            else:
                nombre = "serializerClassOUT"
            clase = getSerializerClass(model)
            return {nombre: clase}

        @staticmethod
        def dameSerializer2(bIN, Serializer):
            if bIN:
                nombre = "serializerClassIN"
            else:
                nombre = "serializerClassOUT"
            return {nombre: Serializer}

        @staticmethod
        def dameSerializerkwargs(bIN, dict):
            if bIN:
                nombre = "serializerIN_kwargs"
            else:
                nombre = "serializerOUT_kwargs"
            return {nombre: dict}

        @staticmethod
        def damefuncion_kwargs(dict):
            return {"funcion_kwargs": dict}

        @staticmethod
        def damefunc(func):
            return {"func": func}

        @staticmethod
        def damefuncparam(param_list):
            return {"func_parameters": param_list}

        @staticmethod
        def damemodelo(modelo):
            return {"_modelo": modelo}

        @staticmethod
        def dameprocesasalida(func):
            return {"procesasalida": func}

    # --------METODOS INTENOS----------------------------------------
    def _repositorioClave(self, prefix, name):
        return "models|" + prefix + name

    def _repositorioget(self, clave):
        return self._repositorio.get(clave, None)

    def _repositorioset(self, clave, clase, tipo, prefix, name):
        self._repositorio[clave] = clase
        try:
            self._repositorioAux["models|" + prefix + "|" + str(tipo)].update({name: clase})
        except Exception:
            self._repositorioAux["models|" + prefix + "|" + str(tipo)] = {name: clase}

    def _prefijoDeModelo(self, modelo):
        return modelo._meta.db_table.lower()

    def _nombreDefunc(self, func):
        return func.__name__.lower()

    # --------METODOS VISIBLES PARA GENERAR/Registrar ----------------------------------------
    def regTipoEsp(self, modelo):
        """
        Permite el registro de acciones de creacion,delete y update
        """
        tipo = "O"
        sNombre = "iniciaValores"
        sModelo = self._prefijoDeModelo(modelo)
        sclave = self._repositorioClave(sModelo, sNombre)
        clase = self._repositorioget(sclave)
        if clase is not None:
            return clase

        # CONSTRUIMOS LA CLASE
        dict = {}
        serializerOUT = FactoriaSerializadoresBase.getRepositorio(sModelo, modelo)
        dict.update(self._generador.dameSerializer2(False, serializerOUT))
        dict.update(self._generador.dameSerializer2(True, serializerOUT))
        dict.update(self._generador.damemodelo(modelo))
        dict.update(self._generador.dameprocesasalida(accion.AccionConObjetoFuncionModel.procesasalida1))
        clase = type(sclave, (accion.iniciaValores,), dict)
        self._repositorioset(sclave, clase, tipo, sModelo, sNombre)

        # TODO eliminar
        # tipo = "O"
        # sNombre = "initLabels"
        # sModelo = self._prefijoDeModelo(modelo)
        # sclave = self._repositorioClave(sModelo, sNombre)
        # clase = self._repositorioget(sclave)
        # if clase is not None:
        #     return clase

        # # CONSTRUIMOS LA CLASE
        # dict = {}
        # serializerOUT = FactoriaSerializadoresBase.getRepositorio(sModelo, modelo)
        # dict.update(self._generador.dameSerializer2(False, serializerOUT))
        # dict.update(self._generador.dameSerializer2(True, serializerOUT))
        # dict.update(self._generador.damemodelo(modelo))
        # dict.update(self._generador.dameprocesasalida(accion.AccionConObjetoFuncionModel.procesasalida1))
        # clase = type(sclave, (accion.initLabels,), dict)
        # self._repositorioset(sclave, clase, tipo, sModelo, sNombre)

        # tipo = "O"
        # sNombre = "queryTable"
        # sModelo = self._prefijoDeModelo(modelo)
        # sclave = self._repositorioClave(sModelo, sNombre)
        # clase = self._repositorioget(sclave)
        # if clase is not None:
        #     return clase

        # # CONSTRUIMOS LA CLASE
        # dict = {}
        # serializerOUT = FactoriaSerializadoresBase.getRepositorio(sModelo, modelo)
        # dict.update(self._generador.dameSerializer2(False, serializerOUT))
        # dict.update(self._generador.dameSerializer2(True, serializerOUT))
        # dict.update(self._generador.damemodelo(modelo))
        # dict.update(self._generador.dameprocesasalida(accion.AccionConObjetoFuncionModel.procesasalida1))
        # clase = type(sclave, (accion.queryTable,), dict)
        # self._repositorioset(sclave, clase, tipo, sModelo, sNombre)

        tipo = "O"
        sNombre = "init"
        sModelo = self._prefijoDeModelo(modelo)
        sclave = self._repositorioClave(sModelo, sNombre)
        clase = self._repositorioget(sclave)
        if clase is not None:
            return clase

        # CONSTRUIMOS LA CLASE
        dict = {}
        serializerOUT = FactoriaSerializadoresBase.getRepositorio(sModelo, modelo)
        dict.update(self._generador.dameSerializer2(False, serializerOUT))
        dict.update(self._generador.dameSerializer2(True, serializerOUT))
        dict.update(self._generador.damemodelo(modelo))
        dict.update(self._generador.dameprocesasalida(accion.AccionConObjetoFuncionModel.procesasalida1))
        clase = type(sclave, (accion.init,), dict)
        self._repositorioset(sclave, clase, tipo, sModelo, sNombre)

        tipo = "O"
        sNombre = "bufferchanged"
        sModelo = self._prefijoDeModelo(modelo)
        sclave = self._repositorioClave(sModelo, sNombre)
        clase = self._repositorioget(sclave)
        if clase is not None:
            return clase

        # CONSTRUIMOS LA CLASE
        dict = {}
        serializerOUT = FactoriaSerializadoresBase.getRepositorio(sModelo, modelo)
        dict.update(self._generador.dameSerializer2(False, serializerOUT))
        dict.update(self._generador.dameSerializer2(True, serializerOUT))
        dict.update(self._generador.damemodelo(modelo))
        dict.update(self._generador.dameprocesasalida(accion.AccionConObjetoFuncionModel.procesasalida1))
        clase = type(sclave, (accion.bufferchanged,), dict)
        self._repositorioset(sclave, clase, tipo, sModelo, sNombre)

        tipo = "O"
        sNombre = "clientbufferchanged"
        sModelo = self._prefijoDeModelo(modelo)
        sclave = self._repositorioClave(sModelo, sNombre)
        clase = self._repositorioget(sclave)
        if clase is not None:
            return clase

        # CONSTRUIMOS LA CLASE
        dict = {}
        serializerOUT = FactoriaSerializadoresBase.getRepositorio(sModelo, modelo)
        dict.update(self._generador.dameSerializer2(False, serializerOUT))
        dict.update(self._generador.dameSerializer2(True, serializerOUT))
        dict.update(self._generador.damemodelo(modelo))
        dict.update(self._generador.dameprocesasalida(accion.AccionConObjetoFuncionModel.procesasalida1))
        clase = type(sclave, (accion.clientbufferchanged,), dict)
        self._repositorioset(sclave, clase, tipo, sModelo, sNombre)

        tipo = "O"
        sNombre = "create"
        sModelo = self._prefijoDeModelo(modelo)
        sclave = self._repositorioClave(sModelo, sNombre)
        clase = self._repositorioget(sclave)
        if clase is not None:
            return clase

        # CONSTRUIMOS LA CLASE
        dict = {}
        serializerOUT = FactoriaSerializadoresBase.getRepositorio(sModelo, modelo)
        dict.update(self._generador.dameSerializer2(False, serializerOUT))
        dict.update(self._generador.dameSerializer2(True, serializerOUT))
        dict.update(self._generador.damemodelo(modelo))
        dict.update(self._generador.dameprocesasalida(accion.AccionConObjetoFuncionModel.procesasalida1))
        clase = type(sclave, (accion.create,), dict)
        self._repositorioset(sclave, clase, tipo, sModelo, sNombre)

        tipo = "I"
        sNombre = "update"
        sModelo = self._prefijoDeModelo(modelo)
        sclave = self._repositorioClave(sModelo, sNombre)
        clase = self._repositorioget(sclave)
        if clase is not None:
            return clase

        # CONSTRUIMOS LA CLASE
        dict = {}
        serializerOUT = FactoriaSerializadoresBase.getRepositorio(sModelo, modelo)
        dict.update(self._generador.dameSerializer2(False, serializerOUT))
        dict.update(self._generador.dameSerializer2(True, serializerOUT))
        dict.update(self._generador.damemodelo(modelo))
        dict.update(self._generador.dameprocesasalida(accion.AccionConObjetoFuncionModel.procesasalida1))
        clase = type(sclave, (accion.update,), dict)
        self._repositorioset(sclave, clase, tipo, sModelo, sNombre)

        tipo = "I"
        sNombre = "delete"
        sModelo = self._prefijoDeModelo(modelo)
        sclave = self._repositorioClave(sModelo, sNombre)
        clase = self._repositorioget(sclave)
        if clase is not None:
            return clase

        # CONSTRUIMOS LA CLASE
        dict = {}
        dict.update(self._generador.damemodelo(modelo))
        clase = type(sclave, (accion.delete,), dict)
        self._repositorioset(sclave, clase, tipo, sModelo, sNombre)

    def regTipoI(self, modelo, func, verbose_name=None, param=[]):
        """ Registra Acciones de tipo 2
            Son Metodos con parametros del Model
            Los parametros sera una lista de de la forma:
                 campoModelo: (Si es una cadena se tomara del modelo actual)
                 nombreParam:Nombre parametro recibido por la funcion
                 verbose_name:Nombre del campo del modelo
            (Alternativamente se le podra pasar una clase Serializador)
        """
        sNombre = self._nombreDefunc(func)
        sModelo = self._prefijoDeModelo(modelo)
        sclave = self._repositorioClave(sModelo, sNombre)
        clase = self._repositorioget(sclave)
        # JUANMA lo he comentado por que no dejaba registrar un tipo I  y un tipo O con el mismo nombre
        # if clase is not None:
        #     return clase
        # CONSTRUIMOS LA CLASE
        dict = {}
        dict.update(self._generador.dameNombre(sNombre))
        dict.update(self._generador.dameVerboseNombre(verbose_name))
        serializerIN = None
        if isinstance(param, serializers.serializers.BaseSerializer):
            serializerIN = param
        else:
            if param and param != []:
                serializerIN = getSerializerParam(sclave + "IN", param, modelo)
        dict.update(self._generador.dameSerializer2(True, serializerIN))
        if serializerIN:
            dict.update(self._generador.damefuncparam(list(serializerIN._declared_fields.keys())))
        serializerOUT = FactoriaSerializadoresBase.getRepositorio(sModelo, modelo)
        dict.update(self._generador.dameSerializer2(False, serializerOUT))
        dict.update(self._generador.damefunc(func))
        dict.update(self._generador.damemodelo(modelo))
        dict.update(self._generador.dameprocesasalida(accion.AccionConObjetoFuncionModel.procesasalida1))
        clase = type(sclave, (accion.AccionConObjetoFuncionModel,), dict)
        self._repositorioset(sclave, clase, "I", sModelo, sNombre)
        return clase

    def regTipoJSON(self, modelo, func, verbose_name=None, param=None):
        """ Registra Acciones de con JSON como parametro
            Son Metodos con parametros del Model
            El ejecutar de estas acciones sera el de accionConObjetoFuncion
        """
        sNombre = self._nombreDefunc(func)
        sModelo = self._prefijoDeModelo(modelo)
        sclave = self._repositorioClave(sModelo, sNombre)
        clase = self._repositorioget(sclave)
        if clase is not None:
            return clase
        # CONSTRUIMOS LA CLASE
        dict = {}
        dict.update(self._generador.dameNombre(sNombre))
        dict.update(self._generador.dameVerboseNombre(verbose_name))
        dict.update({"func_parameters": param})
        serializerOUT = FactoriaSerializadoresBase.getRepositorio(sModelo, modelo)
        dict.update(self._generador.dameSerializer2(False, serializerOUT))
        dict.update(self._generador.damefunc(func))
        dict.update(self._generador.damemodelo(modelo))
        dict.update(self._generador.dameprocesasalida(accion.AccionConObjetoFuncionModel.procesasalida1))
        clase = type(sclave, (accion.AccionConObjetoFuncionModel,), dict)
        self._repositorioset(sclave, clase, "I", sModelo, sNombre)
        return clase

    def regTipoQ(self, modelo, func, verbose_name=None, param=[]):
        """ Registra Acciones de tipo 5
            Son Metodos con parametros del QueryString
            Los parametros sera una lista de ParamAccion
            (Alternativamente se le podra pasar una clase Serializador)
        """

        sNombre = self._nombreDefunc(func)
        sModelo = self._prefijoDeModelo(modelo)
        sclave = self._repositorioClave(sModelo, sNombre)
        clase = self._repositorioget(sclave)
        if clase is not None:
            return clase
        # CONSTRUIMOS LA CLASE
        dict = {}
        dict.update(self._generador.dameNombre(sNombre))
        dict.update(self._generador.dameVerboseNombre(verbose_name))
        serializerIN = None
        if isinstance(param, serializers.serializers.BaseSerializer):
            serializerIN = param
        else:
            if param and param != []:
                serializerIN = getSerializerParam(sclave + "IN", param, modelo)
        if serializerIN:
            dict.update(self._generador.dameSerializer2(True, serializerIN))
            dict.update(self._generador.damefuncparam(list(serializerIN._declared_fields.keys())))
        serializerOUT = FactoriaSerializadoresBase.getRepositorio(sModelo, modelo)
        dict.update(self._generador.dameSerializer2(False, serializerOUT))
        dict.update(self._generador.dameSerializerkwargs(False, {"many": True}))
        dict.update(self._generador.damefunc(func))
        dict.update(self._generador.damemodelo(modelo))
        # No dara como salida la lista de objetos o si. De principio no
        dict.update(self._generador.dameprocesasalida(accion.AccionConObjetoFuncionModel.procesasalida2))
        clase = type(sclave, (accion.AccionConObjetoFuncionModel,), dict)
        self._repositorioset(sclave, clase, "Q", sModelo, sNombre)
        return clase

    def regTipoO(self, modelo, func, verbose_name=None, param=[]):
        """ Registra Acciones de tipo 7
            Son Metodos con parametros del ModelManager
            (Alternativamente se le podra pasar una clase Serializador)
        """

        sNombre = self._nombreDefunc(func)
        sModelo = self._prefijoDeModelo(modelo)
        sclave = self._repositorioClave(sModelo, sNombre)
        clase = self._repositorioget(sclave)
        if clase is not None:
            return clase
        # CONSTRUIMOS LA CLASE
        dict = {}
        dict.update(self._generador.dameNombre(sNombre))
        dict.update(self._generador.dameVerboseNombre(verbose_name))
        # serializerIN = None
        # if isinstance(param, serializers.serializers.BaseSerializer):
        #     serializerIN = param
        # else:
        #     if param and param != []:
        #         serializerIN = getSerializerParam(sclave + "IN", param, modelo)
        # if serializerIN:
        #     dict.update(self._generador.dameSerializer2(True, serializerIN))
        #     dict.update(self._generador.damefuncparam(list(serializerIN._declared_fields.keys())))
        # serializerOUT = FactoriaSerializadoresBase.getRepositorio(sModelo, modelo)
        dict.update({"func_parameters": param})
        dict.update(self._generador.damefunc(func))
        dict.update(self._generador.damemodelo(modelo))
        dict.update(self._generador.dameprocesasalida(accion.AccionConObjetoFuncionModel.procesasalida3))
        clase = type(sclave, (accion.AccionConObjetoFuncionModel,), dict)
        self._repositorioset(sclave, clase, "O", sModelo, sNombre)
        return clase

    def regTipoOExt(self, prefix, clase):
        """ Registra Acciones de tipo 8 o 9
            Seran acciones herederas de Accion
        """
        sclave = self._repositorioClave(prefix, clase.name)
        clase = self._repositorioget(sclave)
        if clase is not None:
            return clase
        # CONSTRUIMOS LA CLASE
        self._repositorioset(sclave, clase, "O", prefix, clase.name)
        return clase

    def regTipoCsr(self, modelo, func, verbose_name=None):
        sNombre = self._nombreDefunc(func)
        sModelo = self._prefijoDeModelo(modelo)
        sclave = self._repositorioClave(sModelo, sNombre)
        clase = self._repositorioget(sclave)
        # if clase is not None:
        #     return clase
        clase = func
        self._repositorioset(sclave, clase, "csr", sModelo, sNombre)
        return clase

    # --------METODOS DE CONSULTA---------------------------------------------------
    def getAcciones(self, prefix, tipo):
        """
        Retorna un diccionario de acciones
        """
        return self._repositorioAux.get("models|" + prefix + "|" + str(tipo), {})

    def getAccionNom(self, prefix, nombre):
        return self._repositorio.get(self._repositorioClave(prefix, nombre))

    def getAccionqueryTable(self):
        return accion.queryTable


FactoriaAccion = _FactoriaAccion()
