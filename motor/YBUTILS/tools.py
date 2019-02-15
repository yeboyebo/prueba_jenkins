"""
Conjunto de metodos rapidos de uso en otras librerias
"""
from collections import Mapping
# -----------------------OBTENCION DE MODELO -------------------------------------
from django.apps import apps


def damemodelo(aplic, nombre):
    # obj=django.contrib.contenttypes.models.ContentType.objects.all().get(app_label=aplic,name=nombre.lower())
    # return obj.model_class()
    return apps.get_model(aplic, nombre)


# def dameaplicnombre(modelo):
#     return modelo._meta.app_label, modelo._meta.db_table.lower()


def deepUpdate(d, u):
    for k, v in u.items():
        if isinstance(v, Mapping):
            r = deepUpdate(d.get(k, {}), v)
            d[k] = r
        else:
            d[k] = u[k]
    return d
