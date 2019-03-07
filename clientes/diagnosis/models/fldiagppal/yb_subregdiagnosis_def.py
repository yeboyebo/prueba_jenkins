# @class_declaration interna #
from YBLEGACY import qsatype


class interna(qsatype.objetoBase):

    ctx = qsatype.Object()

    def __init__(self, context=None):
        self.ctx = context


# @class_declaration yeboyebo #
from YBLEGACY.constantes import *
import datetime


class yeboyebo(interna):

    def yeboyebo_getForeignFields(self, model, template=None):
        return [{"verbose_name": "conditions", "func": "field_condition"}]

    def yeboyebo_field_condition(self, model):
        tipo = qsatype.FLUtil.sqlSelect("yb_regdiagnosis", "tipo", "idreg = " + str(model.idreg))

        if tipo == "Ventas Tpv":
            hMax = datetime.datetime.now() - datetime.timedelta(hours=2)
            hMin = datetime.datetime.now() - datetime.timedelta(hours=4)
            return {
                "ok": model.timestamp >= str(hMax),
                "error": model.timestamp < str(hMin),
                "warn": model.timestamp < str(hMax) and model.timestamp >= str(hMin)
            }
        elif tipo == "Stock":
            hMax = datetime.datetime.now() - datetime.timedelta(hours=24)
            hMin = datetime.datetime.now() - datetime.timedelta(hours=48)
            return {
                "ok": model.timestamp >= str(hMax),
                "error": model.timestamp < str(hMin),
                "warn": model.timestamp < str(hMax) and model.timestamp >= str(hMin)
            }
        elif tipo == "Arqueos Tpv":
            hMax = datetime.datetime.now() - datetime.timedelta(hours=1)
            hMin = datetime.datetime.now() - datetime.timedelta(hours=2)
            return {
                "ok": model.timestamp >= str(hMax),
                "error": model.timestamp < str(hMin),
                "warn": model.timestamp < str(hMax) and model.timestamp >= str(hMin)
            }
        else:
            hMax = datetime.datetime.now() - datetime.timedelta(hours=4)
            hMin = datetime.datetime.now() - datetime.timedelta(hours=8)
            return {
                "ok": model.timestamp >= str(hMax),
                "error": model.timestamp < str(hMin),
                "warn": model.timestamp < str(hMax) and model.timestamp >= str(hMin)
            }

    def yeboyebo_iniciaValoresLabel(self, model, template=None):
        labels = {}
        return labels

    def yeboyebo_bChLabel(self, fN=None, cursor=None):
        labels = {}
        return labels

    def yeboyebo_getFilters(self, model, name, template):
        return []

    def yeboyebo_initValidation(self, name, data):
        response = True
        return response

    def __init__(self, context=None):
        super(yeboyebo, self).__init__(context)

    def getForeignFields(self, model, template=None):
        return self.ctx.yeboyebo_getForeignFields(model, template)

    def field_condition(self, model):
        return self.ctx.yeboyebo_field_condition(model)

    def iniciaValoresLabel(self, model=None, template=None, cursor=None):
        return self.ctx.yeboyebo_iniciaValoresLabel(model, template)

    def bChLabel(self, fN=None, cursor=None):
        return self.ctx.yeboyebo_bChLabel(fN, cursor)

    def getFilters(self, model, name, template):
        return self.ctx.yeboyebo_getFilters(model, name, template)

    def initValidation(self, name, data):
        return self.ctx.yeboyebo_initValidation(name, data)


# @class_declaration head #
class head(yeboyebo):

    def __init__(self, context=None):
        super(head, self).__init__(context)


# @class_declaration ifaceCtx #
class ifaceCtx(head):

    def __init__(self, context=None):
        super(ifaceCtx, self).__init__(context)


# @class_declaration FormInternalObj #
class FormInternalObj(qsatype.FormDBWidget):
    def _class_init(self):
        self.iface = ifaceCtx(self)
