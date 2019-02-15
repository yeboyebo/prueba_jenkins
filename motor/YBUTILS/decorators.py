# -------------------------------------------------CACHE DE FUNCIONES ------------------------------------------
import functools


# Existe en django.functional
def memoize(obj):
    """
        Permite el cacheo por parametros
    """
    cache = obj.cache = {}

    @functools.wraps(obj)
    def memoizer(*args, **kwargs):
        key = str(args) + str(kwargs)
        if key not in cache:
            cache[key] = obj(*args, **kwargs)
        return cache[key]
    return memoizer


def func_once(func):
    "A decorator that runs a function only once."
    def decorated(*args, **kwargs):
        try:
            return decorated._once_result
        except AttributeError:
            decorated._once_result = func(*args, **kwargs)
            return decorated._once_result
    return decorated


def method_once(method):
    "A decorator that runs a method only once."
    attrname = "_%s_once_result" % id(method)

    def decorated(self, *args, **kwargs):
        try:
            return getattr(self, attrname)
        except AttributeError:
            setattr(self, attrname, method(self, *args, **kwargs))
            return getattr(self, attrname)
    return decorated


def clsmethod_once(method):
    "A decorator that runs a method only once."
    attrname = "_%s_once_result" % id(method)

    def decorated(cls, *args, **kwargs):
        try:
            return getattr(cls, attrname)
        except AttributeError:
            setattr(cls, attrname, method(cls, *args, **kwargs))
            return getattr(cls, attrname)
    return decorated


def clsmethod_once_mixin(method):
    "A decorator that runs a method only once."
    attrname = "_%s_once_result" % id(method)

    def decorated(cls, *args, **kwargs):
        try:
            return getattr(cls, attrname)
        except AttributeError:
            setattr(cls, attrname, method(cls, *args, **kwargs))
            return getattr(cls, attrname)
    return decorated
