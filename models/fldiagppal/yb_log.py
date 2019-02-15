# @class_declaration interna_yb_log #
from YBUTILS.viewREST import helpers
from models.fldiagppal import models as modelos
import importlib


class interna_yb_log(modelos.mtd_yb_log, helpers.MixinConAcciones):
    pass

    class Meta:
        proxy = True


# @class_declaration yeboyebo_yb_log #
class yeboyebo_yb_log(interna_yb_log, helpers.MixinConAcciones):
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

    def queryGrid_diagnosismonitor(template):
        return form.iface.queryGrid_diagnosismonitor(template)

    def field_timestamp(self):
        return form.iface.field_timestamp(self)

    def field_descripcion(self):
        return form.iface.field_descripcion(self)

    def field_colorRow(self):
        return form.iface.field_colorRow(self)

    @helpers.decoradores.csr()
    def addlog(params):
        return form.iface.addlog(params)


# @class_declaration yb_log #
class yb_log(yeboyebo_yb_log, helpers.MixinConAcciones):
    pass

    class Meta:
        proxy = True


definitions = importlib.import_module("models.fldiagppal.yb_log_def")
form = definitions.FormInternalObj()
form._class_init()
form.iface.ctx = form.iface
form.iface.iface = form.iface
