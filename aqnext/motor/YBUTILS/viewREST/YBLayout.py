import inspect
import collections

from django.core.exceptions import FieldDoesNotExist
from YBUTILS.viewREST import serializers
from YBUTILS.viewREST import factorias

"""
  Define metodos para generar SCHEMA y LAYOUT a partir de serializar/model
"""


# --------------------------------LAYOUT------------------------------------------------------
def getDefaultLayOUT(schema):
        midict = []
        for k, v in schema.items():
            midict.append({"COMP": "default",
                           "PROPS": {"SCHEMA": k}})
        return midict


# --------------------------------SCHEMA------------------------------------------------------
# -------------------------------INTERNAS-----------------------------------------------------
def _setAttrExists(collecc, obj, attr, attrElem):
        """ Auxiliar para valores opcionales """
        value = getattr(obj, attrElem, None)
        if value:
            collecc[attr] = value


def _getListaField(miobj, serializer):
    """ Devuelve lista asociada al tipo """
    try:
        source = serializer.Meta.model._meta.get_field(miobj.source)
        if hasattr(source, 'YB_lista'):
            dict = collections.OrderedDict()
            sAux = getattr(source, 'YB_lista').split(':')
            dict['aplic'] = sAux[0]
            dict['model'] = sAux[1]
            if (len(sAux) > 2):
                dict['tipo'] = int(sAux[2])
            else:
                dict['tipo'] = 1
            return dict
        else:
            return None
    except Exception:
        # print("Error getlistafield", exc)
        return None


def _getTipoField(miobj):
    """ Pasa de clase a tipo,subtipo  YEBOYEBO
    """
    subtipo = None
    tipo = 3
    if isinstance(miobj, serializers.serializers.IntegerField):
        tipo = 16
    elif isinstance(miobj, serializers.serializers.CharField):
        tipo = 3
        if(miobj.style):
            subtipo = 6
        # TODO : SUBTIPOS
    elif isinstance(miobj, serializers.CurrencyField):
        tipo = 37
    elif isinstance(miobj, serializers.serializers.DecimalField) or isinstance(miobj, serializers.serializers.FloatField):
        tipo = 19
    elif isinstance(miobj, serializers.serializers.BooleanField) or isinstance(miobj, serializers.serializers.NullBooleanField):
        tipo = 18
    elif isinstance(miobj, serializers.serializers.DateTimeField):
        tipo = 28
    elif isinstance(miobj, serializers.serializers.TimeField):
        tipo = 27
    elif isinstance(miobj, serializers.serializers.DateField):
        tipo = 26
    return tipo, subtipo


# ----------------------------PUBLICA----------------------------------------------------------------
def getYBschema(serializer):
    """Permite obtener definicion de schema de uso interno de YEBOYEBO"""
    if hasattr(serializer, 'getYBschema'):
        return serializer.getYBschema()
    else:
        miserializer = serializer
        model = miserializer.Meta.model._meta
        # Si es un tipo instanciarlo
        if isinstance(serializer, type):
            miserializer = serializer()
        dict = collections.OrderedDict()
        meta = collections.OrderedDict()
        if miserializer.Meta.model._meta.parents:
            meta["verbose_name"] = next(iter(miserializer.Meta.model._meta.parents))._meta.verbose_name
        else:
            meta["verbose_name"] = miserializer.Meta.model._meta.verbose_name
        for key, value in miserializer.fields.items():
            # print(key, "_____", value)
            dict[key] = collections.OrderedDict()
            dict[key]['verbose_name'] = getattr(value, 'label', 'CAMPO _' + key)
            dict[key]['help_text'] = getattr(value, 'help_text', '')
            dict[key]['locked'] = getattr(value, 'read_only', False)
            dict[key]['field'] = False
            # dict[key]['required'] = getattr(value, 'required', False)
            # print(dict[key]['required'])
            visible = True
            if key == 'pk' or key == 'desc':
                visible = False
            dict[key]['visible'] = visible
            # Toma el tipo de la pk del serializador
            if key == 'pk':
                subtipo = None
                dict[key]['tipo'] = _getFieldData(serializer.pkType)
            else:
                dict[key]['tipo'], subtipo = _getTipoField(value)
            if subtipo:
                dict[key]['subtipo'] = subtipo

            if key != "desc" and key != "pk":
                try:
                    fd, a, b, c = model.get_field_by_name(key)

                    dict[key]['visiblegrid'] = True
                    if "REQUIRED" in fd._legacy_mtd:
                        dict[key]['required'] = fd._legacy_mtd['REQUIRED']
                    if "partI" in fd._legacy_mtd:
                        dict[key]['max_digits'] = fd._legacy_mtd['partI']
                    if "partD" in fd._legacy_mtd:
                        dict[key]['decimal_places'] = fd._legacy_mtd['partD']
                    if "visiblegrid" in fd._legacy_mtd:
                        dict[key]['visiblegrid'] = fd._legacy_mtd['visiblegrid']
                    if "optionslist" in fd._legacy_mtd:
                        dict[key]['optionslist'] = fd._legacy_mtd['optionslist']
                        dict[key]['tipo'] = 5
                    if fd.rel:
                        # Revisar
                        # dict[key]['required'] = False
                        dict[key]['rel'] = fd.related_model._meta.db_table
                        # Buscamos desc de desc si existe el modelo
                        try:
                            rel_serializer, rel_meta_model = factorias.FactoriaSerializadoresBase.getSerializer(fd.related_model._meta.db_table, None)

                            desc = None
                            desc_function = rel_meta_model.getDesc
                            if desc_function:
                                expected_args = inspect.getargspec(desc_function)[0]
                                new_args = [rel_meta_model]
                                desc = desc_function(*new_args[:len(expected_args)])

                            if not desc or desc is None:
                                desc = rel_meta_model._meta.pk.name

                            dict[key]['desc'] = desc

                        except (NameError, TypeError) as e:
                            raise NameError("Ocurrió un error al obtener la descripción (getDesc) de {}: {}".format(rel_meta_model.__module__, e))

                        dict[key]['to_field'] = fd.to_fields[0]
                except FieldDoesNotExist:
                    pass
            else:
                dict[key]['visiblegrid'] = False

            # _setAttrExists(dict[key],value,'default','default')
            _setAttrExists(dict[key], value, 'max_length', 'max_length')
            _setAttrExists(dict[key], value, 'decimal_places', 'decimal_places')
            _setAttrExists(dict[key], value, 'max_digits', 'max_digits')
            # option_list
            milist = _getListaField(value, miserializer)
            if milist:
                dict[key]['option_list'] = milist

        return dict, meta


def _getFieldData(className):
    """ Pasa de clase a tipo,subtipo  YEBOYEBO
    """
    if className == 'AutoField' or className == 'IntegerField' or className == 'BigIntegerField' or className == 'PositiveIntegerField':
        return 16
    elif className == 'FloatField' or className == 'DecimalField':
        return 19
    elif className == 'BooleanField' or className == 'NullBooleanField':
        return 18
    elif className == 'CharField':
        return 3
    elif className == 'TextField':
        return 6
    elif className == 'CurrencyField':
        return 37
    elif className == 'DateField':
        return 26
    elif className == 'DateTimeField':
        return 28
    elif className == 'EmailField':
        return 5
    elif className == 'TimeField':
        return 27
    else:
        return 3


def getYBMetadata(serializer, data):
    return {}
