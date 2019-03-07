from django.db.models import Field, Model
from django.http import HttpResponseRedirect

from rest_framework import serializers
from rest_framework.response import Response

from YBUTILS.viewREST import factorias
from YBUTILS.viewREST import accion
from YBUTILS.viewREST.accion import ParametroAccion
from YBUTILS.viewREST.accessControl import accessControl


# ------------decoradores para indicar metodos accion en modelos, querySets o Manager------------
class decoradores:

    def checkSystemAuthentication(view_func):
        def decorador(request, *args, **kwargs):
            usuario = request.request.user

            if not usuario.is_authenticated():
                return HttpResponseRedirect('/403')

            if not usuario.is_superuser:
                return HttpResponseRedirect('/403')

            response = view_func(request, *args, **kwargs)
            return response
        return decorador

    def checkAuthentication(view_func):
        def decorador(request, *args, **kwargs):
            # hacer algo antes de responder
            usuario = request.request.user

            if not usuario.is_authenticated():
                return HttpResponseRedirect('/403')

            if not accessControl.checkAccess(request, view_func.__name__, *args, **kwargs):
                return HttpResponseRedirect('/403')

            elif "accion" in kwargs and not accessControl.checkAction(request, view_func.__name__, *args, **kwargs):
                response = Response({"msg": "Error"}, status=401)
                return response

            response = view_func(request, *args, **kwargs)
            return response
        return decorador

    @staticmethod
    def systemAccion(**kwargs):
        """
        Usado para marcar un metodo como accion de sistema.
        """
        def decorator(func):
            # TODO
            func.kwargs = kwargs
            return func
        return decorator

    @staticmethod
    def accion(verbose_name=None, miparam=None, aqparam=None, tipo="I", **kwargs):
        """
        Usado para marcar un metodo como accion.
        """
        def decorator(func):
            func.miparam = miparam
            func.aqparam = aqparam
            func.tipo = tipo
            func.isaccion = True
            func.verbose_name = func.__name__ if (verbose_name is None) else verbose_name
            func.kwargs = kwargs
            return func
        return decorator

    @staticmethod
    def csr(verbose_name=None, **kwargs):
        def decorator(func):
            func.iscsr = True
            func.verbose_name = func.__name__ if (verbose_name is None) else verbose_name
            func.kwargs = kwargs
            return func
        return decorator

    # @staticmethod
    # def campoCalculado(verbose_name=None,campoModelo=None,isList=False):
    #     """
    #     Usado para marcar una funcion como valor calculado a incluir al Serializer defecto
    #     """
    #     def decorator(func):
    #         func.isCC=True
    #         verbose_name2=func.__name__ if (verbose_name is None) else verbose_name
    #         func.miparam=accion.RespuestaFuncion(func.__name__,campoModelo,verbose_name2,isList)
    #         return func
    #     return decorator

    @staticmethod
    def _cambiaParam(param, defaultModel):
        """Este metodo permite convertir los parametros de tipo2 en tipo1
        """
        # Convertimos de formato 2 a formato 1:
        miparam2 = param
        # Puede ser un serializador
        if param and not isinstance(param, serializers.Serializer):
            miparam2 = []
            for parametro in param:
                if isinstance(parametro, ParametroAccion):
                    parametro2 = parametro
                    if not (isinstance(parametro.campoModelo, Field) or isinstance(parametro.campoModelo, Model)):
                        parametro2 = ParametroAccion(defaultModel._meta.get_field(parametro.campoModelo), parametro.nombreParam, parametro.verbose_name, parametro.isList)
                    miparam2.append(parametro2)
                else:  # Presuponemos es cadena del tipo 2
                    aux = parametro.split(":")
                    auxcampo = defaultModel._meta.get_field(aux[1])
                    miparam2.append(accion.ParametroAccion(auxcampo, aux[0]))
        return miparam2


# ------------ Registro de todas las acciones ----------------------------------------------------
def RegistrarAcciones(mimodel, otras=[]):
    """Este accion realiza un registro de todos los elementos en las factorias"""
    # --------------------------FUNCIONES AUXILIARES DE REGISTRO---------------------------------------------
    def _registroSerializador(clase):
        listCC = []
        for attr, item in clase.__dict__.items():
                if callable(item) and hasattr(item, 'isCC'):
                    listCC.append(item.miparam)
        # Lo llamamos para registrarlo
        factorias.FactoriaSerializadoresBase.getRepositorio(prefix, mimodel, listCC)

    def _registroAcciones(clase, tipo):
        for attr, item in clase.__dict__.items():
            if callable(item) and hasattr(item, 'iscsr'):
                getattr(factorias.FactoriaAccion, "regTipoCsr")(mimodel, item, item.verbose_name)
            if callable(item) and hasattr(item, 'isaccion') and item.tipo == "O":
                param = None
                if item.aqparam is not None:
                    param = item.aqparam
                getattr(factorias.FactoriaAccion, "regTipoO")(mimodel, item, item.verbose_name, param)
            if callable(item) and hasattr(item, 'isaccion'):
                if item.aqparam is None:
                    # param = decoradores._cambiaParam(item.miparam, mimodel)
                    param = None
                    getattr(factorias.FactoriaAccion, "regTipo" + tipo)(mimodel, item, item.verbose_name, param)

                elif item.aqparam is not None:
                    getattr(factorias.FactoriaAccion, "regTipoJSON")(mimodel, item, item.verbose_name, item.aqparam)

    # def _registroAccionesJSON(clase, tipo):
    #     """
    #         Registramos las acciones con JSON como parametro, estos parametros no pasaran por el serializador
    #     """
    #     for attr, item in clase.__dict__.items():
    #         if callable(item) and hasattr(item, 'aqparam'):

    def _registroAccionesOtros():
        for miclaseAux in otras:
            factorias.FactoriaAccion.regTipoOExt(prefix, miclaseAux)
    # ------------------------ CUERPO FUNCION
    prefix = mimodel._meta.db_table.lower()

    # REGISTRAMOS SERIALIZADORES DEFECTO PRIMERO
    _registroSerializador(mimodel)

    # REGISTRO ACCIONES DEFECTO(create y update):
    factorias.FactoriaAccion.regTipoEsp(mimodel)
    # REGISTRAMOS ACCIONES PARA MODELO,MANAGER Y QUERYSET
    # _registroAcciones(mimodel, 'I')
    # _registroAccionesJSON(mimodel, 'I')

    # Registramos las acciones individuales de todas las clases de las que hereda
    # ¿Registrar serializador, acciones regTipoEsp, O, Q y otros?
    model2 = mimodel
    while (model2 is not None):
        _registroAcciones(model2, 'I')
        # _registroAccionesJSON(model2, 'I')
        model2 = model2._meta.proxy_for_model

    # SI SE REALIZA CORRECTAMENTE ES LA PRIMERA CLASE BASE
    # try:
    #     _registroAcciones(mimodel.objects.__class__.__bases__[0], 'O')
    # except Exception:
    #     pass
    # try:
    #     _registroAcciones(mimodel.objects._queryset_class, 'Q')
    # except Exception:
    #     pass
    _registroAccionesOtros()


class MixinConAcciones(accion.MixinConAcciones):
    pass
