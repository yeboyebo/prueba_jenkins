import collections

from django import template
from django.template import Node
from django.conf import settings
from django.utils.translation import to_locale, get_language
from django.utils.safestring import SafeText

from YBWEB.ctxJSON import DICTJSON, templateCTX
from YBUTILS import mylogging as log
from YBUTILS.viewREST import viewsets

register = template.Library()
milog = log.getLogger("templatetag.YBtools")


# -------------------------------------GETLOCALE---------------------------------
@register.simple_tag(takes_context=False)
def locale():
    return to_locale(get_language())


# ------------------------------------- UTILIDADES ------------------------------
def _c2Ctx(context, scadena):
    """
    Obtiene objeto de contexto a partir de cadena XXX.DDD.DDDDD
    """
    # Realmente se ha pasado ya objeto de contexto
    if isinstance(scadena, dict):
        return scadena
    value = context
    if scadena == '':
        return {}
    for ref in scadena.split("."):
        value = value[ref]
    return value


def _setc2Ctx(context, scadena, obj):
    """
       Establece valor de contexto indicado como XXX.XXXX.XXX
    """
    # Realmente se ha pasado ya objeto de contexto
    if isinstance(scadena, dict):
        scadena = obj
    value = context
    modif = scadena.split(".")
    i = 0
    for ref in modif:
        i = i + 1
        if i == len(modif):
            value[ref] = obj
        else:
            try:
                value = value[ref]
            except Exception:
                value[ref] = collections.OrderedDict
                value = value[ref]


def _prefijocomillas(nomtemplate, prefijo=None):
    aux = nomtemplate.replace('"', '')
    aux2 = aux.replace("'", "")
    if prefijo:
        aux = prefijo + aux2
    else:
        aux = aux2
    return "'" + aux + "'"


# ------------------------------------- TRATAMIENTO DICCIONARIOS ------------------------------
@register.filter(name='lookup')
def lookup1(value, arg):
    """
        Obtiene elemento de diccionario
    """
    for ref in arg.split("."):
        value = value[ref]
    return value


@register.filter(name='lookupEmpty')
def lookup2(value, arg):
    """
        Obtiene elemento de diccionario o vacio
    """
    try:
        return lookup1(value, arg)
    except Exception:
        return ''


# ------------------------------------- JSON ------------------------------
@register.simple_tag(takes_context=True)
def toJSON(context, elem_cont):
    """
        Convierte elemento a JSON
    """
    if isinstance(elem_cont, str):
        obj = _c2Ctx(context, elem_cont)
    else:
        obj = elem_cont
    try:
        return DICTJSON.toJSON(obj)
    except Exception:
        return str(obj)


def fromJSON(parser, token):
    """
        Inlusion de Objeto JSON a elemento de contexto
    """
    bits = token.split_contents()
    if len(bits) != 2:
        raise TemplateSyntaxError("'%s' takes one argument" % bits[0])
    nodelist = parser.parse(('endfromJSON',))
    parser.delete_first_token()
    obj = bits[1]
    return clsfromJSON(nodelist, obj)


class clsfromJSON(template.Node):
    def __init__(self, nodelist, obj):
        self.nodelist = nodelist
        self.obj = obj

    def render(self, context):
        output = self.nodelist.render(context)
        try:
            _setc2Ctx(context, self.obj, DICTJSON.fromJSON(output))
        except Exception as inst:
            milog.error("Error al convertir a JSON %s", inst)
            if settings.DEBUG:
                return "ERROR PROCESADO JSON" + output

        return ""


register.tag('fromJSON', fromJSON)


# ------------------------------------- INCLUSION DE TEMPLATES CON CHAIN -------------------
def includechaincomp(parser, tocken):
    """ Permite hacer un include pero teniendo en cuenta el chain de
        templates.
        PAra ello ejecutamos el include basico pero creando un wrapper de la clase render
    """
    class WrapperIncludeNode(Node):
        def __init__(self, objInclude):
            self.objInclude = objInclude

        def template(self, context):
            return self.objInclude.template.resolve(context)

        def settemplate(self, value):
            self.objInclude.template.filters = []
            self.objInclude.template.tocken = value
            self.objInclude.template.var = SafeText(value)

        def render(self, context):
            # trabajamos con objInclude.template que es el nombre
            milist = templateCTX.damechainComponent(aplic, prefix, self.template(context))
            for mitemp in milist:
                try:
                    self.settemplate(mitemp)
                    return self.objInclude.render(context)
                except template.base.TemplateDoesNotExist:
                    pass
            raise template.base.TemplateDoesNotExist("Template %s no encontrada en chain" % self.template)

    # HACEMOS COMO SI LLAMARAMOS A BASE Y WRAPEAMOS
    return WrapperIncludeNode(template.loader_tags.do_include(parser, tocken))


register.tag('includechaincomp', includechaincomp)


class WrapperIncludeNodeNoError(Node):
        def __init__(self, objInclude):
            self.objInclude = objInclude

        def render(self, context):
            try:
                return self.objInclude.render(context)
            except template.base.TemplateDoesNotExist:
                return ''


def tryinclude(parser, tocken):
    """ Permite hacer include pero no da error si no existe el template
    """
    return WrapperIncludeNodeNoError(template.loader_tags.do_include(parser, tocken))


register.tag('tryinclude', tryinclude)


def includebasecomp(parser, tocken):
    """ Permite hacer un include pero del base
        PAra ello simplemente incluimos en el primer tocken la ruta base
    """
    bits = tocken.split_contents()
    mitemplate = bits[1]
    mitemplate2 = _prefijocomillas(mitemplate, templateCTX.directorio_base_componentes + "/")
    tocken.contents = tocken.contents.replace(mitemplate, mitemplate2)
    return template.loader_tags.do_include(parser, tocken)


register.tag('includebasecomp', includebasecomp)


def includechain(parser, tocken):
    """ Permite hacer un include pero teniendo en cuenta el chain de
        templates.
        PAra ello ejecutamos el include basico pero creando un wrapper de la clase render
    """
    class WrapperIncludeNode(Node):
        def __init__(self, objInclude):
            self.objInclude = objInclude

        def template(self, context):
            return self.objInclude.template.resolve(context)

        def settemplate(self, value):
            self.objInclude.template.filters = []
            self.objInclude.template.tocken = value
            self.objInclude.template.var = SafeText(value)

        def render(self, context):
            # trabajamos con objInclude.template que es el nombre
            xtemplate, modif1 = templateCTX.separatemplateModif(self.template(context))
            xtemplate, prefix1 = templateCTX.separatemplatePREFIJO(xtemplate)
            aplic, prefix2, modif2 = templateCTX.dameAPLICPREFIXMODIF(context)
            modif = modif1 if modif1 else modif2
            prefix = prefix1 if prefix1 else prefix2
            milist = templateCTX.damechainTemplate(aplic, prefix, xtemplate, modif)

            for mitemp in milist:
                try:
                    self.settemplate(mitemp)
                    return self.objInclude.render(context)
                except template.base.TemplateDoesNotExist:
                    pass
            raise template.base.TemplateDoesNotExist("Template %s no encontrada en chain" % self.template(context))

    # HACEMOS COMO SI LLAMARAMOS A BASE Y WRAPEAMOS
    return WrapperIncludeNode(template.loader_tags.do_include(parser, tocken))


register.tag('includechain', includechain)


def includebase(parser, tocken):
    """ Permite hacer un include pero del base
        PAra ello simplemente incluimos en el primer tocken la ruta base
    """
    bits = tocken.split_contents()
    mitemplate = bits[1]
    mitemplate2 = _prefijocomillas(mitemplate, templateCTX.directorio_base + "/")
    tocken.contents = tocken.contents.replace(mitemplate, mitemplate2)
    return template.loader_tags.do_include(parser, tocken)


register.tag('includebase', includebase)


def extendsbase(parser, tocken):
    """ Permite hacer un include pero del base
        PAra ello simplemente incluimos en el primer tocken la ruta base
    """
    bits = tocken.split_contents()
    mitemplate = bits[1]
    mitemplate2 = _prefijocomillas(mitemplate, templateCTX.directorio_base + "/")
    tocken.contents = tocken.contents.replace(mitemplate, mitemplate2)
    return template.loader_tags.do_extends(parser, tocken)


register.tag('extendsbase', extendsbase)


def includeInvocacion(parser, token):
    """
        LLamada a funcion general de invocacion mediante paso de objeto JSON
    """
    class CallclsfromJSON(template.Node):
        def __init__(self, nodelist):
            self.nodelist = nodelist

        def render(self, context):
            output = self.nodelist.render(context)
            try:
                obj2 = DICTJSON.fromJSON(output)
            except Exception as inst:
                milog.error("Error al convertir a JSON %s", inst)
                if settings.DEBUG:
                    return "ERROR PROCESADO JSON" + output
            isquery = True
            if obj2["TIPO"] == "I" or obj2["TIPO"] == "O":
                isquery = False
            context.push()
            aux = viewsets.YBMIXINCTXtemplate.respuestapeticionCTX(context, obj2["APLICACION"], obj2["PREFIJO"], obj2["TEMPLATE"], obj2.get("QUERYSTRING", {}), obj2.get("PK", None), isquery, obj2.get("MODIF", None), obj2.get("PARAM", None))
            context.pop()
            return aux

    nodelist = parser.parse(('endincludeInvocacion',))
    parser.delete_first_token()
    return CallclsfromJSON(nodelist)


register.tag('includeInvocacion', includeInvocacion)


@register.simple_tag(takes_context=True)
def envDATA(context, elem_cont):
    """
        Para Probar cosas, mostrara por pantalla usuario, conexion a BBDD...
    """
    resul = list()
    try:
        from YBUTILS.DbRouter import dameConexionDef
        from django.db import connection
        from copy import deepcopy
        micon = dameConexionDef()
        resul.append("BBDD POR LIBRERIA--------------------------")
        resul.append(micon.alias)
        auxdict = deepcopy(micon.settings_dict)
        auxdict["PASSWORD"] = "XXXXXXX"
        resul.append(DICTJSON.toJSON(auxdict))
        micon = dameConexionDef()
        resul.append("BBDD django.db.connection-------------------")
        micon = connection
        resul.append(micon.alias)
        auxdict = deepcopy(micon.settings_dict)
        auxdict["PASSWORD"] = "XXXXXXX"
        resul.append(DICTJSON.toJSON(auxdict))
    except Exception:
        pass
    try:
        # requiere TEMPLATE_CONTEXT_PROCESSORS=('django.core.context_processors.request',)
        mireq = context['request']
        resul.append("HTTP HEADERS-------------------")
        for k, v in mireq.META.items():
            try:
                resul.append(str(k) + "--->" + str(v))
            except Exception:
                pass
    except Exception:
        pass

    return "<br/>".join(resul)
