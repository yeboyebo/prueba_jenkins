# from YBLEGACY.FLSqlQuery import FLSqlQuery
# from YBLEGACY.FLSqlCursor import FLSqlCursor
# from YBLEGACY.FLUtil import FLUtil
from YBLEGACY import qsatype
from YBLEGACY.constantes import *
from YBUTILS.viewREST import clasesBase
from YBLEGACY.FLManager import FLManager
import base64
import shutil
from django.http import HttpResponse
import psycopg2


def verificarConfiguracion():
    campos = "usarbdlocal,servidor,puerto,contrasena,nombrebd,usuario,driver,idconexion"
    mng = FLManager()
    tMtd = mng.metadata("gd_config")
    idconexion = tMtd.field("idconexion")
    if not idconexion:
        campos = "usarbdlocal,servidor,puerto,contrasena,nombrebd,usuario,driver"
    valor = {}
    valor["result"] = 1
    query = qsatype.FLSqlQuery()
    query.setTablesList("gd_config")
    query.setSelect(campos)
    query.setFrom("gd_config")
    query.setWhere("1=1")
    if query.exec_():
        if query.next():
            if idconexion and query.value("idconexion"):
                campos = "servidor,puerto,contrasena,nombrebd,usuario,driver"
                queryConexion = qsatype.FLSqlQuery()
                queryConexion.setTablesList("gd_conexiones")
                queryConexion.setSelect(campos)
                queryConexion.setFrom("gd_conexiones")
                queryConexion.setWhere("id = '" + str(query.value("idconexion")) + "'")
                if queryConexion.exec_():
                    if queryConexion.next():
                        campos = campos.split(",")
                        valor = getCamposFromQuery(valor, queryConexion, campos)
                        valor["usarbdlocal"] = query.value("usarbdlocal")
                        valor["idconexion"] = query.value("idconexion")
                    else:
                        return False
                else:
                    return False
            else:
                campos = campos.split(",")
                valor = getCamposFromQuery(valor, query, campos)
        else:
            return False
    else:
        return False

    return valor


def getCamposFromQuery(valor, query, campos):
    for i in campos:
        valor[i] = query.value(i)
    return valor


def fileUpload(prefix, pk, files, nombre=None, tipo=None):
    print(prefix, pk, files)
    for file in files:
        # print("______________________")
        # print(file)
        for f in files.getlist(file):
            if not AQGesDoc(prefix, pk, f, nombre, tipo):
                return False
    return True


def AQGesDoc(prefix, pk, file, nombre=None, tipo=None):
    # Insertar gd_documentos, gd_versionesdoc, gd_objetodoc
    conf = verificarConfiguracion()
    # print(conf)
    try:
        # print(file)
        # print(file.name)
        # # print(file.read())
        # name = file.name
        # # encode = base64.b64encode(file.read()).decode("utf-8")
        # ba = bytearray(file.read())
        # print(ba)
        # # print(encode)
        # print(1)
        # # decode = base64.b64decode(encode)
        # # print(2)
        # # print(decode)
        # filepath = '/home/juanma/cabreraImg/' + name
        # print(3)
        # print(filepath)
        # with open(filepath, 'wb') as f:
        #     f.write(ba)
        # print("????")

        codigo = obtenerCodigoDoc("general")
        creadopor = "web"
        hoy = qsatype.Date()
        fechacreacion = str(hoy)[:10]
        iddocumento = int(qsatype.FLUtil.sqlSelect(u"gd_documentos", u"nextval('gd_documentos_iddocumento_seq')", "1=1"))
        # print("________________", iddocumento)
        fichero = file.name
        nombre = nombre or file.name
        idversionactual = 1
        codtipo = tipo or "Documento"
        horacreacion = str(hoy)[-8:]
        if "idconexion" in conf:
            idconexion = conf["idconexion"]
        else:
            idconexion = None
        # print("_______________", idconexion)
        if not conf["usarbdlocal"]:
            ficheroLocal = "vacio"
            # fichero = str(base64.b64encode(file.read()).decode("utf-8"))
            fichero = psycopg2.Binary(file.read())
        else:
            # ficheroLocal = str(base64.b64encode(file.read()).decode("utf-8"))
            ficheroLocal = psycopg2.Binary(file.read())
        # print(fichero)
        if not conf["usarbdlocal"]:
            qsatype.FLSqlQuery().execSql("INSERT INTO gd_versionesdoc(modificadopor, horamodif, fechamodif, iddocumento, fichero, contenido, fecha, version) VALUES ('" + creadopor + "','" + horacreacion + "','" + fechacreacion + "','" + str(iddocumento) + "','" + nombre + "','" + str(ficheroLocal) + "','" + fechacreacion + "','" + str(idversionactual) + "')")
            qsatype.FLSqlQuery().execSql("INSERT INTO gd_versionesdoc(modificadopor, horamodif, fechamodif, iddocumento, fichero, contenido, fecha, version) VALUES ('" + creadopor + "','" + horacreacion + "','" + fechacreacion + "','" + str(iddocumento) + "','" + nombre + "'," + str(fichero) + ",'" + fechacreacion + "','" + str(idversionactual) + "')", conf["nombrebd"])
        else:
            qsatype.FLSqlQuery().execSql("INSERT INTO gd_versionesdoc(modificadopor, horamodif, fechamodif, iddocumento, fichero, contenido, fecha, version) VALUES ('" + creadopor + "','" + horacreacion + "','" + fechacreacion + "','" + str(iddocumento) + "','" + nombre + "'," + str(ficheroLocal) + ",'" + fechacreacion + "','" + str(idversionactual) + "')")

        idversionactual = qsatype.FLUtil.sqlSelect(u"gd_versionesdoc", u"idversion", "iddocumento = " + str(iddocumento) + " AND versionrep IS NULL")
        if idconexion:
            into = "gd_documentos(codigo, creadopor, fechacreacion, iddocumento, fichero, nombre, codtipo, idversionactual, horacreacion, idconexion)"
            values = "('" + str(codigo) + "','" + creadopor + "','" + fechacreacion + "','" + str(iddocumento) + "','" + file.name + "','" + nombre + "','" + codtipo + "','" + str(idversionactual) + "','" + horacreacion + "','" + str(idconexion) + "')"
        else:
            into = "gd_documentos(codigo, creadopor, fechacreacion, iddocumento, fichero, nombre, codtipo, idversionactual, horacreacion)"
            values = "('" + str(codigo) + "','" + creadopor + "','" + fechacreacion + "','" + str(iddocumento) + "','" + file.name + "','" + nombre + "','" + codtipo + "','" + str(idversionactual) + "','" + horacreacion + "')"
        qsatype.FLSqlQuery().execSql("INSERT INTO " + into + " VALUES " + values)
        # if not qsatype.FLUtil.sqlInsert(u"gd_documentos", qsatype.Array(["codigo", "creadopor", "fechacreacion", "iddocumento", "fichero", "nombre", "codtipo", "idversionactual", "horacreacion", "idconexion"]), qsatype.Array([codigo, creadopor, fechacreacion, iddocumento, nombre, nombre, codtipo, idversionactual, horacreacion, idconexion])):
        #         print("sale por aqui")
        #         return False
        if not conf["usarbdlocal"]:
            qsatype.FLSqlQuery().execSql("INSERT INTO " + into + " VALUES " + values, conf["nombrebd"])
            # if not qsatype.FLUtil.sqlInsert(u"gd_documentos", qsatype.Array(["codigo", "creadopor", "fechacreacion", "iddocumento", "fichero", "nombre", "codtipo", "idversionactual", "horacreacion", "idconexion"]), qsatype.Array([codigo, creadopor, fechacreacion, iddocumento, nombre, nombre, codtipo, idversionactual, horacreacion, idconexion]), conf["usarbdlocal"]):
            #         print("sale por aqui")
            #         return False

        qsatype.FLSqlQuery().execSql("INSERT INTO gd_objetosdoc(clave, tipoobjeto, iddocumento) VALUES ('" + str(pk) + "','" + prefix + "','" + str(iddocumento) + "')")
        if not conf["usarbdlocal"]:
            qsatype.FLSqlQuery().execSql("INSERT INTO gd_objetosdoc(clave, tipoobjeto, iddocumento) VALUES ('" + str(pk) + "','" + prefix + "','" + str(iddocumento) + "')", conf["nombrebd"])

    except Exception as e:
        print("exception gesdoc: ", e)
        return False
    # try:
    #     fichero = qsatype.FLUtil.sqlSelect(u"gd_versionesdoc", u"contenido", "iddocumento = " + str(iddocumento) + "", cx=conf["nombrebd"])
    #     decode = base64.b64decode(fichero.tobytes())
    #     filepath = '/home/juanma/cabreraImg/' + file.name
    #     with open(filepath, 'wb') as f:
    #         f.write(decode)
    # except Exception as e:
    #     print(e)
    return True


def siguienteNumero(tipo):
    conf = verificarConfiguracion()
    numero = int(qsatype.FLUtil.sqlSelect(u"gd_secuencias", u"valorout", ustr(u"nombre = '", tipo, u"'"))) + 1
    # if not qsatype.FLUtil.sqlUpdate(u"gd_secuencias", u"valorout", numero, ustr(u"nombre = '", tipo, u"'")):
    if not qsatype.FLSqlQuery().execSql("UPDATE gd_secuencias set valorout = '" + str(numero) + "' WHERE nombre = '" + tipo + "'"):
        return False
    if not qsatype.FLSqlQuery().execSql("UPDATE gd_secuencias set valorout = '" + str(numero) + "' WHERE nombre = '" + tipo + "'", conf["nombrebd"]):
        return False
    return numero


def cerosIzquierda(numero, totalCeros):
    ret = str(numero)
    numCeros = totalCeros - len(ret)
    while numCeros > 0:
        ret = "0" + ret
        numCeros = numCeros - 1
    return ret


def obtenerCodigoDoc(tipo):
    numero = siguienteNumero(tipo)
    if not numero:
        return False
    codigo = cerosIzquierda(numero, 10)
    return codigo


def generaFiles(prefix, pk):
    fichero = getFiles(prefix, pk)
    if not fichero:
        return False
    # decode = base64.b64decode(fichero["fichero"])
    decode = fichero["fichero"]
    # print(decode)
    filename = fichero["nombre"]
    disposition = "attachment"
    # response = HttpResponse(content_type='image/png')
    response = HttpResponse()
    response['Content-Disposition'] = '{disposition}; filename="{filename}"'.format(disposition=disposition, filename=filename)
    response.write(decode)
    return response


def getFiles(prefix, pk):
    conf = verificarConfiguracion()
    nombrebd = None
    if not conf:
        return {}
    if not conf["usarbdlocal"]:
        nombrebd = conf["nombrebd"]
    # if not conf["usarbdlocal"]:
    #     iddocumento = qsatype.FLUtil.sqlSelect(u"gd_objetosdoc", u"iddocumento", "clave = '" + str(pk) + "' AND tipoobjeto = '" + str(prefix) + "'", cx=nombrebd)
    # else:
    iddocumento = qsatype.FLUtil.sqlSelect(u"gd_objetosdoc", u"iddocumento", "clave = '" + str(pk) + "' AND tipoobjeto = '" + str(prefix) + "'")
    if not iddocumento:
        return False
    if not conf["usarbdlocal"]:
        fichero = qsatype.FLUtil.sqlSelect(u"gd_versionesdoc", u"contenido", "iddocumento = " + str(iddocumento) + "", cx=nombrebd)
    else:
        fichero = qsatype.FLUtil.sqlSelect(u"gd_versionesdoc", u"contenido", "iddocumento = " + str(iddocumento) + "")
    if fichero:
        fichero = fichero.tobytes()
    if not conf["usarbdlocal"]:
        nombre = qsatype.FLUtil.sqlSelect(u"gd_versionesdoc", u"fichero", "iddocumento = " + str(iddocumento) + "", cx=nombrebd)
    else:
        nombre = qsatype.FLUtil.sqlSelect(u"gd_versionesdoc", u"fichero", "iddocumento = " + str(iddocumento) + "")
    response = {}
    response["nombre"] = nombre
    response["fichero"] = fichero
    return response
