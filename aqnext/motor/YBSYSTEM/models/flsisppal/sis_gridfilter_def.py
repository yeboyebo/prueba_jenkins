# @class_declaration interna #
import json

from YBLEGACY import qsatype


class interna(qsatype.objetoBase):

    ctx = qsatype.Object()

    def __init__(self, context=None):
        self.ctx = context


# @class_declaration oficial #
from YBLEGACY.constantes import *


class oficial(interna):

    def oficial_initValidation(self, name, data=None):
        response = True
        return response

    def oficial_iniciaValoresLabel(self, model=None, template=None, cursor=None):
        labels = {}
        return labels

    def oficial_bChLabel(self, fN=None, cursor=None):
        labels = {}
        return labels

    def oficial_getFilters(self, model, name, template=None):
        filters = []

        if name == "filtrosUsuario":
            return [
                {
                    "criterio": "usuario__in",
                    "valor": [qsatype.FLUtil.nameUser()]
                }
            ]
        return filters

    def oficial_getForeignFields(self, model, template=None):
        return [
            {'verbose_name': 'rowColor', 'func': 'field_colorRow'}
        ]

    def oficial_field_colorRow(self, model):
        if model.inicial:
            return "cSuccess"

        return None

    def oficial_getDesc(self):
        desc = "descripcion"
        return desc

    def oficial_nuevoFiltro(self, model, oParam):
        print("nuevo", oParam["filterData"]["filtername"])
        if not qsatype.FLUtil.sqlInsert(u"sis_gridfilter", qsatype.Array([u"prefix", u"template", u"descripcion", u"usuario", u"filtro"]), qsatype.Array([oParam["prefix"], "master", oParam["filterData"]["filtername"], qsatype.FLUtil.nameUser(), json.dumps(oParam["filterData"])])):
            return False
        return True

    def oficial_actualizaFiltro(self, model, oParam):
        if not model.descripcion == oParam["filterData"]["filtername"]:
            if not qsatype.FLUtil.sqlUpdate(u"sis_gridfilter", ["descripcion"], [oParam["filterData"]["filtername"]], ustr(u"id = '", model.pk, u"'")):
                        return False
        if not qsatype.FLUtil.sqlUpdate(u"sis_gridfilter", ["filtro"], [json.dumps(oParam["filterData"])], ustr(u"id = '", model.pk, u"'")):
            return False
        return True

    def oficial_inicial(self, model):
        # TODO ver si hay filtro inicial para el modelo y poner a false
        inicial = qsatype.FLUtil.sqlSelect(u"sis_gridfilter", u"id", ustr(u"prefix = '", model.prefix, u"' AND inicial is true"))
        if inicial:
            if not qsatype.FLUtil().sqlUpdate(u"sis_gridfilter", u"inicial", False, ustr(u"id = '", inicial, u"'")):
                return False
        if not qsatype.FLUtil().sqlUpdate(u"sis_gridfilter", u"inicial", True, ustr(u"id = '", model.id, u"'")):
            return False
        return True

    def __init__(self, context=None):
        super().__init__(context)

    def field_colorRow(self, model):
        return self.ctx.oficial_field_colorRow(model)

    def initValidation(self, name, data=None):
        return self.ctx.oficial_initValidation(name, data=None)

    def iniciaValoresLabel(self, model=None, template=None, cursor=None):
        return self.ctx.oficial_iniciaValoresLabel(model, template, cursor)

    def bChLabel(self, fN=None, cursor=None):
        return self.ctx.oficial_bChLabel(fN, cursor)

    def getFilters(self, model, name, template=None):
        return self.ctx.oficial_getFilters(model, name, template)

    def getForeignFields(self, model, template=None):
        return self.ctx.oficial_getForeignFields(model, template)

    def getDesc(self):
        return self.ctx.oficial_getDesc()

    def nuevoFiltro(self, model, oParam):
        return self.ctx.oficial_nuevoFiltro(model, oParam)

    def actualizaFiltro(self, model, oParam):
        return self.ctx.oficial_actualizaFiltro(model, oParam)

    def inicial(self, model):
        return self.ctx.oficial_inicial(model)


# @class_declaration head #
class head(oficial):

    def __init__(self, context=None):
        super().__init__(context)


# @class_declaration ifaceCtx #
class ifaceCtx(head):

    def __init__(self, context=None):
        super().__init__(context)


# @class_declaration FormInternalObj #
class FormInternalObj(qsatype.FormDBWidget):
    def _class_init(self):
        self.iface = ifaceCtx(self)
