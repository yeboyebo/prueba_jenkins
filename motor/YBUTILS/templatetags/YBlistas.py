"""
   Template tags para el tratamiento de JSX y JS dentro de los templates
   Se hace inyeccion de modulos comunes
"""
from django import template
from YBUTILS import mylogging as log
from YBUTILS import tools

register = template.Library()

milog = log.getLogger("templatetag.includeDB")


# ------------------PRIVADAS------------------------------------------
def _dameLista(aplic, modelname, cod, desc, order=None, filter=None):
    # Obtenemos modelo
    mimodel = tools.damemodelo(aplic, modelname)
    # Obtenemosquery
    if filter:
        miquery = mimodel.objects.all().extra(where=filter)
    else:
        miquery = mimodel.objects.all()

    if order:
        miquery = miquery.order_by(order)
    return miquery


# ------------------TEMPLATE TAGS-------------------------------------
@register.simple_tag
def listaJSON(aplic, modelname, cod, desc, order=None, filter=None):
    miquery = _dameLista(aplic, modelname, cod, desc, order, filter)
    milist = []
    for obj in miquery:
        cod2 = getattr(obj, cod)
        desc2 = getattr(obj, desc)
        # comprobar si es funcion
        if callable(desc2):
            desc2 = desc2()
        milist.append('"' + str(cod2) + '":"' + desc2 + '"')
    return ",".join(milist)
