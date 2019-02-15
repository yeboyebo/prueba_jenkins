from django.utils.translation import ugettext_lazy as _
# from django.core.exceptions import PermissionDenied as djPermissionDenied
from django.http import HttpResponseRedirect
from django.conf import settings
from django.utils import six
from django.utils.encoding import force_text

from rest_framework.views import exception_handler
from rest_framework.exceptions import *
from rest_framework import status
from rest_framework.compat import set_rollback
from rest_framework.response import Response

from YBUTILS import mylogging as log
from YBUTILS.viewREST import cacheController
"""
    Definicion de excepciones y tratamiento de errores comunes
"""
"""
Se capturaran todas y se devolvera un mensaje 400 si no mas especifico
El mensaje de vuelta tendra la estructura:
 tipo:
    1-Error Arquitectura/API REST
    2-Error de aplicacion
    3-Validacion
    4-Error excepcion capturada
 msg: Mensaje por defecto
 data:Otros datos relevantes
"""


milog = log.getLogger("VIEWREST.error")


def YB_error_handler(cherror, exc):
    print("_________________YBERRORHANDLER_________________")
    print(cherror)
    return "Error inesperado"


def YB_exception_handler(exc, context):
    # print("________________YBEXCEPTIONHANDLER________________")
    errorMsg = exc.__str__() or None
    try:
        milog.info("Excepcion capturada de alto nivel: %s", errorMsg)
        # if settings.DEBUG:
        #     milog.exception(exc)
    except Exception:
        pass

    miresp = {}
    code = status.HTTP_400_BAD_REQUEST
    # tratamiento de errores de validacion
    if isinstance(exc, ValidationError):
        miresp['tipo'] = 3
        miresp['msg'] = [_('Error en los datos recibidos. Revise mensajes adicionales.')]
        miresp['data'] = exc.detail
    elif isinstance(exc, PermissionDenied) or isinstance(exc, NotAuthenticated) or isinstance(exc, AuthenticationFailed):
        return HttpResponseRedirect("/")
        # Cuando falle el login por no tener permisos o no estar autenficiado redirigira a /
        # raise djPermissionDenied
    else:
        cacheError = cacheController.getSessionVariable("ErrorHandler")
        if cacheError:
            response = exception_handler(exc, context)
            print(context['view']._prefix)
            errorMsg = YB_error_handler(cacheError, exc)
            cacheController.dropSessionVariable("ErrorHandler")
        else:
            # Comportamiento por defecto
            response = exception_handler(exc, context)
        if not(response is None):
            # Pasamos a nuestro estandar
            miresp['tipo'] = 1
            miresp['msg'] = [response.data.get('detail', None)]
            response.data = miresp
            return response
        else:
            # Tratamiento de excepciones propias y no controladas por API
            if isinstance(exc, excepcionAplicacion):
                if isinstance(exc, excepcionAplicacionRollBack):
                    set_rollback()
                miresp['tipo'] = 2
                miresp['msg'] = [force_text(errorMsg)]
            else:
                set_rollback()
                miresp['tipo'] = 4
                miresp['msg'] = [force_text(errorMsg)]
    return Response(data=miresp, status=code)


class excepcionAplicacion(Exception):
    def __str__(self):
        return six.text_type(self.args.join(" "))


class excepcionAplicacionRollBack(excepcionAplicacion):
    pass
