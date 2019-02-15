from django.db.models import *


class RawModel(Model):

    def _miextend(self, **kwargs):
        self._legacy_mtd = kwargs
        return self

    Field._miextend = _miextend

    def debug(*args):
        try:
            print(args)
        except Exception:
            pass

    def desktopUI(self):
        return False

    def initValidation(self, *args, **kwargs):
        return True

    def iniciaValoresLabel(self, *args, **kwargs):
        return {}

    def bChLabel(self, *args, **kwargs):
        return {}

    def getFilters(self, *args, **kwargs):
        return []

    def getForeignFields(self, *args, **kwargs):
        return []

    def getDesc(self, *args, **kwargs):
        return None

    def get_model_info(self, *args, **kwargs):
        return None

    class Meta:
        abstract = True
