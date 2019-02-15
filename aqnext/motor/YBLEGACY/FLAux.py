import importlib
from os import path

from django.conf import settings
from django.apps import apps as djapps

from YBLEGACY.Factorias import FactoriaModulos
from YBWEB.ctxJSON import DICTJSON


class FLAux:

    __dictmodelos = dict()
    __dictmodelos_simples = dict()

    @classmethod
    def obtener_modelo(cls, stabla):
        try:
            return cls.__dictmodelos[stabla.upper()]
        except KeyError as e:
            raise NameError("La tabla {} no existe en el registro de modelos. Debes incluirla en registros.json".format(stabla))
        except Exception as e:
            raise NameError("Tabla {} no encontrada: {}".format(stabla, e))

    @classmethod
    def obtener_modelo_simple(cls, stabla):
        try:
            return cls.obtener_modelo(stabla)[0]
        except NameError:
            try:
                return cls.__dictmodelos_simples[stabla.upper()]
            except KeyError:
                for model in djapps.get_models(include_auto_created=True):
                    try:
                        if (model.__name__ == stabla) or (model._meta.db_table == stabla):
                            cls.registrar_modelo_simple(stabla, model)
                            return model
                    except Exception as e:
                        raise NameError("Tabla {} no encontrada: {}".format(stabla, e))

    @classmethod
    def registrar_modelo(cls, stabla, model, **kwargs):
        cls.__dictmodelos[stabla.upper()] = (
            model,
            kwargs.get("buffer_changed", None),
            kwargs.get("before_commit", None),
            kwargs.get("after_commit", None),
            kwargs.get("buffer_commited", None),
            kwargs.get("inicia_valores_cursor", None),
            kwargs.get("buffer_changed_label", None),
            kwargs.get("validate_cursor", None),
            kwargs.get("validate_transaction", None),
            kwargs.get("cursor_accepted", None)
        )

    @classmethod
    def registrar_modelo_simple(cls, stabla, model):
        cls.__dictmodelos_simples[stabla.upper()] = model

    @classmethod
    def registrar_rest(cls):
        reg = open(path.join(settings.PROJECT_ROOT, "config/urls.json")).read()
        o_reg = DICTJSON.fromJSON(reg)

        apps = {}
        apps["models"] = []
        for mod in o_reg["models"]:
            raiz = "models."
            if mod == "flsisppal":
                raiz = "YBSYSTEM.models."
            for model_name in o_reg["models"][mod]:
                try:
                    model = importlib.import_module(raiz + mod + "." + model_name)
                    model_class = getattr(model, model_name, None)
                except ImportError as e:
                    raise NameError("No se pudo importar el modelo {}.{} porque no se encontró un módulo: {}".format(mod, model_name, e))
                except SyntaxError as e:
                    raise NameError("No se pudo importar el modelo {}.{} por un problema de sintaxis: {}".format(mod, model_name, e))
                except Exception as e:
                    raise NameError("No se pudo importar el modelo {}.{}: {}".format(mod, model_name, e))
                apps["models"].append(model_class)
        return apps

    @classmethod
    def registrarmodulos(cls):
        reg = open(path.join(settings.PROJECT_ROOT, "config/registros.json")).read()
        o_reg = DICTJSON.fromJSON(reg)

        FactoriaModulos.incluirYBRegistros(o_reg)

        for app_name in o_reg:
            raiz = "models."
            if app_name == "flsisppal":
                raiz = "YBSYSTEM.models."
            try:
                FactoriaModulos.incluir_modulo_standar(app_name, app_name, app_name)
            except ImportError:
                pass
            except SyntaxError as e:
                raise NameError("No se pudo registrar el módulo legacy {} por un problema de sintaxis: {}".format(app_name, e))
            except Exception as e:
                raise NameError("No se pudo registrar el módulo legacy {}: {}".format(app_name, e))

            modelos = importlib.import_module(raiz + app_name + ".models")
            for model_name in o_reg[app_name]:
                if o_reg[app_name][model_name] is None:
                    try:
                        FactoriaModulos.incluir_modulo_standar(app_name, model_name, model_name, "formmaster")
                    except ImportError:
                        pass
                    except SyntaxError as e:
                        raise NameError("No se pudo registrar el módulo legacy formMaster para {}.{} por un problema de sintaxis: {}".format(app_name, model_name, e))
                    except Exception as e:
                        raise NameError("No se pudo registrar el módulo legacy formMaster para {}.{}: {}".format(app_name, model_name, e))
                    try:
                        FactoriaModulos.incluir_modulo_standar(app_name, model_name, model_name, "formRecord")
                    except ImportError:
                        pass
                    except SyntaxError as e:
                        raise NameError("No se pudo registrar el módulo legacy formRecord para {}.{} por un problema de sintaxis: {}".format(app_name, model_name, e))
                    except Exception as e:
                        raise NameError("No se pudo registrar el módulo legacy formRecord para {}.{}: {}".format(app_name, model_name, e))
                else:
                    if "formRecord" in o_reg[app_name][model_name]:
                        try:
                            FactoriaModulos.incluir_modulo_standar(app_name, model_name, o_reg[app_name][model_name]["formRecord"], "formRecord")
                        except SyntaxError as e:
                            raise NameError("No se pudo registrar el módulo legacy formRecord {} para {}.{} por un problema de sintaxis: {}".format(o_reg[app_name][model_name]["formRecord"], app_name, model_name, e))
                        except Exception as e:
                            raise NameError("No se pudo registrar el módulo legacy formRecord {} para {}.{}: {}".format(o_reg[app_name][model_name]["formRecord"], app_name, model_name, e))
                    if "form" in o_reg[app_name][model_name]:
                        try:
                            FactoriaModulos.incluir_modulo_standar(app_name, model_name, o_reg[app_name][model_name]["form"], "form")
                        except SyntaxError as e:
                            raise NameError("No se pudo registrar el módulo legacy formMaster {} para {}.{} por un problema de sintaxis: {}".format(o_reg[app_name][model_name]["form"], app_name, model_name, e))
                        except Exception as e:
                            raise NameError("No se pudo registrar el módulo legacy formMaster {} para {}.{}: {}".format(o_reg[app_name][model_name]["form"], app_name, model_name, e))

                try:
                    actionscript_model = importlib.import_module(raiz + app_name + "." + model_name)
                    actionscript_model = getattr(actionscript_model, model_name, None)
                except Exception:
                    actionscript_model = None
                try:
                    actionscript_legacy = FactoriaModulos.get("formRecord" + model_name).iface
                except Exception:
                    actionscript_legacy = None

                try:
                    modulescript_model = importlib.import_module(raiz + app_name + "." + app_name + "_def").iface
                except Exception:
                    modulescript_model = None
                try:
                    modulescript_legacy = FactoriaModulos.get(app_name).iface
                except Exception:
                    modulescript_legacy = None

                model = actionscript_model or getattr(modelos, "mtd_" + model_name, None)
                inicia_valores_cursor = getattr(actionscript_model, "iniciaValoresCursor", None) or getattr(actionscript_legacy, "iniciaValoresCursor", None)
                buffer_changed = getattr(actionscript_model, "bChCursor", None) or getattr(actionscript_legacy, "bChCursor", None)
                buffer_changed_label = getattr(actionscript_model, "bChLabel", None) or getattr(actionscript_legacy, "bChLabel", None)
                before_commit = getattr(modulescript_model, "beforeCommit_" + model_name, None) or getattr(modulescript_legacy, "beforeCommit_" + model_name, None)
                after_commit = getattr(modulescript_model, "afterCommit_" + model_name, None) or getattr(modulescript_legacy, "afterCommit_" + model_name, None)
                buffer_commited = getattr(modulescript_model, "bufferCommited_" + model_name, None) or getattr(modulescript_legacy, "bufferCommited_" + model_name, None)
                validate_cursor = getattr(actionscript_model, "validateCursor", None) or getattr(actionscript_legacy, "validateCursor", None)
                validate_transaction = getattr(actionscript_model, "validateTransaction", None) or getattr(actionscript_legacy, "validateTransaction", None)
                cursor_accepted = getattr(actionscript_model, "cursorAccepted", None)

                FLAux.registrar_modelo(
                    model_name,
                    model,
                    inicia_valores_cursor=inicia_valores_cursor,
                    buffer_changed=buffer_changed,
                    buffer_changed_label=buffer_changed_label,
                    before_commit=before_commit,
                    after_commit=after_commit,
                    buffer_commited=buffer_commited,
                    validate_cursor=validate_cursor,
                    validate_transaction=validate_transaction,
                    cursor_accepted=cursor_accepted
                )
