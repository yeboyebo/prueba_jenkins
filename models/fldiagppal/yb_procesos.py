# @class_declaration interna_yb_procesos #
from YBUTILS.viewREST import helpers
from models.fldiagppal import models as modelos
import importlib


class interna_yb_procesos(modelos.mtd_yb_procesos, helpers.MixinConAcciones):
    pass

    class Meta:
        proxy = True


# @class_declaration yeboyebo_yb_procesos #
class yeboyebo_yb_procesos(interna_yb_procesos, helpers.MixinConAcciones):
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

    def field_ultsincro(self):
        return form.iface.field_ultsincro(self)

    def field_activas(self):
        return form.iface.field_activas(self)

    def field_programadas(self):
        return form.iface.field_programadas(self)

    def field_reservadas(self):
        return form.iface.field_reservadas(self)

    def getDesc():
        return form.iface.getDesc()

    def queryGrid_activitymonitor():
        return form.iface.queryGrid_activitymonitor()

    @helpers.decoradores.accion(aqparam=["cursor"])
    def start(self, cursor):
        return form.iface.start(self, cursor)

    @helpers.decoradores.accion(aqparam=["cursor"])
    def stop(self, cursor):
        return form.iface.stop(self, cursor)

    @helpers.decoradores.accion(aqparam=["cursor", "oParam"])
    def revoke(self, cursor, oParam):
        return form.iface.revoke(self, cursor, oParam)


# @class_declaration yb_procesos #
class yb_procesos(yeboyebo_yb_procesos, helpers.MixinConAcciones):
    pass

    class Meta:
        proxy = True


definitions = importlib.import_module("models.fldiagppal.yb_procesos_def")
form = definitions.FormInternalObj()
form._class_init()
form.iface.ctx = form.iface
form.iface.iface = form.iface
