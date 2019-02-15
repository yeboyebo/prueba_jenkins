# @class_declaration interna_sis_acl #
from YBUTILS.viewREST import helpers
from YBSYSTEM.models.flsisppal import models as sismodels
import importlib


class interna_sis_acl(sismodels.mtd_sis_acl, helpers.MixinConAcciones):
    pass

    class Meta:
        proxy = True


# @class_declaration sis_acl #
class sis_acl(interna_sis_acl, helpers.MixinConAcciones):
    pass

    class Meta:
        proxy = True


definitions = importlib.import_module("YBSYSTEM.models.flsisppal.sis_acl_def")
form = definitions.FormInternalObj()
form._class_init()
form.iface.ctx = form.iface
form.iface.iface = form.iface
