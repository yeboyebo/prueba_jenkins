# @class_declaration interna_yb_subregdiagnosis #
from YBUTILS.viewREST import helpers
from models.fldiagppal import models as diagmodels
import importlib


class interna_yb_subregdiagnosis(diagmodels.mtd_yb_subregdiagnosis, helpers.MixinConAcciones):
    pass

    class Meta:
        proxy = True


# @class_declaration yeboyebo_yb_subregdiagnosis #
class yeboyebo_yb_subregdiagnosis(interna_yb_subregdiagnosis, helpers.MixinConAcciones):
    pass

    class Meta:
        proxy = True

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


# @class_declaration yb_subregdiagnosis #
class yb_subregdiagnosis(yeboyebo_yb_subregdiagnosis, helpers.MixinConAcciones):
    pass

    class Meta:
        proxy = True


definitions = importlib.import_module("models.fldiagppal.yb_subregdiagnosis_def")
form = definitions.FormInternalObj()
form._class_init()
form.iface.ctx = form.iface
form.iface.iface = form.iface
