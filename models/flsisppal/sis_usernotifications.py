# @class_declaration interna_usernotifications #
from YBUTILS.viewREST import helpers
from models.flsisppal import models as sismodels
import importlib


class interna_sis_usernotifications(sismodels.mtd_sis_usernotifications, helpers.MixinConAcciones):
    pass

    class Meta:
        proxy = True


# @class_declaration usernotifications #
class sis_usernotifications(interna_sis_usernotifications, helpers.MixinConAcciones):
    pass

    class Meta:
        proxy = True


definitions = importlib.import_module("models.flsisppal.sis_usernotifications_def")
form = definitions.FormInternalObj()
form._class_init()
form.iface.ctx = form.iface
form.iface.iface = form.iface
