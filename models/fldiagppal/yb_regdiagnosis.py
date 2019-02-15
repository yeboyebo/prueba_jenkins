# @class_declaration interna_yb_regdiagnosis #
from YBUTILS.viewREST import helpers
from models.fldiagppal import models as diagmodels
import importlib


class interna_yb_regdiagnosis(diagmodels.mtd_yb_regdiagnosis, helpers.MixinConAcciones):
    pass

    class Meta:
        proxy = True


# @class_declaration yeboyebo_yb_regdiagnosis #
class yeboyebo_yb_regdiagnosis(interna_yb_regdiagnosis, helpers.MixinConAcciones):
    pass

    class Meta:
        proxy = True

    @helpers.decoradores.csr()
    def checkdiagnosis(params):
        return form.iface.checkdiagnosis(params)

    def getForeignFields(self, template=None):
        return form.iface.getForeignFields(self, template)

    def field_condition(self):
        return form.iface.field_condition(self)

    def iniciaValoresLabel(self, template=None, cursor=None, data=None):
        return form.iface.iniciaValoresLabel(self, template, cursor)

    def bChLabel(fN=None, cursor=None):
        return form.iface.bChLabel(fN, cursor)

    def getFilters(self, name, template):
        return form.iface.getFilters(self, name, template)

    def initValidation(name, data):
        return form.iface.initValidation(name, data)

    @helpers.decoradores.accion()
    def dameSubregistrosDiagnosis(self):
        return form.iface.dameSubregistrosDiagnosis(self)

    @helpers.decoradores.accion()
    def testApi(self):
        return form.iface.testApi(self)

    def checkDiagnosisElganso(self, cliente, proceso):
        return form.iface.checkDiagnosisElganso(cliente, proceso)


# @class_declaration yb_regdiagnosis #
class yb_regdiagnosis(yeboyebo_yb_regdiagnosis, helpers.MixinConAcciones):
    pass

    class Meta:
        proxy = True


definitions = importlib.import_module("models.fldiagppal.yb_regdiagnosis_def")
form = definitions.FormInternalObj()
form._class_init()
form.iface.ctx = form.iface
form.iface.iface = form.iface
