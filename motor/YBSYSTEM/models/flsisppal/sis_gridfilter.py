# @class_declaration interna_sis_gridfilter #
import importlib

from YBUTILS.viewREST import helpers
from YBSYSTEM.models.flsisppal import models as modelos


class interna_sis_gridfilter(modelos.mtd_sis_gridfilter, helpers.MixinConAcciones):
    pass

    class Meta:
        proxy = True


# @class_declaration oficial_sis_gridfilter #
class oficial_sis_gridfilter(interna_sis_gridfilter, helpers.MixinConAcciones):
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

    @helpers.decoradores.accion(aqparam=["oParam"], tipo="O")
    def nuevoFiltro(self, oParam):
        return form.iface.nuevoFiltro(self, oParam)

    @helpers.decoradores.accion(aqparam=["oParam"])
    def actualizaFiltro(self, oParam):
        return form.iface.actualizaFiltro(self, oParam)

    def field_colorRow(cursor):
        return form.iface.field_colorRow(cursor)

    @helpers.decoradores.accion()
    def inicial(self):
        return form.iface.inicial(self)


# @class_declaration sis_gridfilter #
class sis_gridfilter(oficial_sis_gridfilter, helpers.MixinConAcciones):
    pass

    class Meta:
        proxy = True


definitions = importlib.import_module("YBSYSTEM.models.flsisppal.sis_gridfilter_def")
form = definitions.FormInternalObj()
form._class_init()
form.iface.ctx = form.iface
form.iface.iface = form.iface
