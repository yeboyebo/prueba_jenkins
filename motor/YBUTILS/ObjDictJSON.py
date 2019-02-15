import json


# ----------------------RESPUESTA-------------------------------------------------
class ObjDictJSON(object):
    def __init__(self, oAux=None):
        # Dependiendo de tipo de objeto
        if oAux:
            self.addelem(oAux)

    def dict(self):
        return self.__dict__

    def respuesta(self):
        return json.dumps(self, cls=miEncoder)

    def addelem(self, dicc2, bRecurse=True):
        if isinstance(dicc2, dict):
            self.__dict__.update(dicc2)
        else:
            if isinstance(dicc2, ObjDictJSON):
                self.__dict__.update(dicc2.__dict__)
            else:  # PRESUPONGO ES CADENA JSON
                if bRecurse:
                    self.addelem(json.loads(dicc2, object_hook=lambda x: ObjDictJSON(x), cls=miDecoder), False)

    # Para que implemente in
    def __contains__(self, value):
        return value in self.__dict__

    # Para implementar como dicccionario
    def __getitem__(self, index):
        try:
            return self.__dict__[index]
        except Exception:
            return None

    def __setitem__(self, index, value):
        self.__dict__[index] = value

    # def __getattr__(self,nombre):
    #    try:
    #        valor = super().__getattr__(nombre)
    #    except Exception:
    #        valor=None
    #    return valor


class milista(list):
    """ Ampliacion de lista para simular qsaArray y []
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    @property
    def length(self):
        return len(self)

    def push(self, pvalue):
        self.append(pvalue)

    def join(self, pvalue):
        return pvalue.join(self)

    def __setitem__(self, pos, pvalue):
        try:
            super().__setitem__(pos, pvalue)
        except Exception:
            self.append(pvalue)


class miEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, object):
            return obj.__dict__
        # Let the base class default method raise the TypeError
        return json.JSONEncoder.default(self, obj)


class miDecoder(json.JSONDecoder):
    def decode(self, obj):
        resul = super().decode(obj)
        if isinstance(resul, list):
            # Convertir a mi lista
            return milista(resul)
        else:
            return resul
