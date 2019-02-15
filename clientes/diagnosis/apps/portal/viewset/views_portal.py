# @class_declaration interna #
from YBLEGACY import qsatype


class interna(qsatype.objetoBase):

    ctx = qsatype.Object()

    def __init__(self, context=None):
        self.ctx = context

# @class_declaration desarrollo #
from models.flsisppal.sis_usernotifications import sis_usernotifications
from django.shortcuts import render

import datetime


class desarrollo(interna):

    def desarrollo_setToken(self, request, param):
        usr = qsatype.FLUtil.nameUser()
        # token = sis_usernotifications.objects.filter(usuario=usr)
        # if token:
        #     token.token = param
        # else:
        newtoken = sis_usernotifications(usuario=usr, token=param, fechaalta=datetime.datetime.today().date())
        newtoken.save()
        return render(request, 'login/login.html')

    def __init__(self, context=None):
        super(desarrollo, self).__init__(context)

    def setToken(self, request, param):
        return self.ctx.desarrollo_setToken(request, param)


# @class_declaration head #
class head(desarrollo):

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
