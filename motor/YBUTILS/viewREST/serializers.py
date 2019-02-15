from rest_framework import serializers

from YBUTILS.viewREST import accion
import YBUTILS.models.Field as comunModels


# Campo moneda
class CurrencyField(serializers.DecimalField):

    def __init__(self, max_digits=None, decimal_places=None, **kwargs):
        self.max_digits, self.decimal_places = max_digits, decimal_places
        serializers.DecimalField.__init__(self, max_digits, decimal_places, **kwargs)

    def to_representation(self, obj):
        return obj

    def to_internal_value(self, obj):
        return obj
# ESTO NO ES NECESARIO es para serializers no para Fields
#    class Meta:
#        model = comunModels.CurrencyField

# CLases Base heredadas ------------------------------------------------------------


class YBSerializer(serializers.Serializer):

    def __init__(self, *args, **kwargs):

        # Instantiate the superclass normally
        super().__init__(*args, **kwargs)


# Se ejecuta esto para mapeo de Currency Field (Esperar ver donde dejamos currency Field
# Clase base Serializer modelo al que se le incluyen dos campos
# adicionales de solo lectura
# pk: Sera la pk del registro
# desc: Descripcion por defecto(la obtiene del __str__
class YBModelSerializer(serializers.ModelSerializer):
    serializer_field_mapping = serializers.ModelSerializer.serializer_field_mapping
    serializer_field_mapping[comunModels.CurrencyField] = CurrencyField

    desc = serializers.SerializerMethodField()
    pk = serializers.SerializerMethodField()

    def get_desc(self, obj):
        # Tenemos acceso a todo el serializador y al data de la fila
        return obj.__str__()

    def get_pk(self, obj):
        return obj.pk

    def __init__(self, *args, **kwargs):
        # Instantiate the superclass normally
        super().__init__(*args, **kwargs)
    # -----------------METODOS SOBRESCRITOS PARA COMPORTAMIENTO ESPECIAL-------------
    # Este metodo se sobreescribe de manera que al incluir relacionadas se use esta misma
    # clase con pk y desc
    # TO DO : Seria mejor cogiera la clase base de la factoria, pero crea referencia circular

    def build_nested_field(self, field_name, relation_info, nested_depth):
        """
        Create nested fields for forward and reverse relationships.
        """
        class NestedSerializer(YBModelSerializer):
            class Meta:
                model = relation_info.related_model
                depth = nested_depth - 1

        field_class = NestedSerializer
        field_kwargs = serializers.get_nested_relation_kwargs(relation_info)

        return field_class, field_kwargs


class YBModelSerializerAccion(YBModelSerializer):
    YB_acciones = serializers.SerializerMethodField()

    def get_YB_acciones(self, obj):
        if isinstance(obj, accion.MixinConAcciones):
            return obj.getAccionesNoActivas()
        else:
            return None

    def __init__(self, *args, **kwargs):
        # Instantiate the superclass normally
        super().__init__(*args, **kwargs)
