import re
import inspect

from YBLEGACY.FLSqlQuery import FLSqlQuery
from YBLEGACY.FLManager import FLManager
from YBUTILS.viewREST import factorias
from YBUTILS.viewREST import YBLayout
from YBUTILS.viewREST import clasesBase


def genera_querytable(query, name, template_schema, model=None, init_filter=None, app=None):
    q, count = _set_query(query, template_schema, init_filter)
    campos = _dame_campos_query(q)
    SCHEMA = _dame_schema_table(campos, name, model)
    IDENT = _dame_ident(template_schema, count, query)
    DATA = _dame_data(q, campos, name, model)
    INFO = _dame_info(model, DATA, IDENT, name, template_schema["query"], app)
    # Si en el futuro queremos tabla por query por defecto
    # LAYOUT = _dame_layout(campos, name)
    LAYOUT = {}
    OTROS = {}
    # print(init_filter)
    if init_filter and "otros" in init_filter:
        OTROS = init_filter["otros"]
    if init_filter and "filter" in init_filter:
        for f in init_filter["filter"]:
            IDENT["FILTER"][f] = init_filter["filter"][f]
    # Porque funciona?,  mantener el filtro tras lanzar una accion
    IDENT["FILTER"].update(template_schema["query"])
    return LAYOUT, IDENT, DATA, SCHEMA, {"verbose_name": "", "type": "query"}, OTROS, INFO


def _set_query(query, querystring, initFilter):
    limit = ""
    whereParam, orderbyParam = "", ""

    if "filter" not in querystring or querystring["filter"]:
        whereParam, orderbyParam = clasesBase.dameParamsFiltros(querystring["query"])
    else:
        paso, orderbyParam = clasesBase.dameParamsFiltros(querystring["query"])

    if("p_l" in querystring["query"]):
        limit += " LIMIT " + str(querystring["query"]["p_l"])

    if("p_o" in querystring["query"]):
        limit += " OFFSET " + str(querystring["query"]["p_o"])

    if not limit:
        limit = " LIMIT 50 "

    if "database" not in query:
        query["database"] = None

    countQuery = FLSqlQuery(cx=query["database"])
    countQuery.setTablesList(query["tablesList"])
    if "selectcount" not in query:
        query["selectcount"] = u"COUNT(*) as count"
    countQuery.setSelect(query["selectcount"])
    countQuery.setFrom(query["from"])
    where = query["where"] if "where" in query else ""
    if whereParam:
        where += " AND (" + whereParam + ")"
    if initFilter and "where" in initFilter:
        where += initFilter["where"]

    countQuery.setWhere(where)
    if not countQuery.exec_():
        print("fallo count")

    if countQuery.next():
        count = countQuery.value("count")
    else:
        count = 0

    q = FLSqlQuery(cx=query["database"])
    q.setTablesList(query["tablesList"])
    q.setSelect(query["select"])
    q.setFrom(query["from"])

    groupby = " GROUP BY " + query["groupby"] if "groupby" in query else ""
    # Extrae where y order de request.query_params
    orderby = orderbyParam if orderbyParam else query["orderby"] if "orderby" in query else ""
    orderby = " ORDER BY " + orderby if orderby else ""
    where = query["where"] if "where" in query else ""
    if whereParam:
        where += " AND (" + whereParam + ")"
    if initFilter and "where" in initFilter:
        where += initFilter["where"]

    q.setWhere(where + groupby + orderby + limit)

    if not q.exec_():
        print("no se pudo ejecutar consulta querytable")
        return False
    return q, count


def get_foreignfields(model, name=None):
    try:
        calculated_fields = model.getForeignFields(model, name)

        if not calculated_fields or not isinstance(calculated_fields, (list, tuple)):
            calculated_fields = []

        return calculated_fields

    except (NameError, TypeError) as e:
        raise NameError("Ocurrió un error al recuperar los campos calculados (foreignFields) de la query {}/{}: {}".format(model.__module__, name, e))


def _dame_data(q, campos, name, model):
    calculateFields = get_foreignfields(model, name)

    DATA = []
    while q.next():
        fila = {}
        i = 0
        for c in campos:
            if i == 0:
                fila["pk"] = q.value(c)
                i = i + 1
            aField = c.lower().split(" as ")
            if len(aField) == 2:
                fila[aField[1]] = q.value(c)
            else:
                fila[c] = q.value(c)
        for field in calculateFields:
            fun = getattr(model, field["func"])
            fila[field["verbose_name"]] = fun(fila)
        DATA.append(fila)
    return DATA


def _dame_info(meta_model, qry_data, qry_ident, template, qry_filter, app):
    where, orderby = clasesBase.dameParamsFiltros(qry_filter)
    app_info = None
    model_info = None

    try:
        if app:
            viewset = factorias.FactoriaSerializadoresBase.get_app_viewset(app)
            if viewset and viewset.get_app_info is not None:
                app_info = {app: viewset.get_app_info(meta_model, qry_data)}
    except (ImportError, AttributeError):
        app_info = None
    except Exception:
        raise

    try:
        model_info = meta_model.get_model_info(meta_model, qry_data, qry_ident, template, where)
    except AttributeError:
        model_info = None
    except Exception:
        raise

    info = {"app": app_info, "model": model_info}
    return info


def _dame_campos_query(q):
    campos = []
    # TODO usar regex para sacar solo los campos e ignorar comas dentro de ()?
    # for x in q.select().split(","):
    for x in re.split(",(?![^(]*\))", q.select()):
        if x.lower().startswith("distinct("):
            x = x[9:-1]
        campos.append(x.strip())
    return campos


def _dame_schema_table(campos, name, model):
    SCHEMA = {}
    mng = FLManager()
    for x in campos:
        aField = x.lower().split(" as ")
        # TODO poder usar as en los campos de la query Revisar
        # if len(aField) == 2 and len(aField[0].split(".")) <= 1:
        if len(aField) == 2:
            table = aField[0]
            field = aField[1]
            SCHEMA[field] = {}
            SCHEMA[field]["verbose_name"] = field
            SCHEMA[field]["help_text"] = ""
            SCHEMA[field]["locked"] = False
            SCHEMA[field]["field"] = False
            SCHEMA[field]["required"] = False
            SCHEMA[field]["tipo"] = 3
        else:
            dField = x.split(".")
            table = dField[0]
            field = dField[1]
            if len(aField[0].split(".")) > 1:
                asField = aField[0].split(".")
                table = asField[0]
                field = asField[1]
                if len(aField) == 2:
                    x = asField[1]

            try:
                tMtd = mng.metadata(table)
                fMtd = tMtd.field(field)
                SCHEMA[x] = {}
                SCHEMA[x]["verbose_name"] = fMtd.alias()
                SCHEMA[x]["help_text"] = ""
                SCHEMA[x]["locked"] = False
                SCHEMA[x]["field"] = False
                SCHEMA[x]["required"] = False
                SCHEMA[x]["tipo"] = fMtd.type()
                try:
                    if "optionslist" in fMtd._field._legacy_mtd:
                        SCHEMA[x]["optionslist"] = fMtd._field._legacy_mtd["optionslist"]
                        SCHEMA[x]["tipo"] = 5
                except Exception:
                    pass
                if fMtd._field.rel:
                    SCHEMA[x]["rel"] = fMtd._field.related_model._meta.db_table
                    # Buscamos desc y verbose_name de desc si existe el modelo
                    try:
                        rel_serializer, rel_meta_model = factorias.FactoriaSerializadoresBase.getSerializer(fMtd._field.related_model._meta.db_table, None)

                        desc = None
                        desc_function = rel_meta_model.getDesc
                        if desc_function:
                            expected_args = inspect.getargspec(desc_function)[0]
                            new_args = [rel_meta_model]
                            desc = desc_function(*new_args[:len(expected_args)])

                        if not desc or desc is None:
                            desc = rel_meta_model._meta.pk.name

                        SCHEMA[x]["desc"] = desc
                        SCHEMA[x]["verbose_name"] = YBLayout.getYBschema(rel_serializer)[0][desc]["verbose_name"]

                    except (NameError, TypeError) as e:
                        raise NameError("Ocurrió un error al obtener la descripción (getDesc) de {}: {}".format(rel_meta_model.__module__, e))

                    SCHEMA[x]["to_field"] = fMtd._field.to_fields[0]

            except Exception as e:
                print(e)
                print("No está registrada la tabla", table, ". Se añadirá un schema por defecto.")

                SCHEMA[x] = {}
                SCHEMA[x]["verbose_name"] = x
                SCHEMA[x]["help_text"] = ""
                SCHEMA[x]["locked"] = False
                SCHEMA[x]["field"] = False
                SCHEMA[x]["required"] = False
                SCHEMA[x]["tipo"] = 3

    calculateFields = get_foreignfields(model, name)
    for field in calculateFields:
        SCHEMA[field["verbose_name"]] = {}
        SCHEMA[field["verbose_name"]]["verbose_name"] = field["verbose_name"]
        SCHEMA[field["verbose_name"]]["help_text"] = ""
        SCHEMA[field["verbose_name"]]["locked"] = False
        SCHEMA[field["verbose_name"]]["field"] = False
        SCHEMA[field["verbose_name"]]["required"] = False
        SCHEMA[field["verbose_name"]]["tipo"] = 3
    return SCHEMA


def _dame_layout(campos, name):
    LAYOUT = {}
    columns = _dame_columns_layout(campos)
    LAYOUT["queryGrid_" + name] = {}
    LAYOUT["queryGrid_" + name] = {
        "componente": "YBGrid",
        "label": "tablaQuery",
        "prefix": name,
        "filter": "buscador",
        "columns": columns,
        "rowclick": ""
    }

    return LAYOUT


def _dame_columns_layout(campos):
    columns = []
    for c in campos:
        columns.append({"tipo": "field", "key": c})
    return columns


def _dame_ident(schema, count, query):
    IDENT = {"FILTER": {}, "MAINFILTER": {}, "ORDER": None, "APLIC": None, "PAG": {"NO": None, "PO": None, "COUNT": count}}
    if "orderby" in query:
        IDENT["FILTER"] = _dame_order(query["orderby"])
        IDENT["MAINFILTER"] = _dame_order(query["orderby"])
    if "p_l" in schema["query"]:
        IDENT["FILTER"]["p_l"] = schema["query"]["p_l"]
        IDENT["MAINFILTER"]["p_l"] = schema["query"]["p_l"]
        no = int(schema["query"]["p_l"])
        po = None
        if "p_o" in schema["query"]:
            no = int(schema["query"]["p_l"]) + int(schema["query"]["p_o"])
            po = int(schema["query"]["p_o"]) - int(schema["query"]["p_l"])
            if po > 0:
                IDENT["PAG"]["PO"] = po
        IDENT["PAG"]["NO"] = no
    else:
        IDENT["FILTER"]["p_l"] = 100
        IDENT["MAINFILTER"]["p_l"] = 100
    # IDENT["MAINFILTER"] = IDENT["FILTER"]
    return IDENT


def _dame_order(orderby):
    fields = orderby.split(",")
    ORDER = {}
    count = 1
    for f in fields:
        aux = f.strip()
        if aux.find("DESC") > 0:
            aux = "-" + aux[:-4].strip()
        elif aux.find("ASC") > 0:
            aux = aux[:-3].strip()
        ORDER["o_" + str(count)] = aux
        count += 1
    return ORDER
