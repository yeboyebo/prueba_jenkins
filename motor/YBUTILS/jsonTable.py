def genera_jsontable(data, name, schema):
    campos = _get_fields(data)
    SCHEMA = _get_schema(data)
    IDENT = {"FILTER": {"p_l": 100}, "ORDER": None, "APLIC": None, "PAG": {"NO": None, "PO": None, "COUNT": None}}
    DATA = _get_data(data, schema)
    LAYOUT = _get_layout(campos, name)
    return LAYOUT, IDENT, DATA, SCHEMA, {"verbose_name": name, "type": "json"}, None


def _get_data(data, schema):
    order = []
    if "querystring" in schema:
        for key in schema["querystring"]:
            if key.startswith("o_"):
                order.append(schema["querystring"][key])

    fields = data.keys()
    if order != []:
        fields = sorted(data, key=lambda x: [data[x][y] for y in order])

    DATA = []
    for x in fields:
        fila = {}
        fila['clave'] = x
        for f in data[x]:
            fila[f] = data[x][f]
        DATA.append(fila)
    return DATA


def _get_fields(data):
    campos = []

    if data == {}:
        return campos

    for x in data[list(data.keys())[0]]:
        campos.append(x)

    return campos


def _get_schema(data):
    SCHEMA = {}
    SCHEMA['clave'] = {}
    SCHEMA['clave']['verbose_name'] = 'clave'
    SCHEMA['clave']['help_text'] = ''
    SCHEMA['clave']['locked'] = False
    SCHEMA['clave']['field'] = False
    SCHEMA['clave']['required'] = False
    SCHEMA['clave']['tipo'] = _get_fieldtype('clave')

    if data == {}:
        return SCHEMA

    for x in data[list(data.keys())[0]]:
        SCHEMA[x] = {}
        SCHEMA[x]['verbose_name'] = x
        SCHEMA[x]['help_text'] = ''
        SCHEMA[x]['locked'] = False
        SCHEMA[x]['field'] = False
        SCHEMA[x]['required'] = False
        SCHEMA[x]['tipo'] = _get_fieldtype(data[list(data)[0]][x])
    return SCHEMA


def _get_layout(campos, name):
    LAYOUT = {}
    columns = _get_columns_layout(campos)
    LAYOUT["jsonGrid_" + name] = {}
    LAYOUT["jsonGrid_" + name] = {
        "componente": "YBGrid",
        "label": "tablaQuery",
        "tipo": "json",
        "prefix": name,
        "filter": "buscador",
        "columns": columns,
        "rowclick": ""
    }

    return LAYOUT


def _get_columns_layout(campos):
    columns = []
    for c in campos:
        columns.append({"tipo": "field", "field": c})
    return columns


def _get_fieldtype(d):
    return 3
