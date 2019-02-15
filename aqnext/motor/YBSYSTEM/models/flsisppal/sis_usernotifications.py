# @class_declaration interna_sis_usernotifications #
import importlib

from YBUTILS.viewREST import helpers
from YBSYSTEM.models.flsisppal import models as sismodels


class interna_sis_usernotifications(sismodels.mtd_sis_usernotifications, helpers.MixinConAcciones):
    pass

    class Meta:
        proxy = True


# @class_declaration sis_usernotifications #
class sis_usernotifications(interna_sis_usernotifications, helpers.MixinConAcciones):
    pass

    class Meta:
        proxy = True


definitions = importlib.import_module("YBSYSTEM.models.flsisppal.sis_usernotifications_def")
form = definitions.FormInternalObj()
form._class_init()
form.iface.ctx = form.iface
form.iface.iface = form.iface
