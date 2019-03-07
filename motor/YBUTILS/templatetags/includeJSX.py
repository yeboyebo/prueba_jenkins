"""
   Template tags para el tratamiento de JSX y JS dentro de los templates
   Se hace inyeccion de modulos comunes
"""
from django import template
from react import jsx
from YBUTILS import mylogging as log
from uuid import uuid4

register = template.Library()

milog = log.getLogger("templatetag.includeJSX")


def _cMc(modulo):
    return 'YEBOYEBO.' + modulo


def incJS(parser, token):
    """ Inlusion de Javascript en templates mediante funcion oculta sin acceso a globales
    """
    class trataJS(template.Node):
        def __init__(self, nodelist1, nodelist2, includes):
            self.nodelist1 = nodelist1
            self.nodelist2 = nodelist2
            self.includes = includes

        def render(self, context):
            # milog.debug("Render JS")
            output1 = self.nodelist1.render(context)
            output2 = self.nodelist2.render(context)
            return "<script>(function(" + ",".join(self.includes) + "){ " + output1 + output2 + " })(" + ",".join(map(_cMc, self.includes)) + ");</script>"

    nodelist1 = parser.parse(('endVar',))
    parser.delete_first_token()
    nodelist2 = parser.parse(('endincJS',))
    parser.delete_first_token()
    includes = token.contents.split()[1:]
    return trataJS(nodelist1, nodelist2, includes)


register.tag('incJS', incJS)


def incJSX(parser, token):
    """ Inlusion de JSX en templates mediante funcion oculta sin acceso a globales
        Se realiza compilado de JSX , pendiente en produccion no realizarlo.
    """
    class trataJSX(template.Node):
        def __init__(self, nodelist1, nodelist2, includes):
            self.nodelist1 = nodelist1
            self.nodelist2 = nodelist2
            self.includes = includes

        def render(self, context):
            transformer = jsx.JSXTransformer()
            output1 = self.nodelist1.render(context)
            output2B = self.nodelist2.render(context)
            milog.debug("Compilando JSX ")
            try:
                output2 = transformer.transform_string(output2B)
            except Exception as inst:
                milog.error("Error al compilar JSX %s", inst)
                output2 = 'alert("error JSX");'

            return "<script>(function(" + ",".join(self.includes) + "){ " + output1 + output2 + " })(" + ",".join(map(_cMc, self.includes)) + ");</script>"

    nodelist1 = parser.parse(('endVar',))
    parser.delete_first_token()
    nodelist2 = parser.parse(('endincJSX',))
    parser.delete_first_token()
    includes = token.contents.split()[1:]
    return trataJSX(nodelist1, nodelist2, includes)


register.tag('incJSX', incJSX)


def withID(parser, token):
    """ Hace PUSH DE UN ID UNICO EN CONTEXT
    """
    class CwithID(template.Node):
        def __init__(self, nodelist1):
            self.nodelist1 = nodelist1

        def render(self, context):
            unique = uuid4().hex
            context.push()
            context["YBID"] = unique
            aux = self.nodelist1.render(context)
            context.pop()
            return aux

    nodelist1 = parser.parse(('endwithID',))
    parser.delete_first_token()
    return CwithID(nodelist1)


register.tag('withID', withID)


def incContainer(parser, token):
    """ Inlusion de Container
    """
    class trataContainer(template.Node):
        def __init__(self, nodelist1, nodelist2, includes):
            self.nodelist1 = nodelist1
            self.nodelist2 = nodelist2
            self.includes = includes

        def render(self, context):
            milog.debug("Render Container")

            # Lo hacemos construyendo nueva lista
            unique = uuid4().hex
            modulo = _cMc("navegacion.baseController")
            milist = []
            # Creamos div
            milist.append('<div id="' + unique + '" data-YB_CONTAINER="1">')
            # Metemos script de creacion
            milist.append("<script>(function(" + ",".join(self.includes) + "){ ")
            milist.append("var containerExt={")
            milist.append(self.nodelist1.render(context))
            milist.append("};")
            milist.append("var miPadre=" + modulo + ".getParentContainer('#" + unique + "');")
            milist.append("var objContainer=" + modulo + ".createContainer(containerExt,miPadre);")
            milist.append(modulo + ".registerContainer('" + unique + "',objContainer);")
            milist.append("})(" + ",".join(map(_cMc, self.includes)) + ");</script>")
            # Conenido Interno
            milist.append(self.nodelist2.render(context))
            milist.append('</div>')
            # Final(LLamar onMOunt)
            milist.append("<script>" + modulo + ".getContainerByID('" + unique + "').onMount();</script>")
            return " ".join(milist)

    nodelist1 = parser.parse(('endContainer',))
    parser.delete_first_token()
    nodelist2 = parser.parse(('endincContainer',))
    parser.delete_first_token()

    includes = token.contents.split()[1:]
    return trataContainer(nodelist1, nodelist2, includes)


register.tag('incContainer', incContainer)
