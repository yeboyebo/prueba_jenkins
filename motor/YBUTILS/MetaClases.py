
class FlyWeight(type):

    def __init__(cls, name, bases, dct):
        cls.__instances = dict()
        cls.__key = ''
        type.__init__(cls, name, bases, dct)

    def __call__(cls, key=None, *args, **kw):
        if key is None:
            key = cls.__key
        instance = cls.__instances.get(key)
        if instance is None:
            instance = type.__call__(cls, key, *args, **kw)
            cls.__instances[key] = instance
        return instance
