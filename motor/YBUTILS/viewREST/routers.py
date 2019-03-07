from rest_framework.routers import Route
from rest_framework.routers import SimpleRouter
# from rest_framework.routers import DefaultRouter
# from rest_framework.routers import format_suffix_patterns

from YBUTILS.viewREST import viewsets
from YBUTILS.viewREST import helpers
from YBUTILS.viewREST import systemViewsets

""" Define los router por defecto a utilizar """


class RESTDefaultRouterModel(SimpleRouter):
    """
    Router por defecto de operaciones REST
    """
    routes = [
        # Route(
        #     url=r'^REST/{prefix}/detail$',
        #     mapping={'post': 'create'},
        #     name='{basename}-create-REST',
        #     initkwargs={},
        # ),
        # Route(
        #     url=r'^REST/{prefix}/detail/(?P<pk>[^\/]+)$',
        #     mapping={
        #         'get': 'retrieve',
        #         'put': 'update',
        #         'patch': 'partial_update',
        #         'delete': 'destroy'
        #    },
        #    name='{basename}-detail-REST',
        #    initkwargs={}
        # ),
        Route(
            url=r'^REST/{prefix}/list$',
            mapping={'get': 'list', 'post': 'list'},
            name='{basename}-list-REST',
            initkwargs={}
        ),
        Route(
            url=r'^REST/{prefix}/list/(?P<fichero>\w+)$',
            mapping={'get': 'list_fichero'},
            name='{basename}-list-REST-fichero',
            initkwargs={}
        ),
        Route(
            url=r'^REST/{prefix}/quicklist$',
            mapping={'get': 'quicklist'},
            name='{basename}-quicklist-REST',
            initkwargs={}
        ),
        Route(
            url=r'^REST/{prefix}/detailedlist$',
            mapping={'get': 'detailedlist'},
            name='{basename}-detailedlist-REST',
            initkwargs={}
        ),
        Route(
            url=r'^REST/{prefix}/listaccion/(?P<tipo>\w+)$',
            mapping={'get': 'accionlist'},
            name='{basename}-accionlist-REST',
            initkwargs={}
        ),
        # DynamicDetailRoute(
        #     url=r'^REST/{prefix}/(?P<pk>[^\/]+)/{methodnamehyphen}/(?P<aux>\w+)$',
        #     name='{basename}-{methodnamehyphen}REST',
        #     initkwargs={}
        # ),
        # DynamicListRoute(
        #     url=r'^REST/{prefix}/{methodnamehyphen}/(?P<aux>\w+)$',
        #     name='{basename}-{methodnamehyphen}-REST',
        #     initkwargs={}
        # ),
        Route(
            url=r'^REST/{prefix}/accion/(?P<accion>\w+)$',
            mapping={'put': 'ejecutaraccionAux'},
            name='{basename}-accion-REST',
            initkwargs={}
        ),
        Route(
            url=r'^REST/{prefix}/accionQ/(?P<accion>\w+)$',
            mapping={'put': 'ejecutaraccionList'},
            name='{basename}-accion-REST',
            initkwargs={}
        ),
        Route(
            url=r'^REST/{prefix}/(?P<pk>[^\/]+)/accion/(?P<accion>\w+)$',
            mapping={'put': 'ejecutaraccionInd', 'post': 'ejecutaraccionInd'},
            name='{basename}-accion-REST',
            initkwargs={}
        ),
        Route(
            url=r'^REST/{prefix}/(?P<pk>[^\/]+)/accionF/(?P<accion>\w+)$',
            mapping={'post': 'ejecutaraccionFileInd'},
            name='{basename}-accion-REST',
            initkwargs={}
        ),
        Route(
            url=r'^REST/{prefix}/csr/(?P<accion>\w+)$',
            mapping={'put': 'ejecutaraccionCsrAUX', 'post': 'ejecutaraccionCsrAux', 'get': 'ejecutaraccionCsrAux'},
            name='{basename}-accion-REST',
            initkwargs={}
        ),
        Route(
            url=r'^REST/{prefix}/(?P<pk>[^\/]+)/csr/(?P<accion>\w+)$',
            mapping={'put': 'ejecutaraccionCsr', 'post': 'ejecutaraccionCsr'},
            name='{basename}-accion-REST',
            initkwargs={}
        ),
        Route(
            url=r'^REST/{prefix}/csv/(?P<accion>\w+)$',
            mapping={'get': 'generaCSVAux'},
            name='{basename}-accion-REST',
            initkwargs={}
        ),
        Route(
            url=r'^REST/{prefix}/(?P<pk>[^\/]+)/jreport/accion/(?P<accion>\w+)$',
            mapping={'get': 'generaJReportInd'},
            name='{basename}-accion-REST',
            initkwargs={}
        ),
        Route(
            url=r'^REST/{prefix}/(?P<pk>[^\/]+)/jreport/(?P<report>\w+)$',
            mapping={'get': 'generaJReport'},
            name='{basename}-accion-REST',
            initkwargs={}
        ),
        Route(
            url=r'^REST/{prefix}/(?P<pk>[^\/]+)/getfile/accion/(?P<accion>\w+)$',
            mapping={'get': 'generaAttachmentInd'},
            name='{basename}-accion-REST',
            initkwargs={}
        ),
        Route(
            url=r'^REST/{prefix}/(?P<pk>[^\/]+)/getfile$',
            mapping={'get': 'generaAttachment'},
            name='{basename}-accion-REST',
            initkwargs={}
        ),
        Route(
            url=r'^REST/{prefix}/(?P<pk>[^\/]+)/csv/(?P<accion>\w+)$',
            mapping={'get': 'generaCSVInd'},
            name='{basename}-accion-REST',
            initkwargs={}
        ),
    ]

    def __init__(self, *args, **kwargs):
        self._prefix = ""
        super().__init__(*args, **kwargs)

    def get_default_base_name(self, viewset):
        return self._prefix

    def registerDynamic(self,
                        mimodelo,
                        classViewSets=viewsets.YBRESTModelViewSet,
                        listAccionesAdicionales=[]):

        prefix = mimodelo._meta.db_table.lower()
        self._prefix = prefix

        helpers.RegistrarAcciones(mimodelo, listAccionesAdicionales)

        dict = {
            '_aplicacion': 'models',
            '_prefix': prefix,
            '_model': mimodelo,
        }

        raiz = 'models' + prefix
        miView = type(raiz + "ModelViewSet", (classViewSets,), dict)
        self.register(prefix, miView)

    # cambiar raiz del api root a REST/
    # def get_urls(self):
    #     """
    #     Generate the list of URL patterns, including a default root view
    #     for the API, and appending `.json` style format suffixes.
    #     """
    #     urls = []
    #     # Default REST
    #     if self.include_root_view:
    #         root_url = url(r'^REST$', login_required(self.get_api_root_view()), name=self.root_view_name)
    #         urls.append(root_url)

    #     default_urls = super().get_urls()
    #     urls.extend(default_urls)

    #     if self.include_format_suffixes:
    #         urls = format_suffix_patterns(urls)

    #     return urls


class LayOutDefaultRouter(SimpleRouter):
    """Router por defecto para mostrar formularios de interaccion"""

    routes = [
        Route(
            url=r'^$',
            mapping={'get': 'invocaAQdashboard'},
            name='{basename}-vista-HTML',
            initkwargs={}
        ),
        Route(
            url=r'^dashboard$',
            mapping={'get': 'invocaAQdashboard', 'put': 'invocaAQdashboard'},
            name='{basename}-vista-HTML',
            initkwargs={}
        ),
        Route(
            url=r'^{prefix}/master$',
            mapping={'get': 'invocaAQNmaster', 'put': 'invocaAQNmaster'},
            name='{basename}-vista-HTML',
            initkwargs={}
        ),
        Route(
            url=r'^{prefix}/newRecord$',
            mapping={'get': 'formNewRecord', 'put': 'formNewRecord'},
            name='{basename}-vista-HTML',
            initkwargs={}
        ),
        Route(
            url=r'^{prefix}/custom/(?P<template>\w+)$',
            mapping={'get': 'invocaAQMtemplate', 'put': 'invocaAQMtemplate'},
            name='{basename}-vista-HTML',
            initkwargs={}
        ),
        Route(
            url=r'^{prefix}/(?P<pk>[^\/]+)$',
            mapping={'get': 'invocaAQN', 'put': 'invocaAQN'},
            name='{basename}-vista-HTML',
            initkwargs={}
        ),
        Route(
            url=r'^{prefix}/(?P<pk>[^\/]+)/(?P<template>\w+)$',
            mapping={'get': 'invocaAQNtemplate', 'put': 'invocaAQNtemplate'},
            name='{basename}-vista-HTML',
            initkwargs={}
        ),
    ]

    def __init__(self, aplicacion, *args, **kwargs):
        self._aplicacion = aplicacion
        self._prefix = ""
        super().__init__(*args, **kwargs)

    def get_default_base_name(self, viewset):
        return self._aplicacion + ":" + self._prefix

    def registerDynamicModel(self, prefix, classViewSets=viewsets.YBLayOutModelViewSet):

        if isinstance(prefix, type):
            prefix = prefix._meta.db_table.lower()

        self._prefix = prefix

        dict = {
            '_aplicacion': self._aplicacion,
            '_prefix': prefix,
        }
        # print(prefix)
        raiz = self._aplicacion + prefix
        miView = type(raiz + "ModelViewSet", (classViewSets,), dict)
        self.register(prefix, miView)

    # def registerDynamicViewSet(self, prefix, miViewClass, base_name=None):
    #     self._base_name = base_name if base_name else prefix
    #     self.register(prefix, miViewClass)


class SystemRouter(SimpleRouter):
    """Router para administracion del sistema"""

    routes = [
        Route(
            url=r'^users$',
            mapping={'get': 'invocaUserTemplate'},
            name='{basename}-vista-HTML',
            initkwargs={}
        ),
        Route(
            url=r'^acl/(?P<table>[^\/]+)/(?P<pk>[^\/]+)$',
            mapping={'get': 'invocaACL', 'put': 'invocaACL'},
            name='{basename}-vista-HTML',
            initkwargs={}
        ),
        Route(
            url=r'^acl/(?P<table>[^\/]+)/(?P<pk>[^\/]+)/accion/(?P<accion>[^\/]+)$',
            mapping={'put': 'ejecutaraccionAcl', 'post': 'ejecutaraccionAcl'},
            name='{basename}-accion-REST',
            initkwargs={}
        ),
    ]

    def __init__(self, aplicacion, *args, **kwargs):
        self._aplicacion = aplicacion
        self._prefix = ""
        super().__init__(*args, **kwargs)

    def get_default_base_name(self, viewset):
        return self._aplicacion + ":" + self._prefix

    def registerDynamicModel(self, prefix, classViewSets=systemViewsets.YBSystemViewSet):

        if isinstance(prefix, type):
            prefix = prefix._meta.db_table.lower()

        self._prefix = prefix

        dict = {
            '_aplicacion': self._aplicacion,
            '_prefix': prefix,
        }

        raiz = self._aplicacion + prefix
        miView = type(raiz + "ModelViewSet", (classViewSets,), dict)
        self.register(prefix, miView)
