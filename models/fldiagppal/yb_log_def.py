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
        fields = [
            {'verbose_name': 'descripcionf', 'func': 'field_descripcion'},
            {'verbose_name': 'timestampf', 'func': 'field_timestamp'},
            {'verbose_name': 'rowColor', 'func': 'field_colorRow'}
        ]
        return fields

    def yeboyebo_field_colorRow(self, model):
        try:
            field = model.texto
        except Exception:
            return None

        if field.startswith("Error."):
            return "cDanger"
        elif field.startswith("Info."):
            return "cInfo"
        return None

    def yeboyebo_field_descripcion(self, model):
        desc = None
        if isinstance(model, dict):
            desc = model["yb_log.tipo"]
        else:
            desc = model.tipo

        if desc == "diagcontanalitica":
            desc = "Contabilidad Analítica"
        elif desc == "diagdevolucionesweb":
            desc = "Devoluciones Web"
        elif desc == "diagfacturacionventas":
            desc = "Facturación Ventas"
        elif desc == "diagsaldovales":
            desc = "Saldo Vales"
        elif desc == "diaganalyticalways":
            desc = "Analytic Always"
        elif desc == "diagsincroventas":
            desc = "Ventas Tienda"
        elif desc == "diagsolrepoweb":
            desc = "Solicitudes Reposición Web"
        elif desc == "diagverificacioncontable":
            desc = "Verificación Contable"
        elif desc == "diagbloqueos":
            desc = "Bloqueos"

        return desc

    def yeboyebo_field_timestamp(self, model):
        tm = None
        if isinstance(model, dict):
            tm = model["yb_log.timestamp"]
        else:
            tm = model.timestamp

        stm = str(tm)
        f = stm[:10]
        h = stm[11:19]
        ahora = qsatype.Date()
        if f == ahora.toString()[:10]:
            f = "Hoy"
        elif f == qsatype.FLUtil.addDays(qsatype.Date(), -1)[:10]:
            f = "Ayer"
        else:
            f = qsatype.FLUtil.dateAMDtoDMA(f)

        return f + " - " + h

    def yeboyebo_getDesc(self):
        desc = None
        return desc

    def yeboyebo_queryGrid_diagnosismonitor(self, template):
        query = {}
        query["tablesList"] = u"yb_log"
        query["select"] = u"yb_log.tipo, yb_log.texto, yb_log.timestamp"
        query["from"] = u"yb_log"
        query["where"] = u"id IN (SELECT MAX(id) FROM yb_log GROUP BY cliente, tipo ORDER BY cliente, tipo)"
        query["orderby"] = u"cliente, tipo"
        return query

    def yeboyebo_addlog(self, params):
        response = {}
        if "passwd" in params and params['passwd'] == "prnAc9Pgi5uq":
            if "cliente" not in params or "tipo" not in params or "texto" not in params:
                return {"resul": False, "msg": "Formato incorrecto"}
            cliente = params['cliente']
            texto = params['texto']
            tipo = params['tipo']
            tmstmp = qsatype.Date().now()
            tsDel = qsatype.FLUtil.addDays(tmstmp, -5)

            qsatype.FLSqlQuery().execSql("DELETE FROM yb_log WHERE timestamp < '" + tsDel + "' AND tipo ='" + tipo + "' AND cliente = '" + cliente + "'")

            qsatype.FLSqlQuery().execSql("INSERT INTO yb_log (texto, cliente, tipo, timestamp) VALUES ('" + texto + "', '" + cliente + "', '" + tipo + "', '" + tmstmp + "')")
            response["resul"] = True
            response["status"] = "Ok"
        return response

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

    def field_timestamp(self, model):
        return self.ctx.yeboyebo_field_timestamp(model)

    def field_descripcion(self, model):
        return self.ctx.yeboyebo_field_descripcion(model)

    def field_colorRow(self, model):
        return self.ctx.yeboyebo_field_colorRow(model)

    def getDesc(self):
        return self.ctx.yeboyebo_getDesc()

    def queryGrid_diagnosismonitor(self, template):
        return self.ctx.yeboyebo_queryGrid_diagnosismonitor(template)

    def addlog(self, params):
        return self.ctx.yeboyebo_addlog(params)


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
