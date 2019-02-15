#!/usr/bin/env python
# -*- coding: utf-8 -*-
import datetime
import calendar

from django.db import transaction

from YBLEGACY.constantes import *
from YBLEGACY.FLManager import *
from YBLEGACY.FLAux import FLAux
from YBLEGACY.FLSqlQuery import FLSqlQuery
from YBLEGACY.FLSqlCursor import FLSqlCursor

from YBUTILS import mylogging as log
from YBUTILS.viewREST import cacheController
from YBUTILS.DbRouter import dameConexionDef

milog = log.getLogger("LEGACY.FLUtil")
sys = SysType()


class FLUtil:

    # -------PROTECTED -----------------------------------------------
    # Metodos para la gestion de modelos (Incluye el registro de funciones de evento

    # -------PUBLIC -----------------------------------------------
    @classmethod
    # Por hacer
    def enLetraMoneda(cls, importe, divisa):
        return ''

    @classmethod
    def addDays(cls, start_date, num_days):
        from YBLEGACY import qsatype
        if isinstance(start_date, str):
            start_date = qsatype.Date(start_date)
        elif isinstance(start_date, datetime.date):
            start_date = qsatype.Date(start_date.year, start_date.month, start_date.day)
        dDate = start_date
        end_date = dDate + datetime.timedelta(days=num_days)
        return qsatype.Date(end_date).toString()

    @classmethod
    def addMonths(cls, start_date, num_months):
        from YBLEGACY import qsatype
        if isinstance(start_date, str):
            start_date = qsatype.Date(start_date)
        elif isinstance(start_date, datetime.date):
            start_date = qsatype.Date(start_date.year, start_date.month, start_date.day)
        month = start_date.getMonth() - 1 + num_months
        year = int(start_date.getYear() + month / 12)
        month = month % 12 + 1
        day = min(start_date.getDate(), calendar.monthrange(year, month)[1])
        return qsatype.Date(year, month, day, start_date.getHours(), start_date.getMinutes(), start_date.getSeconds()).toString()

    @classmethod
    def addYears(cls, start_date, num_years):
        from YBLEGACY import qsatype
        if isinstance(start_date, str):
            start_date = qsatype.Date(start_date)
        elif isinstance(start_date, datetime.date):
            start_date = qsatype.Date(start_date.year, start_date.month, start_date.day)
        year = start_date.getYear() + num_years
        day = min(start_date.getDate(), calendar.monthrange(year, start_date.getMonth())[1])
        return qsatype.Date(year, start_date.getMonth(), day, start_date.getHours(), start_date.getMinutes(), start_date.getSeconds()).toString()

    @classmethod
    def roundFieldValue(cls, numero, stabla, campo):
        if isNaN(numero):
            return 0

        decimales = 100
        try:
            model = FLAux.obtener_modelo_simple(stabla)
            micampo, a, b, c = model._meta.get_field_by_name(campo)
            # micampo = getattr(model, campo)
            oldTipo = micampo._legacy_mtd["OLDTIPO"]
            if oldTipo == "INT" or oldTipo == "UINT":
                return int(round(numero, 0))
            else:
                return round(numero, oldTipo.partD)
        except Exception:
            pass
        # A revisar para ver exactamente que tipo hay que devolver, esto devuelve float
        return round(numero, decimales)

    @classmethod
    def dateAMDtoDMA(cls, sfecha):
        try:
            saux = sfecha.split("-")
            return saux[2] + "-" + saux[1] + "-" + saux[0]
        except Exception:
            return sfecha

    @classmethod
    def dateDMAtoAMD(cls, sfecha):
        try:
            saux = sfecha.split("-")
            return saux[2] + "-" + saux[1] + "-" + saux[0]
        except Exception:
            return sfecha

    @classmethod
    def calcularDC(cls, n):
        tabla = [6, 3, 7, 9, 10, 5, 8, 4, 2, 1]
        suma = 0
        nDigitos = len(n) - 1

        ct = 1
        while ct <= len(n):
            suma += tabla[nDigitos] * (ord(n[ct - 1]) - ord('0'))
            nDigitos -= 1
            ct += 1

        dc = 11 - (suma % 11)
        if dc == 11:
            dc = 0
        elif dc == 10:
            dc = 1

        return str(dc)

    @classmethod
    def daysTo(cls, fecha1, fecha2):
        try:
            # Atencion, el orden de las fechas esta cambiado
            Dfecha1 = cls.__fechaDeCadena(fecha2)
            Dfecha2 = cls.__fechaDeCadena(fecha1)
            return Dfecha1.toordinal() - Dfecha2.toordinal()
        except Exception:
            return None

    @classmethod
    def formatoMiles(cls, numero):
        try:
            return "{:,}".format(Decimal(numero))
        except Exception:
            return numero

    @classmethod
    def nombreCampos(cls, stabla):
        try:
            model = FLAux.obtener_modelo_simple(stabla)
            return model._meta.get_all_field_names()
        except Exception:
            return []

    @classmethod
    def fieldType(cls, table, name):
        tMD = FLTableMetaData(table)
        if not tMD:
            return None

        field = tMD.field(name)
        if not field:
            return None

        type = field.type()
        return type

    @classmethod
    def nextCounter(cls, name, cursor_):
        if not cursor_:
            return None

        tMD = FLTableMetaData(cursor_._model)
        if not tMD:
            return None

        field = tMD.field(name)
        if not field:
            return None

        type_ = field.type()
        if type_ != 3 and type_ != 19:
            return None

        leng = field.length()
        cadena = ""

        # TO DO -> Añadir connection a la query
        q = FLSqlQuery()
        # q.setForwardOnly(true)
        q.setTablesList(tMD.name())
        q.setSelect(name)
        q.setFrom(tMD.name())
        slen = ustr(u"LENGTH(", name, u")=", leng)
        q.setWhere(slen)
        q.setOrderBy(name + " DESC")
        if not q.exec_():
            return None

        maxRange = pow(10, leng)
        numero = maxRange

        while numero >= maxRange:
            if not q.next():
                numero = 1
                break
            numero = int(q.value(0))
            numero += 1
        if type_ == 3:
            cadena = str(numero)
            string = ""
            while len(string) < (leng - len(cadena)):
                string = ustr(u"0", string)

            cadena = string + cadena
            return cadena

        if type_ == 19:
            return numero
        return None

    # ----Funciones SQL rapidas
    @classmethod
    def execSql(cls, sql, connection=None):
        try:
            micursor = cls.__damecursor(connection)
            micursor.execute(sql)
        except Exception as exc:
            print("Error execSql:", exc)
            milog.debug("Error execSql:", exc)
            return False
        else:
            return True

    @classmethod
    def __damecursor(cls, connection):
        if connection:
            return connections[connection].cursor()
        else:
            return dameConexionDef().cursor()

    @classmethod
    def sqlInsert(cls, tabla, campos, valores, cx=None):
        try:
            cursor = FLSqlCursor(tabla, cx)
            cursor.setModeAccess(cursor.Insert)
            for i in range(len(campos)):
                cursor.setValueBuffer(campos[i - 1], valores[i - 1])
            return cursor.commitBuffer()
        except Exception:
            return False

    @classmethod
    def sqlSelect(cls, tabla, select, where, tableslist='', cx=None):
        """
        try:
            cursor=FLSqlCursor(tabla)
            cursor.select(where)
            if cursor.first():
                return cursor.valueBuffer(select)
            else:
                return None
        except Exception:
            return None
        """
        try:
            q = FLSqlQuery("", cx)
            q.setSelect(select)
            q.setFrom(tabla)
            q.setWhere(where)
            if not q.exec_():
                return None
            if q.first():
                return q.value(select)
            else:
                return None

        except Exception as exc:
            if q:
                milog.error("Error sqlSelect %s ", q.sql())
                milog.debug("Error sqlSelect %s %s", q.sql(), exc.__str__())
                print("Error sqlSelect %s ", q.sql())
            else:
                milog.error("Error sqlSelect")
                milog.debug("Error sqlSelect %s ", exc.__str__())
                print("Error sqlSelect %s ", exc.__str__())

            return None

    @classmethod
    def quickSqlSelect(cls, tabla, select, where, cx=None):
        return cls.sqlSelect(tabla, select, where, cx)

    @classmethod
    def sqlUpdate(cls, tabla, campos, valores, where):
        try:
            cursor = FLSqlCursor(tabla)
            cursor.select(where)
            bValor = True

            if not isinstance(campos, (list, tuple)):
                aCampos = campos.split(',')
            else:
                aCampos = campos

            if not isinstance(valores, (list, tuple)):
                aValores = str(valores).split(',')
            else:
                aValores = valores

            while (cursor.next()):
                cursor.setModeAccess(cursor.Edit)
                for i in range(len(aCampos)):
                    # cursor.setValueBuffer(aCampos[i - 1], aValores[i - 1])
                    # Juanma
                    if aValores[i - 1] is None or aValores[i - 1] == "None" or aValores[i - 1] == "":
                        cursor.setNull(aCampos[i - 1])
                    else:
                        cursor.setValueBuffer(aCampos[i - 1], aValores[i - 1])
                bValor = bValor and cursor.commitBuffer()
            return bValor
        except Exception as exc:
            print(exc.__str__())
            return False

    @classmethod
    def sqlDelete(cls, tabla, where):
        try:
            cursor = FLSqlCursor(tabla)
            cursor.select(where)
            bValor = True
            while (cursor.next()):
                cursor.setModeAccess(cursor.Del)
                bValor = bValor and cursor.commitBuffer()
            return bValor
        except Exception as e:
            print("sql delete ", e)
            return False

    # -------Settings----------

    @classmethod
    def readDBSettingEntry(cls, key):
        # tmp. Por no registrar la tabla
        return cls.sqlSelect("flsettings", "valor", "flkey = '" + str(key) + "'")

        # q = FLSqlQuery()
        # q.setSelect("valor")
        # q.setFrom("flsettings")
        # q.setWhere(ustr(u"flkey = '", key, u"'"))
        # if not q.exec_():
        #     return None
        # if q.first():
        #     return q.value("valor")
        # else:
        #     return None

    @classmethod
    def writeDBSettingEntry(cls, key, value):
        # tmp. Por no registrar la tabla
        if not cls.readDBSettingEntry(key):
            if not cls.execSql("INSERT INTO flsettings (flkey, valor) VALUES ('" + str(key) + "', '" + str(value) + "');"):
                return False
        else:
            if not cls.execSql("UPDATE flsettings SET valor = '" + str(value) + "' WHERE flkey = '" + str(key) + "';"):
                return False

        return True

        # cursor = FLSqlCursor("flsettings")
        # cursor.select(ustr(u"flkey = '", key, "'"))
        # if cursor.first():
        #     cursor.setModeAccess(cursor.Edit)
        #     cursor.refreshBuffer()
        #     cursor.setValueBuffer("valor", value)
        #     return cursor.commitBuffer()
        # else:
        #     cursor.setModeAccess(cursor.Insert)
        #     cursor.refreshBuffer()
        #     cursor.setValueBuffer("flkey", key)
        #     cursor.setValueBuffer("valor", value)
        #     return cursor.commitBuffer()

    # -------PROGRESO????
    @classmethod
    def createProgressDialog(cls, lable, nPasos):
        pass

    @classmethod
    def destroyProgressDialog(cls):
        pass

    @classmethod
    def infoMsgBox(cls, msg):
        pass

    @classmethod
    def setProgress(cls, i):
        pass

    # -------- Funciones sys.qs / se dejan para que no falle (constantes.SysType()) ---------------------

    @classmethod
    def interactiveGUI(cls):
        return sys.interactiveGUI()

    @classmethod
    def isLoadedModule(cls, module):
        return sys.isLoadedModule(module)

    @classmethod
    def translate(cls, sCadena, contexto=None):
        return sys.translate(sCadena, contexto)

    @classmethod
    def nameUser(cls):
        return sys.nameUser()

    @classmethod
    def userGroups(cls):
        return sys.userGroups()

    @classmethod
    def isInProd(cls):
        return sys.isInProd()

    @classmethod
    def request(cls):
        return sys.request()

    @classmethod
    def nameBD(cls):
        return sys.nameBD()

    @classmethod
    def warnMsgBox(cls, a):
        return sys.warnMsgBox(a)

    @classmethod
    def transactionLevel(cls):
        return sys.transactionLevel()

    @classmethod
    def projectRoot(cls):
        return sys.projectRoot()

        # -------PRIVADOS -----------------------------------------------

    @classmethod
    def __fechaDeCadena(cls, sFecha):
        try:
            from YBLEGACY import qsatype
            if isinstance(sFecha, str):
                sFecha = qsatype.Date(sFecha)
            elif isinstance(sFecha, datetime.date):
                sFecha = qsatype.Date(sFecha.year, sFecha.month, sFecha.day)
            # if isinstance(sFecha, qsatype.miDatetime):
            #     sFecha = sFecha.toString()[:10]
            # fecha = datetime.datetime.strptime(sFecha, "%Y-%m-%d")
            # # esto es un struct_time
            # fecha2 = datetime.date(fecha.tm_year, fecha.tm_mon, fecha.tm_mday)
            return sFecha
        except Exception:
            return None

    # ------------Metodos AQNEXT -----------------------
    @classmethod
    def ponMsgError(cls, msg, error=None):
        cacheController.setSessionVariable(u"msgError", msg)

    @classmethod
    def msgError(cls):
        error = cacheController.getSessionVariable(u"msgError")
        cacheController.setSessionVariable(u"msgError", None)
        return error

    @transaction.atomic
    def deleteCascade(collector, field, sub_objs, using):
        for o in sub_objs:
            try:
                cursor = FLSqlCursor(field.model._meta.db_table)
                cursor.select(field.model._meta.pk.name + "=" + str(o.pk))
                if cursor.next():
                    cursor.setModeAccess(cursor.Del)
                    if not cursor.commitBuffer():
                        raise Exception("No pudo eliminar " + str(field.model._meta.db_table) + " : " + str(o.pk))
            except Exception:
                raise Exception("No pudo eliminar " + str(field.model._meta.db_table) + " : " + str(o.pk))
        # -----------CODIGO DEL DELETE CASCADE DE DJANGO----------------
        # collector.collect(sub_objs, source=field.rel.to,
        #                   source_attr=field.name, nullable=field.null)
        # if field.null and not connections[using].features.can_defer_constraint_checks:
        #     collector.add_field_update(field, None, sub_objs)
