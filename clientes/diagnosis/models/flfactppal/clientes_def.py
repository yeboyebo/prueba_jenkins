# @class_declaration interna #
from YBLEGACY import qsatype


class interna(qsatype.objetoBase):

    ctx = qsatype.Object()

    def __init__(self, context=None):
        self.ctx = context


# @class_declaration yeboyebo #
from YBLEGACY.constantes import *


class yeboyebo(interna):

    def yeboyebo_initValidation(self, name, data=None):
        response = True
        return response

    def yeboyebo_iniciaValoresLabel(self, model=None, template=None, cursor=None):
        labels = {}
        return labels

    def yeboyebo_bChLabel(self, fN=None, cursor=None):
        labels = {}
        return labels

    def yeboyebo_getFilters(self, model, name, template=None):
        filters = []
        return filters

    def yeboyebo_getForeignFields(self, model, template=None):
        fields = []
        return fields

    def yeboyebo_getDesc(self):
        desc = None
        return desc

    def __init__(self, context=None):
        super(yeboyebo, self).__init__(context)

    def initValidation(self, name, data=None):
        return self.ctx.yeboyebo_initValidation(name, data=None)

    def iniciaValoresLabel(self, model=None, template=None, cursor=None):
        return self.ctx.yeboyebo_iniciaValoresLabel(model, template, cursor)

    def bChLabel(self, fN=None, cursor=None):
        return self.ctx.yeboyebo_bChLabel(fN, cursor)

    def getFilters(self, model, name, template=None):
        return self.ctx.yeboyebo_getFilters(model, name, template)

    def getForeignFields(self, model, template=None):
        return self.ctx.yeboyebo_getForeignFields(model, template)

    def getDesc(self):
        return self.ctx.yeboyebo_getDesc()


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
