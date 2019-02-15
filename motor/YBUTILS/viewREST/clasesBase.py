from collections import OrderedDict

from YBLEGACY.constantes import *
from YBWEB.ctxJSON import templateCTX


def getDrawIf(dIn, model, cursor):
    funcs = {}
    parents = {}
    dOut = {}
    parentStatus = False

    if not dIn or dIn == {}:
        return dOut

    for parent in dIn:
        if parent in parents:
            parentStatus = parents[parent]
        if parentStatus == "hidden":
            continue
        if parent not in dOut:
            dOut[parent] = {}
        for child in dIn[parent]:
            if parentStatus == "disabled":
                dOut[parent][child] = parentStatus

            elif isinstance(dIn[parent][child], str):
                childOut = False
                if not dIn[parent][child] in funcs:
                    try:
                        func = getattr(model, dIn[parent][child])
                        childOut = func(cursor)
                    except Exception as e:
                        print(e)
                        pass
                    funcs[dIn[parent][child]] = childOut

                dOut[parent][child] = funcs[dIn[parent][child]]
            else:
                childOut = defaultDrawIf(dIn[parent][child], cursor)
                dOut[parent][child] = childOut
            parents[child] = dOut[parent][child]
    return dOut


def defaultDrawIf(dIn, cursor):
    # Si no tiene condiciones el tipo se aplica automaticamente
    if "condiciones" not in dIn:
        return dIn["tipo"]
    condiciones = dIn["condiciones"]
    for cond in condiciones:
        real = cursor.valueBuffer(cond["campo"])
        if cond["campo"] == "count":
            real = cursor.size()
        if not condicionDefault(cond["tipo"], real, cond["valor"]):
            return False
    return dIn["tipo"]


def condicionDefault(tipo, real, esperado):
    if isinstance(real, int):
        esperado = parseInt(esperado)
    if isinstance(real, float):
        esperado = parseFloat(esperado)

    if tipo == "==":
        return real == esperado
    elif tipo == "!=":
        return real != esperado
    elif tipo == ">":
        return real > esperado
    elif tipo == ">=":
        return real >= esperado
    elif tipo == "<":
        return real < esperado
    elif tipo == "<=":
        return real <= esperado
    elif tipo == "in":
        return real in esperado
    elif tipo == "notin":
        return real not in esperado
    elif tipo == "notnull":
        if real:
            return True
        else:
            return False
    return False


def dameParamsFiltros(params):
    orWhere = ""
    andWhere = ""
    where = ""
    orderby = ""
    params = OrderedDict(sorted(params.items(), key=lambda x: x[0]))
    for p in params:
        if p.startswith("q_"):
            orWhere += " OR " if len(orWhere) else ""
            orWhere += dameWhereParam(p, params[p])
        elif p.startswith("s_"):
            andWhere += " AND " if len(andWhere) else ""
            andWhere += dameWhereParam(p, params[p])
        elif p.startswith("o_"):
            orderby += dameOrderParam(p, params[p])

    if andWhere != "":
        where += andWhere
    if orWhere != "":
        where += " OR (" + orWhere + ")" if len(where) else orWhere

    if orderby:
        orderby = orderby.strip()[:-1]

    return where, orderby


def dameOrderParam(param, valor):
    if valor.startswith("-"):
        valor = valor[1:] + " DESC, "
    else:
        valor += ", "
    return valor


def dameWhereParam(param, valor):
    aParam = param.split("__")
    campo = "_".join(aParam[0].split("_")[1:])
    tipo = aParam[1]
    where = ""
    if campo == "pk":
        return "1=1"

    if tipo == "contains":
        where = campo + " LIKE '%" + valor + "%'"
    elif tipo == "icontains":
        where = "UPPER(CAST(" + campo + " AS TEXT)) LIKE UPPER('%" + valor + "%')"
    elif tipo == "exact":
        where = campo + " = '" + valor + "'"
    elif tipo == "iexact":
        where = "UPPER(CAST(" + campo + " AS TEXT)) = UPPER('" + valor + "')"
    elif tipo == "startswith":
        where = campo + " LIKE '" + valor + "%'"
    elif tipo == "istartswith":
        where = campo + " ILIKE '" + valor + "%'"
    elif tipo == "endswith":
        where = campo + " LIKE '%" + valor + "'"
    elif tipo == "iendswith":
        where = campo + " ILIKE '%" + valor + "'"
    elif tipo == "lt":
        where = campo + " < '" + valor + "'"
    elif tipo == "lte":
        where = campo + " <= '" + valor + "'"
    elif tipo == "gt":
        where = campo + " > '" + valor + "'"
    elif tipo == "gte":
        where = campo + " >= '" + valor + "'"
    elif tipo == "ne":
        where = campo + " <> '" + valor + "'"
    elif tipo == "in":
        where = campo + " IN ('" + "', '".join(valor) + "')"

    return where


def getAplicFromTemplate(template):
    dctMenu = templateCTX.cargaMenuJSON("portal/menu_portal.json")
    dctMenu = dctMenu["items"]
    for aplic in dctMenu:
        # Cargamos ese menu si existe
        menuItem = templateCTX.cargaMenuJSON(aplic["NAME"] + "/menu_" + aplic["NAME"] + ".json")["items"]
        for t in menuItem:
            if t["NAME"] == template:
                return aplic["NAME"]


def getTemplatesFromAplic(aplication):
    templates = []
    dctMenu = templateCTX.cargaMenuJSON("portal/menu_portal.json")
    dctMenu = dctMenu["items"]
    for aplic in dctMenu:
        if aplication == aplic["NAME"]:
            menuItem = templateCTX.cargaMenuJSON(aplic["NAME"] + "/menu_" + aplic["NAME"] + ".json")["items"]
            for template in menuItem:
                # tempObj = {}
                # tempObj["name"] = template["NAME"]
                # tempObj["text"] = template["TEXT"]
                templates.append(template["NAME"])
    return templates
