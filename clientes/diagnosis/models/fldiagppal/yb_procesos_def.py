# @class_declaration interna #
from YBLEGACY import qsatype


class interna(qsatype.objetoBase):

    ctx = qsatype.Object()

    def __init__(self, context=None):
        self.ctx = context


# @class_declaration yeboyebo #
import requests
from YBLEGACY.constantes import *
from YBUTILS import notifications
from YBUTILS.viewREST import cacheController


class yeboyebo(interna):

    def yeboyebo_initValidation(self, name, data=None):
        response = True
        if name.endswith("activity"):
            activity = self.iface.getActivity(name)
            cacheController.setSessionVariable("activity", activity)
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
        ff = [
            {'verbose_name': 'ultsincro', 'func': 'field_ultsincro'}
        ]

        if template.endswith("activity"):
            ff.append({'verbose_name': 'activas', 'func': 'field_activas'})
            ff.append({'verbose_name': 'programadas', 'func': 'field_programadas'})
            ff.append({'verbose_name': 'reservadas', 'func': 'field_reservadas'})
        return ff

    def yeboyebo_field_activas(self, model):
        return cacheController.getSessionVariable('activity')['active']

    def yeboyebo_field_programadas(self, model):
        return cacheController.getSessionVariable('activity')['scheduled']

    def yeboyebo_field_reservadas(self, model):
        return cacheController.getSessionVariable('activity')['reserved']

    def yeboyebo_field_ultsincro(self, model):
        q = qsatype.FLSqlQuery()
        q.setSelect("timestamp, texto")
        q.setFrom("yb_log")
        q.setWhere("cliente = '" + model.cliente + "' AND tipo = '" + model.proceso + "' AND texto LIKE 'Éxito%' ORDER BY timestamp DESC LIMIT 1")

        if not q.exec_():
            return "Error. Falló la query."

        if not q.first():
            return "No hay registros."

        tm = qsatype.Date(q.value("timestamp"))
        stm = tm.toString()
        f = stm[:10]
        h = stm[11:19]
        ahora = qsatype.Date()
        if f == ahora.toString()[:10]:
            if parseFloat(str(ahora - tm)[2:4]) < 5.0:
                return "Sincronizado " + h
            f = "Hoy"
        elif f == qsatype.FLUtil.addDays(qsatype.Date(), -1)[:10]:
            f = "Ayer"
        else:
            f = qsatype.FLUtil.dateAMDtoDMA(f)

        return f + " - " + h

    def yeboyebo_getDesc(self):
        desc = None
        return desc

    def yeboyebo_getActivity(self, name):
        try:
            header = {"Content-Type": "application/json"}

            url = None
            if qsatype.FLUtil.isInProd():
                if name.startswith("elganso"):
                    url = 'https://api.elganso.com/models/REST/tpv_comandas/csr/getactivity'
                elif name.startswith("guanabana"):
                    url = 'http://api.guanabana.store:8080/models/REST/tpv_comandas/csr/getactivity'
                elif name.startswith("sanhigia"):
                    url = 'http://store.sanhigia.com:9000/models/REST/empresa/csr/getactivity'
                else:
                    return False
            else:
                if name.startswith("sanhigia"):
                    url = 'http://127.0.0.1:8000/models/REST/empresa/csr/getactivity'
                else:
                    url = 'http://127.0.0.1:8000/models/REST/tpv_comandas/csr/getactivity'

            response = requests.get(url, headers=header)
            stCode = response.status_code
            json = None
            if response and stCode == 200:
                json = response.json()
            else:
                raise Exception("Mala respuesta")

            return json

        except Exception as e:
            print(e)
            qsatype.debug(e)
            return False

        return resul

    def yeboyebo_start(self, model, cursor):
        try:
            if cursor.valueBuffer("activo"):
                return True

            request = qsatype.FLUtil.request()
            meta = getattr(request, "META", None)
            if not meta:
                meta = request["META"]

            try:
                virtualEnv = meta["VIRTUAL_ENV"]
            except Exception:
                virtualEnv = getattr(meta, "VIRTUAL_ENV", None)

            header = {"Content-Type": "application/json"}
            data = {
                "passwd": "bUqfqBMnoH",
                "fakeRequest": {
                    "name": "fake",
                    "user": qsatype.FLUtil.nameUser(),
                    "META": {
                        "SERVER_PORT": meta["SERVER_PORT"],
                        "VIRTUAL_ENV": virtualEnv
                    }
                }
            }

            proceso = cursor.valueBuffer("proceso")
            if cursor.valueBuffer("cliente") == "elganso":
                if proceso.startswith("egsync"):
                    codTienda = proceso[-4:]
                    proceso = proceso[:len(proceso) - 4]
                    data["codtienda"] = codTienda
                resul = None
                if qsatype.FLUtil.isInProd():
                    resul = notifications.post_request('https://api.elganso.com/models/REST/tpv_comandas/csr/' + proceso, header, data)
                else:
                    resul = notifications.post_request('http://127.0.0.1:8000/models/REST/tpv_comandas/csr/' + proceso, header, data)
            elif cursor.valueBuffer("cliente") == "guanabana":
                if qsatype.FLUtil.isInProd():
                    resul = notifications.post_request('http://api.guanabana.store:8080/models/REST/tpv_comandas/csr/' + proceso, header, data)
                else:
                    resul = notifications.post_request('http://127.0.0.1:8000/models/REST/tpv_comandas/csr/' + proceso, header, data)
            elif cursor.valueBuffer("cliente") == "sanhigia":
                if qsatype.FLUtil.isInProd():
                    resul = notifications.post_request('http://store.sanhigia.com:9000/models/REST/empresa/csr/' + proceso, header, data)
                else:
                    resul = notifications.post_request('http://127.0.0.1:8000/models/REST/empresa/csr/' + proceso, header, data)
            else:
                return False

            if not resul:
                return False

            if not qsatype.FLUtil.sqlUpdate("yb_procesos", ["activo"], [True], "id = " + str(cursor.valueBuffer("id"))):
                return False

            tmstmp = qsatype.Date().now()
            qsatype.FLSqlQuery().execSql("INSERT INTO yb_log (texto, cliente, tipo, timestamp) VALUES ('Info. Proceso arrancado', '" + cursor.valueBuffer("cliente") + "', '" + cursor.valueBuffer("proceso") + "', '" + tmstmp + "')")

        except Exception as e:
            print(e)
            qsatype.debug(e)
            return False

        return True

    def yeboyebo_stop(self, model, cursor):
        if not cursor.valueBuffer("activo"):
            print("Ya está inactivo")
            return True

        if not qsatype.FLUtil.sqlUpdate("yb_procesos", ["activo"], [False], "id = " + str(cursor.valueBuffer("id"))):
            return False

        return True

    def yeboyebo_revoke(self, model, cursor, oParam):
        try:
            request = qsatype.FLUtil.request()
            meta = getattr(request, "META", None)
            if not meta:
                meta = request["META"]

            try:
                virtualEnv = meta["VIRTUAL_ENV"]
            except Exception:
                virtualEnv = getattr(meta, "VIRTUAL_ENV", None)

            header = {"Content-Type": "application/json"}
            data = {
                "passwd": "bUqfqBMnoH",
                "fakeRequest": {
                    "name": "fake",
                    "user": qsatype.FLUtil.nameUser(),
                    "META": {
                        "SERVER_PORT": meta["SERVER_PORT"],
                        "VIRTUAL_ENV": virtualEnv
                    }
                },
                "id": oParam["id"]
            }

            if cursor.valueBuffer("cliente") == "elganso":
                resul = None
                if qsatype.FLUtil.isInProd():
                    resul = notifications.post_request('https://api.elganso.com/models/REST/tpv_comandas/csr/revoke', header, data)
                else:
                    resul = notifications.post_request('http://127.0.0.1:8000/models/REST/tpv_comandas/csr/revoke', header, data)
            elif cursor.valueBuffer("cliente") == "guanabana":
                if qsatype.FLUtil.isInProd():
                    resul = notifications.post_request('http://api.guanabana.store:8080/models/REST/tpv_comandas/csr/revoke', header, data)
                else:
                    resul = notifications.post_request('http://127.0.0.1:8000/models/REST/tpv_comandas/csr/revoke', header, data)
            elif cursor.valueBuffer("cliente") == "sanhigia":
                if qsatype.FLUtil.isInProd():
                    resul = notifications.post_request('http://store.sanhigia.com:9000/models/REST/empresa/csr/revoke', header, data)
                else:
                    resul = notifications.post_request('http://127.0.0.1:8000/models/REST/empresa/csr/revoke', header, data)
            else:
                return False

            if not resul:
                return False

        except Exception as e:
            print(e)
            qsatype.debug(e)
            return False

        return True

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

    def field_activas(self, model):
        return self.ctx.yeboyebo_field_activas(model)

    def field_programadas(self, model):
        return self.ctx.yeboyebo_field_programadas(model)

    def field_reservadas(self, model):
        return self.ctx.yeboyebo_field_reservadas(model)

    def field_ultsincro(self, model):
        return self.ctx.yeboyebo_field_ultsincro(model)

    def getDesc(self):
        return self.ctx.yeboyebo_getDesc()

    def getActivity(self, name):
        return self.ctx.yeboyebo_getActivity(name)

    def start(self, model, cursor):
        return self.ctx.yeboyebo_start(model, cursor)

    def stop(self, model, cursor):
        return self.ctx.yeboyebo_stop(model, cursor)

    def revoke(self, model, cursor, oParam):
        return self.ctx.yeboyebo_revoke(model, cursor, oParam)


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
