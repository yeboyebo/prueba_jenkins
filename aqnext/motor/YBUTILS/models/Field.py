"""
   Sefinicion de clases de ayuda para modelo de datos
"""
from django.db import models


class CurrencyField(models.FloatField):

    def __init__(self, max_digits=None, decimal_places=None, *args, **kwargs):
        self.max_digits, self.decimal_places = max_digits, decimal_places
        super().__init__(*args, **kwargs)

    def to_python(self, value):
        if value is None:
            return
        return value

    def get_db_prep_save(self, value, connection, prepared=False):
        if value is None:
            return
        return round(value, 2)


setattr(models, "CurrencyField", CurrencyField)
