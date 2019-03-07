# @class_declaration interna_auth_user #
from YBUTILS.viewREST import helpers
from YBSYSTEM.models.flsisppal import models as modelos
import importlib


class interna_auth_user(modelos.mtd_auth_user, helpers.MixinConAcciones):
    pass

    class Meta:
        proxy = True


# @class_declaration oficial_auth_user #
class oficial_auth_user(interna_auth_user, helpers.MixinConAcciones):
    pass

    class Meta:
        proxy = True

    def initValidation(name, data=None):
        return form.iface.initValidation(name, data)

    def iniciaValoresLabel(self, template=None, cursor=None, data=None):
        return form.iface.iniciaValoresLabel(self, template, cursor)

    def bChLabel(fN=None, cursor=None):
        return form.iface.bChLabel(fN, cursor)

    def getFilters(self, name, template=None):
        return form.iface.getFilters(self, name, template)

    def getForeignFields(self, template=None):
        return form.iface.getForeignFields(self, template)

    def getDesc():
        return form.iface.getDesc()

    def queryGrid_usergroups(self, b):
        return form.iface.queryGrid_usergroups(self)

    @helpers.decoradores.accion(aqparam=["oParam"])
    def salirGrupo(self, oParam):
        return form.iface.salirGrupo(self, oParam)

    @helpers.decoradores.accion(aqparam=["oParam"])
    def NuevoGrupo(self, oParam):
        return form.iface.NuevoGrupo(self, oParam)

    @helpers.decoradores.systemAccion()
    @helpers.decoradores.accion(aqparam=["oParam"])
    def changePermision(self, oParam):
        return form.iface.changePermision(self, oParam)

    @helpers.decoradores.accion()
    def accessControl(self):
        return form.iface.accessControl(self)

# @class_declaration auth_user #
class auth_user(oficial_auth_user, helpers.MixinConAcciones):
    pass

    class Meta:
        proxy = True


definitions = importlib.import_module("YBSYSTEM.models.flsisppal.auth_user_def")
form = definitions.FormInternalObj()
form._class_init()
form.iface.ctx = form.iface
form.iface.iface = form.iface
