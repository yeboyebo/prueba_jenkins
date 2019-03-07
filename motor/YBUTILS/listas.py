"""
Permite el uso de listas codigo / descripcion
Para su uso:

"""
from django.conf import settings
import django.utils.translation
import django.core.context_processors
from YBWEB import ctxJSON
from django.template import loader
from django.utils.functional import lazy
from functools import lru_cache
from django.views.decorators.cache import cache_page
from django.utils import timezone
from django.views.decorators.http import last_modified
from django.http import HttpResponse
# ----------------------------DECORADOR----------------------------------------------------


# ----------------------------PRIVADO----------------------------------------------------
class _RepositorioListas(object):
    # TO DO Evaluar si el almacenamiento se realiza en REDIS o similar

    _repositorio = {}

    def dameDict(self, aplic, lista, lenguaje):
        midict = self._repositorio.get(lenguaje, None)
        if midict is None:
            # Procedemos a cargarlo
            self._cargaLenguaje(lenguaje)
            midict = self._repositorio.get(lenguaje)
        return midict.get(aplic + ":" + lista, None)

    def _cargaLenguaje(self, lenguaje):
        self._dameJSONLenguaje(lenguaje)

    def _dameJSONLenguaje(self, lenguaje):
        # INCLUIMOS LISTA DE APLICACIONES
        midict = {"APLICS": list(settings.YEBO_APPS)}
        # INCLUIMOS CONTEXTO DE INTENACIONALIZACION(de principio no necesita request
        midict.update(django.core.context_processors.i18n(None))
        cargaJSON = "{" + loader.render_to_string(settings.YB_DIR_DEFECTO_TEMPLATES + '/lista.html', midict) + "}"
        try:
            self._repositorio[lenguaje] = ctxJSON.DICTJSON.fromJSON(cargaJSON)
        except Exception:
            pass
        return cargaJSON


_miRepositorio = _RepositorioListas()
# ----------------------------METODO WEB-------------------------------------------------
# TODO COMPROBAR SI CAMBIA POR LENGUAGE Y CACHE
last_modified_date = timezone.now()


@cache_page(86400)
@last_modified(lambda req, **kw: last_modified_date)
def JSLoadListas(request):
    lenguaje = django.utils.translation.get_language()
    return HttpResponse(_miRepositorio._dameJSONLenguaje(lenguaje), content_type="application/json")


# ----------------------------ACCESO PUBLICO  ---------------------------------------------
def dameDict(aplic, lista, lenguaje=None):
    # TODO Pendiente tratar por lenguaje
    if lenguaje is None:
        lenguaje = django.utils.translation.get_language()
    return _miRepositorio.dameDict(aplic, lista, lenguaje)


@lru_cache()
def _dameChoices(aplic, lista, lenguaje=None):
    # TODO Pendiente tratar por lenguaje
    if lenguaje is None:
        lenguaje = django.utils.translation.get_language()
    return list(_miRepositorio.dameDict(aplic, lista, lenguaje).items())


dameChoices = lazy(_dameChoices, list)

# def dameChoices(aplic,lista,lenguaje=None):
#    def mifunc():
#        return dameChoices_lazy(aplic,lista,lenguaje)
#    mifunc.aplic=aplic
#    mifunc.lista=lista
#    return mifunc
