import importlib

from YBUTILS import Factoria


class MiFactoriaModulos(Factoria.Factoria):

    def __init__(self, name):
        super().__init__(name)

    def incluirYBRegistros(self, oReg):
        self.registrar("YBRegistros", oReg)

    def incluir_modulo_standar(self, app, nommodulo, nomscript, prefijo=""):
        if (prefijo == "formmaster"):
            nomscript = "master" + nomscript
            prefijo = "form"

        can_import = importlib.util.find_spec("legacy." + app + "." + nomscript)
        if can_import is None:
            raise ImportError

        my_module = importlib.import_module("legacy." + app + "." + nomscript)

        objeto = my_module.FormInternalObj()
        objeto._class_init()
        oObj = objeto.iface
        objeto.iface.ctx = oObj
        objeto.iface.iface = oObj
        objeto.oficial_desktopUI = False
        if nommodulo != nomscript:
            self.registrar(prefijo + nomscript, objeto)
        self.registrar(prefijo + nommodulo, objeto)


# Singletons
FactoriaModulos = MiFactoriaModulos("Modulos")
