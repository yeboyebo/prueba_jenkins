#!/usr/bin/env python
# -*- coding: utf-8 -*-
""" Funciones base para utilizar objetos JSON
    y Ordered dict
    Estos seran los objetos por defecto para el tratamiento de layouts...

"""
import collections
import json

import django.utils.functional
from django.conf import settings
from rest_framework.utils import encoders

from YBUTILS import mylogging as log

milog = log.getLogger("")


def fromJSON(sJSON):
    return json.loads(sJSON, object_pairs_hook=collections.OrderedDict)


# Convierte a JSON y resuelve callables para que no se vuelvan a ejecutar(sobretodo para traduccion , URLs...)
def toJSON(obj, optimizar=True):
    try:
        if optimizar:
            return json.dumps(obj, cls=miEncoder, indent=(4 if settings.DEBUG else 0))
        else:
            return json.dumps(obj)
    except Exception:
        log.error("Error al pasar a JSON")
        raise


class miDecoder(json.JSONDecoder):
    def decode(self, obj):
        resul = super().decode(obj)
        # if isinstance(resul,list):
        #     Convertir a mi lista
        #     return milista(resul)
        # else:
        #   return resul
        return resul


class miEncoder(json.JSONEncoder):
    def default(self, obj):
        if callable(obj):
            obj = obj()
        # Tratamos promesas y las sustituimos por su valor
        if isinstance(obj, django.utils.functional.Promise):
            obj = str(obj)
            return obj
        # Let the base class default method raise the TypeError
        try:
            # LO hacemos como el rest framework
            return encoders.JSONEncoder.default(self, obj)
            # return json.JSONEncoder.default(self, obj)
        except TypeError:
            if isinstance(obj, collections.Iterable):
                return list(obj)
            else:
                raise
