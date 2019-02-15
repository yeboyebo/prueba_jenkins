"""
* Fecha Creación: 2015/05
* Responsable: Jesus Navajas
* Funcionalidad
    Modulo que wrapea logging para permitir parametrizacion en rendimiento y separacion de logguer
    para seguimiento, rendimiento, deteccion de errores...
* USO:
  * En modulos
"""
import logging
import re
import inspect
# --------------------------------PRIVADOS---------------------------------------------
_defecto = "YEBOYEBO"
__log = logging.getLogger(_defecto)


def _shortstr(obj):
    """Por si se quiere cambiar tratamiento de objetos
    """
    return str(obj)


def _formatAllArgs(args, kwds):
    """Representacion de parametros de llamada
    """
    allargs = []
    for item in args:
        allargs.append(u'%s' % _shortstr(item))
    for key, item in kwds.items():
        allargs.append(u'%s=%s' % (key, _shortstr(item)))
    formattedArgs = ', '.join(allargs)
    if len(formattedArgs) > 150:
        return formattedArgs[:146] + u" ..."
    return formattedArgs


def _dameNombre(prefijo, modificador=None):
    defecto = _defecto
    if prefijo:
        defecto += "." + prefijo
    if modificador:
        defecto += "." + modificador
    return defecto


# --------------------------------PUBLICOS---------------------------------------------
debug = __log.debug
info = __log.info
warn = __log.warn
error = __log.error
critical = __log.critical


def getLogger(modif=None):
    if modif is None:
        frm = inspect.stack()[1]
        mod = inspect.getmodule(frm[0])
        modif = mod.__name__
    return logging.getLogger(_dameNombre(modif))


"""
Obtener logguer
"""


class logMixin(object):
    """
    Este mixin permite que al heredarse la clase incluya atributo log con nombre : modulo.clase
    """
    def __new__(cls, *arg, **kwarg):
        # nombre = cls.__module__ + "." + cls.__name__
        # try:
        #     cls.log.debug("Creando clase %s", cls.__name__)
        # except Exception:
        #     cls.log = logging.getLogger(_dameNombre(nombre))
        #     cls.log.debug("Creando clase %s", cls.__name__)
        return super().__new__(cls)


def logFunction(func, logger="", loglevel=logging.DEBUG, appendName=False):
    """
    Decorador para loguear las peticiones a funciones,incluyendo respuesta standar/Error
    """
    if appendName:
        milog = logging.getLogger(_dameNombre(logger, func.__name__))
    else:
        milog = logging.getLogger(_dameNombre(logger))

    def _wrapper(*args, **kwds):
        milog.log(loglevel, "CALL %s.%s (%s) ", func.__module__, func.__name__, _formatAllArgs(args, kwds))
        try:
            returnval = func(*args, **kwds)
        except Exception as ex:
            milog.log(loglevel, "ERROR EN CALL %s.%s (%s) ERROR =%s", func.__module__, func.__name__, _shortstr(returnval), str(ex))
            raise ex
        milog.log(loglevel, "RETURN %s.%s=(%s) ", func.__module__, func.__name__, _shortstr(returnval))
        return returnval
    return _wrapper


def logMethod(func, logger="", loglevel=logging.DEBUG, appendName=False):
    """
    Decorador para loguear las peticiones a metodos
    """
    if appendName:
        milog = logging.getLogger(_dameNombre(logger, func.__name__))
    else:
        milog = logging.getLogger(_dameNombre(logger))

    def _wrapper(self, *args, **kwds):
        if isinstance(self, type):
            className = self.__name__
        else:
            className = self.__class__.__name__
        milog.log(loglevel, "CALL %s.%s (%s) ", className, func.__name__, _formatAllArgs(args, kwds))
        try:
            returnval = func(self, *args, **kwds)
        except Exception as ex:
            milog.log(loglevel, "ERROR EN CALL %s.%s (%s) ERROR =%s", className, func.__name__, _formatAllArgs(args, kwds), str(ex))
            raise ex
        milog.log(loglevel, "RETURN %s.%s=(%s) ", className, func.__name__, _shortstr(returnval))
        return returnval
    return _wrapper


def logFunctionError(func, logger="", loglevel=logging.DEBUG, appendName=False):
    """
    Decorador para loguear excepciones en peticiones a funciones
    """
    if appendName:
        milog = logging.getLogger(_dameNombre(logger, func.__name__))
    else:
        milog = logging.getLogger(_dameNombre(logger))

    def _wrapper(*args, **kwds):
        try:
            returnval = func(*args, **kwds)
        except Exception as ex:
            milog.log(loglevel, "ERROR EN CALL %s.%s (%s) ERROR =%s", func.__module__, func.__name__, _formatAllArgs(args, kwds), str(ex))
            raise ex
        return returnval
    return _wrapper


class logMetaCL(type):
    """Metaclase que permite el logueo completo de todos los metodos de una clase
       Se utilizaran los siguientes atributos de clase para parametrizar
       logger="defecto"
       loglevel=1
       logappendName=False
       logMatch='.*'
       logNotMatch='nevermatchthisstringasdfasdf'
    """
    def __new__(cls, name, bases, dct):
        logmatch = re.compile(dct.get('logMatch', '.*'))
        lognotmatch = re.compile(dct.get('logNotMatch', 'nevermatchthisstringasdfasdf'))
        logger = dct.get('logger', "defecto")
        loglevel = dct.get('loglevel', logging.DEBUG)
        logappendName = dct.get('logappendName', False)
        if logappendName:
            logger += "." + name

        for attr, item in dct.items():
            if callable(item) and logmatch.match(attr) and not lognotmatch.match(attr):
                # classdict['_H_%s'%attr] = item    # rebind the method
                dct[attr] = logMethod(item, logger, loglevel, logappendName)  # replace method by wrapper

        return type.__new__(cls, name, bases, dct)

    def __init__(cls, name, bases, dct):
        type.__init__(cls, name, bases, dct)


def logModule(modulo, logger="", loglevel=logging.DEBUG, appendName=False, logMatch=".*", logNotMatch="nomatchasfdasdf"):
    """
    A partir de un modulo establece
    """
    allow = lambda s: re.match(logMatch, s) and not re.match(logNotMatch, s)

    if isinstance(modulo, str):
        d = {}
        exec("import %s" % modulo) in d
        import sys
        module = sys.modules[modulo]

    if appendName:
        logger = _dameNombre(logger, module.__name__)

    names = module.__dict__.keys()
    for name in names:
        if not allow(name):
            continue
        value = getattr(module, name)
        if isinstance(value, type):
            value.__dict__["logger"] = logger
            value.__dict__["loglevel"] = loglevel
            value.__dict__["logappendName"] = appendName
            setattr(module, name, logMetaClass(value.__name__, value.__bases__, value.__dict__))
        elif isinstance(value, types.FunctionType):
            setattr(module, name, logFunction(value, logger, loglevel, appendName))


def configdefecto():
    MICONFIG = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'brief': {
                'format': '%(message)s',
            },
            'default': {
                'format': '%(asctime)s %(levelname)-8s %(name)-30s %(message)s',
                'datefmt': '%Y-%m-%d %H:%M:%S',
            }
        },
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
                'formatter': 'default',
            }
        },
        'loggers': {
            'YEBOYEBO': {
                'handlers': ['console'],
                'level': 'DEBUG',
            },
        }
    }
    logging.config.dictConfig(MICONFIG)
