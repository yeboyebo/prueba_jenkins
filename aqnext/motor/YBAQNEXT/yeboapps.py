from os import path

from AQNEXT.settings import PROJECT_ROOT
from YBAQNEXT.settings import INSTALLED_APPS
from YBWEB.ctxJSON import DICTJSON

YEBO_APPS = ()

rest = open(path.join(PROJECT_ROOT, "config/urls.json")).read()
oRest = DICTJSON.fromJSON(rest)

for app in oRest:
    YEBO_APPS += (app, )

INSTALLED_APPS += YEBO_APPS
