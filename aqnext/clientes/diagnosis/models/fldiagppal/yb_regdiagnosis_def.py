# @class_declaration interna #
import time
from YBLEGACY import qsatype
from YBLEGACY.constantes import *


class interna(qsatype.objetoBase):

    ctx = qsatype.Object()

    def __init__(self, context=None):
        self.ctx = context


# @class_declaration yeboyebo #
import time
import datetime
from YBUTILS import notifications
from diagnosis import tasks
from models.fldiagppal.yb_procesos import yb_procesos


class yeboyebo(interna):

    def yeboyebo_checkdiagnosis(self, params):
        response = {}
        if "passwd" in params and params['passwd'] == "prnAc9Pgi5uq":
            if "cliente" in params:
                cliente = params['cliente']
                if cliente == "elganso" and "proceso" in params:
                    return self.iface.checkDiagnosisElganso(cliente, params)
                elif cliente == "guanabana" and "proceso" in params:
                    return self.iface.checkDiagnosisGuanabana(cliente, params)
                elif cliente == "sanhigia" and "proceso" in params:
                    return self.iface.checkDiagnosisSanhigia(cliente, params)
        return response

    def yeboyebo_checkDiagnosisElganso(self, cliente, params):
        _i = self.iface

        response = {}
        proceso = params['proceso']

        procContinuos = ["mgsyncstock", "mgsyncpoints", "mgsyncorders", "mgsynccust", "mgsyncprices"]
        procDiag = ["diagfacturacionventas", "diagventasmagento", "diagsincroventas", "diagverificacioncontable", "diagsaldovales", "diagdevolucionesweb", "diaganalyticalways", "diagcontanalitica", "diagsolrepoweb", "diagegpda", "diagbloqueos"]

        if proceso in procContinuos:
            response = _i.checkContinuos(cliente, proceso)
        elif proceso in procDiag:
            response = _i.checkDiag(cliente, proceso)

        elif proceso == "tiendaSM":
            fComprobacion = datetime.datetime.now() - datetime.timedelta(days=2)
            fComprobacion = str(fComprobacion)[:10]
            ultimasincro = qsatype.FLUtil.sqlSelect("flsettings", "valor", "flkey = 'fechaSincroTiendasSM'")
            ultimasincro = json.loads((ultimasincro))['fecha']
            if fComprobacion > ultimasincro:
                status = notifications.sendNotification("tiendaSM", "Error sincronización", "juanma")
                if status:
                    response = {"status": "ok"}
                else:
                    response = {"status": "error"}
                qsatype.debug(ustr("Error sincroTiendaSM", fComprobacion))

        return response

    def yeboyebo_checkDiagnosisGuanabana(self, cliente, params):
        _i = self.iface

        response = {}
        proceso = params['proceso']

        procContinuos = ["gbsyncstock", "gbsyncorders", "gbsynccust", "gbsyncprices"]
        procDiag = []

        if proceso in procContinuos:
            response = _i.checkContinuos(cliente, proceso)
        elif proceso in procDiag:
            response = _i.checkDiag(cliente, proceso)

        return response

    def yeboyebo_checkDiagnosisSanhigia(self, cliente, params):
        _i = self.iface

        response = {}
        proceso = params['proceso']

        procContinuos = ["shsyncstock", "shsyncorders", "shsynccust", "shsyncprices"]
        procDiag = []

        if proceso in procContinuos:
            response = _i.checkContinuos(cliente, proceso)
        elif proceso in procDiag:
            response = _i.checkDiag(cliente, proceso)

        return response

    def yeboyebo_checkContinuos(self, cliente, proceso):
        _i = self.iface
        response = {}

        hSyncCont = datetime.datetime.now() - _i.dameTiempoSincro("continuo")
        sincronizadosCont = qsatype.FLUtil.sqlSelect("yb_log", "COUNT(*)", "cliente = '" + cliente + "' AND timestamp >= '" + str(hSyncCont) + "' AND tipo = '" + proceso + "' AND texto NOT LIKE 'Info.%'")

        hSyncHora = datetime.datetime.now() - datetime.timedelta(hours=1)
        sincronizadosHora = qsatype.FLUtil.sqlSelect("yb_log", "COUNT(*)", "cliente = '" + cliente + "' AND timestamp >= '" + str(hSyncHora) + "' AND tipo = '" + proceso + "' AND texto NOT LIKE 'Info.%'")

        errores = qsatype.FLUtil.sqlSelect("yb_log", "texto LIKE '%Error%'", "cliente = '" + cliente + "' AND tipo = '" + proceso + "' ORDER BY timestamp DESC LIMIT 1")

        if sincronizadosCont == 0:
            curProc = qsatype.FLSqlCursor("yb_procesos")
            curProc.select("proceso = '" + proceso + "' AND cliente = '" + cliente + "'")
            if not curProc.first():
                return False
            if not curProc.valueBuffer("activo"):
                return {"status": "ok"}
            qsatype.FLSqlQuery().execSql("INSERT INTO yb_log (texto, cliente, tipo, timestamp) VALUES ('Info. Detectado bloqueo', '" + cliente + "', '" + proceso + "', '" + qsatype.Date().now() + "')")
            # yb_procesos.stop(None, curProc)
            # curProc.setValueBuffer("activo", False)
            # time.sleep(200)
            # yb_procesos.start(None, curProc)

            response = {"status": "ok"}
            status = notifications.sendNotification("Error. " + proceso + " - " + cliente, "Reinicie proceso", _i.dameNotificadosSincro("continuo"))
            if status:
                response = {"status": "ok"}
            else:
                response = {"status": "error"}
        elif errores or sincronizadosHora == 0:
            response = {"status": "ok"}
            status = notifications.sendNotification(proceso + " - " + cliente, "Error sincronización", _i.dameNotificadosSincro("continuo"))
            if status:
                response = {"status": "ok"}
            else:
                response = {"status": "error"}
        else:
            response = {"status": "ok"}
        qsatype.debug(ustr(proceso, response))

        return response

    def yeboyebo_checkDiag(self, cliente, proceso):
        _i = self.iface
        response = {}

        hSync = datetime.datetime.now() - _i.dameTiempoSincro(proceso)
        sincronizados = qsatype.FLUtil.sqlSelect("yb_log", "COUNT(*)", "cliente = '" + cliente + "' AND timestamp >= '" + str(hSync) + "' AND tipo = '" + proceso + "'")
        errores = qsatype.FLUtil.sqlSelect("yb_log", "texto LIKE '%Error%'", "cliente = '" + cliente + "' AND tipo = '" + proceso + "' ORDER BY timestamp DESC LIMIT 1")

        if sincronizados == 0 or errores:
            response = {"status": "ok"}
            # Function notificados
            status = notifications.sendNotification(proceso + " - " + cliente, "Error sincronización", _i.dameNotificadosSincro(proceso))
            if status:
                response = {"status": "ok"}
            else:
                response = {"status": "error"}
        else:
            response = {"status": "ok"}
        qsatype.debug(ustr(proceso, response))

    def yeboyebo_dameTiempoSincro(self, proceso):
        if proceso == "continuo":
            return datetime.timedelta(minutes=15)
        elif proceso == "diagfacturacionventas":
            return datetime.timedelta(hours=2)
        elif proceso == "diagventasmagento":
            return datetime.timedelta(hours=2)
        elif proceso == "diagsincroventas":
            return datetime.timedelta(hours=2)
        elif proceso == "diagverificacioncontable":
            return datetime.timedelta(hours=30)
        elif proceso == "diagsaldovales":
            return datetime.timedelta(hours=30)
        elif proceso == "diaganalyticalways":
            return datetime.timedelta(hours=20)
        elif proceso == "diagdevolucionesweb":
            return datetime.timedelta(hours=20)
        elif proceso == "diagcontanalitica":
            return datetime.timedelta(hours=30)
        elif proceso == "diagsolrepoweb":
            return datetime.timedelta(hours=30)
        elif proceso == "diagegpda":
            return datetime.timedelta(hours=30)
        elif proceso == "diagbloqueos":
            return datetime.timedelta(hours=3)
        else:
            return 0

    def yeboyebo_dameNotificadosSincro(self, proceso):
        if proceso == "continuo":
            return ["javier", "ivan"]
        elif proceso == "diagfacturacionventas":
            return ["javier", "santiago", "jesus"]
        elif proceso == "diagventasmagento":
            return ["javier", "santiago", "jesus", "jose", "ivan"]
        elif proceso == "diagsincroventas":
            return ["javier", "santiago", "jesus"]
        elif proceso == "diagverificacioncontable":
            return ["javier", "santiago", "jesus"]
        elif proceso == "diagsaldovales":
            return ["javier", "santiago", "jesus"]
        elif proceso == "diaganalyticalways":
            return ["javier", "santiago"]
        elif proceso == "diagdevolucionesweb":
            return ["javier", "santiago", "jesus"]
        elif proceso == "diagcontanalitica":
            return ["javier", "santiago"]
        elif proceso == "diagsolrepoweb":
            return ["javier", "santiago", "jesus"]
        elif proceso == "diagegpda":
            return ["juanma", "santiago", "jesus"]
        elif proceso == "diagbloqueos":
            return ["javier", "santiago", "jesus", "jose", "ivan"]
        else:
            return ["javier"]

    def yeboyebo_getForeignFields(self, model, template=None):
        return [{"verbose_name": "conditions", "func": "field_condition"}]

    def yeboyebo_field_condition(self, model):
        if model.tipo == "Ventas Tpv":
            hMax = datetime.datetime.now() - datetime.timedelta(hours=2)
            hMin = datetime.datetime.now() - datetime.timedelta(hours=4)
            return {
                "ok": qsatype.FLUtil.sqlSelect("yb_subregdiagnosis", "COUNT(idsubreg)", "idreg = " + str(model.idreg) + " AND timestamp >= '" + str(hMax) + "'"),
                "error": qsatype.FLUtil.sqlSelect("yb_subregdiagnosis", "COUNT(idsubreg)", "idreg = " + str(model.idreg) + " AND timestamp < '" + str(hMin) + "'"),
                "warn": qsatype.FLUtil.sqlSelect("yb_subregdiagnosis", "COUNT(idsubreg)", "idreg = " + str(model.idreg) + " AND timestamp < '" + str(hMax) + "' AND timestamp >= '" + str(hMin) + "'")
            }
        elif model.tipo == "Stock":
            hMax = datetime.datetime.now() - datetime.timedelta(hours=24)
            hMin = datetime.datetime.now() - datetime.timedelta(hours=48)
            return {
                "ok": qsatype.FLUtil.sqlSelect("yb_subregdiagnosis", "COUNT(idsubreg)", "idreg = " + str(model.idreg) + " AND timestamp >= '" + str(hMax) + "'"),
                "error": qsatype.FLUtil.sqlSelect("yb_subregdiagnosis", "COUNT(idsubreg)", "idreg = " + str(model.idreg) + " AND timestamp < '" + str(hMin) + "'"),
                "warn": qsatype.FLUtil.sqlSelect("yb_subregdiagnosis", "COUNT(idsubreg)", "idreg = " + str(model.idreg) + " AND timestamp < '" + str(hMax) + "' AND timestamp >= '" + str(hMin) + "'")
            }
        elif model.tipo == "Arqueos Tpv":
            hMax = datetime.datetime.now() - datetime.timedelta(hours=1)
            hMin = datetime.datetime.now() - datetime.timedelta(hours=2)
            return {
                "ok": qsatype.FLUtil.sqlSelect("yb_subregdiagnosis", "COUNT(idsubreg)", "idreg = " + str(model.idreg) + " AND timestamp >= '" + str(hMax) + "'"),
                "error": qsatype.FLUtil.sqlSelect("yb_subregdiagnosis", "COUNT(idsubreg)", "idreg = " + str(model.idreg) + " AND timestamp < '" + str(hMin) + "'"),
                "warn": qsatype.FLUtil.sqlSelect("yb_subregdiagnosis", "COUNT(idsubreg)", "idreg = " + str(model.idreg) + " AND timestamp < '" + str(hMax) + "' AND timestamp >= '" + str(hMin) + "'")
            }
        else:
            hMax = datetime.datetime.now() - datetime.timedelta(hours=4)
            hMin = datetime.datetime.now() - datetime.timedelta(hours=8)
            return {
                "ok": qsatype.FLUtil.sqlSelect("yb_subregdiagnosis", "COUNT(idsubreg)", "idreg = " + str(model.idreg) + " AND timestamp >= '" + str(hMax) + "'"),
                "error": qsatype.FLUtil.sqlSelect("yb_subregdiagnosis", "COUNT(idsubreg)", "idreg = " + str(model.idreg) + " AND timestamp < '" + str(hMin) + "'"),
                "warn": qsatype.FLUtil.sqlSelect("yb_subregdiagnosis", "COUNT(idsubreg)", "idreg = " + str(model.idreg) + " AND timestamp < '" + str(hMax) + "' AND timestamp >= '" + str(hMin) + "'")
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

    def yeboyebo_dameSubregistrosDiagnosis(self, model):
        haySubReg = qsatype.FLUtil().sqlSelect("yb_subregdiagnosis", "idsubreg", "idreg = " + str(model.pk))
        if haySubReg:
            return '/diagnosis/yb_regdiagnosis/' + str(model.pk)
        else:
            return False

    def yeboyebo_testApi(self, model):
        print("hola mundo")
        tasks.pruebacelerytask.delay()
        return True

    def __init__(self, context=None):
        super(yeboyebo, self).__init__(context)

    def checkdiagnosis(self, params):
        return self.ctx.yeboyebo_checkdiagnosis(params)

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

    def dameSubregistrosDiagnosis(self, model):
        return self.ctx.yeboyebo_dameSubregistrosDiagnosis(model)

    def testApi(self, model):
        return self.ctx.yeboyebo_testApi(model)

    def checkDiagnosisElganso(self, cliente, params):
        return self.ctx.yeboyebo_checkDiagnosisElganso(cliente, params)

    def checkDiagnosisGuanabana(self, cliente, params):
        return self.ctx.yeboyebo_checkDiagnosisGuanabana(cliente, params)

    def checkDiagnosisSanhigia(self, cliente, params):
        return self.ctx.yeboyebo_checkDiagnosisSanhigia(cliente, params)

    def checkContinuos(self, cliente, proceso):
        return self.ctx.yeboyebo_checkContinuos(cliente, proceso)

    def checkDiag(self, cliente, proceso):
        return self.ctx.yeboyebo_checkDiag(cliente, proceso)

    def dameTiempoSincro(self, proceso):
        return self.ctx.yeboyebo_dameTiempoSincro(proceso)

    def dameNotificadosSincro(self, proceso):
        return self.ctx.yeboyebo_dameNotificadosSincro(proceso)


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
