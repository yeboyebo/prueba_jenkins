import importlib
from os import path

from django.conf import settings
from django.contrib import admin
from django.conf.urls import patterns, url, include

from YBUTILS import globalValues
from YBUTILS.viewREST import routers
from YBWEB.ctxJSON import DICTJSON


def raiz(request):
    return ""


urlpatterns = patterns("",)
apps = globalValues.registra_rest()
sUrls = open(path.join(settings.PROJECT_ROOT, "config/urls.json")).read()
oUrls = DICTJSON.fromJSON(sUrls)

for app in settings.YEBO_APPS:
    if app == "models":
        routerDef = routers.RESTDefaultRouterModel()

        for mod in apps[app]:
            try:
                routerDef.registerDynamic(mod)
            except Exception:
                print("***** Error!!! " + app + "/" + mod + " no ha sido importado.")
                break

        urlpatterns += patterns(
            "",
            url(r"^{0}/".format(app), include(routerDef.urls)),
        )

    else:
        view = importlib.import_module(app + ".viewset.views_" + app)
        objView = view.FormInternalObj()
        objView._class_init()
        views = objView.iface
        objView.iface.ctx = views
        objView.iface.iface = views

        if app != "portal":
            routerLayOut = routers.LayOutDefaultRouter(aplicacion=app)

            for mod in apps["models"]:
                try:
                    routerLayOut.registerDynamicModel(mod)
                except Exception:
                    print("***** Error!!! models/" + mod + " no ha sido importado.")
                    break

            urlpatterns += patterns(
                "",
                url(r"^{0}/".format(app), include(routerLayOut.urls)),
            )
        else:
            routerLayOut = routers.LayOutDefaultRouter(aplicacion="system")
            for mod in apps["models"]:
                try:
                    routerLayOut.registerDynamicModel(mod)
                except Exception:
                    print("***** Error!!! models/" + mod + " no ha sido importado.")
                    break

            routerSystem = routers.SystemRouter(aplicacion="system")
            routerSystem.registerDynamicModel("system")
            urlpatterns += patterns(
                "",
                url(r"^{0}/".format("system"), include(routerSystem.urls)),
                url(r"^{0}/".format("system"), include(routerLayOut.urls)),
            )

        patt = r"^" if app == "portal" else r"^{0}/".format(app)

        for extUrl in oUrls[app]:
            urlpatterns += patterns(
                app,
                url(r"{0}{1}".format(patt, oUrls[app][extUrl]["url"]), getattr(views, oUrls[app][extUrl]["func"]), name=extUrl)
            )

urlpatterns += patterns(
    "",
    url(r"^admin/", admin.site.urls),
    url(r"^", include("YBLOGIN.urls", namespace="YBLOGIN")),
    url(r"^", include("YBSYSTEM.urls", namespace="YBSYSTEM")),
)

urlpatterns += patterns(
    "",
    url(r"^$", raiz, name="root")
)

globalValues.registrarmodulos()
