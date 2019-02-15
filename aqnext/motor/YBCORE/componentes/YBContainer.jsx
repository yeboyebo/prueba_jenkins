import getMuiTheme from "material-ui/styles/getMuiTheme";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";

var _ = require("underscore");
var React = require("react");
var ReactDOM = require("react-dom");

var URLResolver = require("../navegacion/URLResolver.js");
var helpers = require("../navegacion/helpers.js");

var YBForm = require("./YBFormComp/YBForm.jsx");
var YBGroupBox = require("./YBGroupBox.jsx");
var YBNavBar = require("./YBNavBar.jsx");
var YBChat = require("./YBChatComp/YBChat.jsx");

var YBContainer = React.createClass({

    getInitialState: function() {
        // var yb = _.extend({}, this.props.YB)
        //var yb = this.props.YB;
        var ybList = [];
        ybList.push(this.props.YB);
        var yb = ybList[ybList.length - 1];
        yb["otros"] = _.extend(this.props.YB["otros"], this.props.YB["persistente"]);
        var ybMetadata = [];
        ybMetadata.push({"LAYOUT": this.props.LAYOUT, "APLIC": this.props.APLIC, "PREFIX": this.props.PREFIX, "STATICURL": this.props.STATICURL});

        return ({
            "YB": yb,
            "YBList": ybList,
            "YBListMeta": ybMetadata,
            "componentes": [],
            "modalList": [],
            "changeBuffer": {},
            "eliminar": null,
            "activeGroupBox": {},
            "websocket": {}
        })
    },

    _getDataFromPk: function(modelo, pk) {
        for (var i = 0, l = this.state.YB[modelo].DATA.length; i < l; i++) {
            if (this.state.YB[modelo].DATA[i].pk == pk) {
                return this.state.YB[modelo].DATA[i];
            }
        }
    },

    _newRecord: function() {
        var url = URLResolver.getTemplate(this.props.APLIC, this.props.PREFIX, null, "newRecord");
        window.location.href = url;
    },

    _onChange: function(layout, prefix, inputKey, inputVal, pk) {
        var data = this.state.YB;
        var buffer = this.state.changeBuffer;
        if (prefix == "otros") {
            data[prefix][inputKey] = inputVal;
        }
        else {
            if (inputVal) {
                if (data[prefix].SCHEMA[inputKey].hasOwnProperty("max_length") && data[prefix].SCHEMA[inputKey]["max_length"] < inputVal.length) {
                    return false;
                }
            }
            data[prefix].DATA[inputKey] = inputVal;
        }

        buffer[inputKey] = true;
        this.setState({"YB": data, "changeBuffer": buffer});
    },

    _onBufferChange: function(layout, prefix, inputKey, inputVal, pk) {
        var este = this;
        var data = this.state.YB;
        var buffer = this.state.changeBuffer;

        if (prefix && this.state.changeBuffer[inputKey]) {
            var url = URLResolver.getRESTAccion(prefix, false, "bufferChanged");
            data[prefix].DATA[inputKey] = inputVal;
            helpers.requestAccion(url, {"data": data[prefix].DATA, "field": inputKey}, "PUT", function(response) {
                if ($(".fondogris").hasClass("active")) {
                    $(".fondogris").toggleClass("active")
                }
                buffer[inputKey] = false;
                data[prefix].DATA = response.data;
                data.labels = _.extend(data.labels, response.labels);
                data.drawIf = response.drawif;
                este.setState({"YB": data, "changeBuffer": buffer});
            },
            function(xhr, textStatus, errorThrown) {
                if ($(".fondogris").hasClass("active")) {
                    $(".fondogris").toggleClass("active")
                }
                if (xhr.status == 400) {
                    console.log(xhr.responseText);
                };
            });
        }
        else if (prefix && data[prefix].DATA.length > 0) {
            // TODO para hacerlo bien deberia tener un changebuffer
            var url = URLResolver.getRESTAccion(prefix, false, "bufferChanged");
            data[prefix].DATA[pk][inputKey] = inputVal;
            helpers.requestAccion(url, {"data": data[prefix].DATA[pk], "field": inputKey}, "PUT", function(response) {
                if ($(".fondogris").hasClass("active")) {
                    $(".fondogris").toggleClass("active");
                }
                data[prefix].DATA[pk] = response.data;
                data.labels = _.extend(data.labels, response.labels);
                data.drawIf = response.drawif;
                este.setState({"YB": data});
            },
            function(xhr, textStatus, errorThrown) {
                if ($(".fondogris").hasClass("active")) {
                    $(".fondogris").toggleClass("active")
                }
                if (xhr.status == 400) {
                    console.log(xhr.responseText);
                };
            });
        }
    },

    _onClientBufferChange: function(layoutAct, layoutObj, inputKey, inputVal, e) {
        var este = this;
        var data = this.state.YB;
        var url = URLResolver.getRESTAccion(this.props.PREFIX, false, "clientBufferChanged");
        if (inputVal) {
            data.otros["inputVal"] = inputVal;
        }
        var requestParams = {
            "field": inputKey,
            "otros": data.otros,
            "labels": data.labels,
            "drawIf": data.drawIf,
            "prefix": this.props.PREFIX,
            "pk": data[this.props.PREFIX].DATA.pk,
            "template": this.props.CUSTOM,
            "data": data[this.props.PREFIX].DATA
        };
        helpers.requestAccion(url, requestParams, "PUT", function(response) {
            // if ($(".fondogris").hasClass("active")) {
            //     $(".fondogris").toggleClass("active")
            // }
            if (response.hasOwnProperty("rel")) {
                data["articulosprov"].DATA = response["rel"];
            }
            data.otros = _.extend(data.otros, response.otros);
            data.labels = _.extend(data.labels, response.labels);
            data.drawIf = _.extend(data.drawIf, response.drawIf);
            este.setState({"YB": data});
            if (response.hasOwnProperty("datachange")) {
                for (var f in response["datachange"]) {
                    este._onChange(layoutObj, este.props.PREFIX, f, response["datachange"][f], data[este.props.PREFIX].DATA["pk"]);
                    este._onBufferChange(layoutObj, este.props.PREFIX, f, response["datachange"][f], data[este.props.PREFIX].DATA["pk"]);
                }
                // data[this.props.PREFIX]["DATA"] = response["rel"]
            }
            if (layoutAct && layoutAct.hasOwnProperty("success")) {
                este._misuccess(layoutAct, layoutObj, null, null, response);
            }
        },
        function(xhr, textStatus, errorThrown) {
            if (xhr.status == 400) {
                console.log(xhr.responseText);
            }
        });
    },

    _onFieldChange: function(inputKey, prefix, inputValue, aux) {
        var data = this.state.YB;
        data.otros[inputKey] = inputValue;
/*        if (!data[prefix].DATA.isArray) {
            if (aux) {
                data[prefix].DATA[aux] = inputValue;
                data["otros"][inputKey] = inputValue;
            }
            else {
                data[prefix].DATA[inputKey] = inputValue;
            }
        }*/
        this.setState({"YB": data});
    },

    _onDataChange: function(schema, data) {
        var YBdata = this.state.YB;
        YBdata[schema].DATA = data;
        this.setState({"YB": YBdata});
    },

    _onYBChange: function(schema, yb) {
        if (!schema) {
            this.setState({"YB": yb});
        }
        else {
            var YB = this.state.YB;
            YB[schema].DATA = yb.data;
            YB[schema].IDENT.PAG = yb.PAG;
            YB[schema].INFO = yb.INFO;
            YB.info = _.extend(YB.info, YB[schema].INFO);
            this.setState({"YB": YB});
        }
    },

    _onOtrosChange: function(name, data) {
        var YBdata = this.state.YB;
        YBdata["otros"][name] = data;
        this.setState({"YB": YBdata});
    },

    _onPersistenteChange: function(name, data) {
        var YBdata = this.state.YB;
        YBdata["persistente"][name] = data;
        this.setState({"YB": YBdata});
    },

    _onChatChange: function(sender, receiver, message) {
        var YBdata = this.state.YB;
        var room;
        if (this.props.USER == sender) {
            room = this.props.USER + "_" + receiver;
        }
        else {
            room = this.props.USER + "_" + sender;
        }
        if (!YBdata["chat"]["chats"][room]) {
            YBdata["chat"]["chats"][room] = [];
        }
        YBdata["chat"]["chats"][room].push({"sender": sender, "receiver": receiver, "message": message});
        this.setState({"YB": YBdata});
    },

    _onActiveGroupBox: function(active, data) {
        if (!data) {
            this.setState({"activeGroupBox": active});
        }
        else {
            data[this.props.PREFIX] = this.state.YB[this.props.PREFIX];
            this.setState({"YB": data, "activeGroupBox": active});
        }
    },

    _onDelete: function(prefix, pk, prefixDelete, ev) {
        var este = this;
        var url = URLResolver.getRESTAccion(prefixDelete, pk, "delete");
        helpers.requestAccion(url, {} , "PUT",
            function(response) {
                $.each(este.state.YB[prefix].DATA, function(key, obj) {
                    if (obj.pk == response.data.pk) {
                        este.state.YB[prefix].DATA.splice(key, 1);
                        return false;
                    }
                });
                este._cierraModal();
                este.setState({"YB": este.state.YB});
            },
            function(xhr, textStatus, errorThrown) {
                if (xhr.status == 400) {
                    console.log(xhr.responseText);
                    var toastSet = {};
                    toastSet["tipo"] = "danger";
                    toastSet["titulo"] = "";
                    toastSet["mensaje"] = "No se pudo eliminar el registro";
                    este.invocaToast(toastSet);
                    este._cierraModal();
                };
            }
        );
        este._onRefrescar({}, {}, {}, prefix, window.location.href)
    },

    // _refrescarCallback: function(response, receiver) {
    _refrescarCallback: function(response) {
        response.data["otros"] = _.extend(response.data["otros"], this.state.YB["otros"]);
        for (var k in response.data["otros"]) {
            response.data["otros"][k] = null;
        }

        response.data["otros"] = _.extend(response.data["otros"], this.state.YB["persistente"]);
        response.data["otros"] = _.extend(response.data["otros"], this.state.YB["default"]);
        var refrescar = _.extend(this.state.YB, response.data);
        this.setState({"YB": refrescar, "HISTORY": response.history});
    },

    _addPersistentData: function(name, value, def) {
        var auxData = this.state.YB;
        if (def) {
            auxData["default"][name] = value;
        }
        else {
            auxData["persistente"][name] = value;
        }
        this.setState({"YB": auxData});
    },

    _updOtros: function(data) {
        var auxData = this.state.YB;
        for (var o in data) {
            if (auxData["persistente"].hasOwnProperty(o)) {
                auxData["persistente"][o] = data[o];
            }
        }
        auxData["otros"] = _.extend(data, auxData["persistente"]);
        this.setState({"YB": auxData});
    },

    //TODO Esta funcion tiene mucho codigo repetido hay que revisarlo
    _misuccess: function(layoutAct, layout, pk, prefix, response) {
        // console.log("viene por mi success????");
        // console.log(layoutAct, layout, pk, prefix, response);
        var este = this;
        var data = este.state.YB;
        if (!prefix || prefix == "") {
            prefix = this.props.PREFIX;
        }
        $(".loadProgress").hide();
        if (response.resul == false) {
            if (layout.hasOwnProperty("error")) {
                for (var i = 0, l = layoutAct.error.length; i < l; i++) {
                    este.lanzarSuccess(layoutAct.error[i], response, layoutAct.prefix || prefix);
                }
            }
            else {
                if (response.hasOwnProperty("msg")) {
                    var toastSet = {};
                    toastSet["tipo"] = "warning";
                    toastSet["titulo"] = "";
                    toastSet["mensaje"] = response.msg;
                    this.invocaToast(toastSet);
                }
                else {
                    console.log("Error inesperado");
                    var toastSet = {};
                    toastSet["tipo"] = "warning";
                    toastSet["titulo"] = "";
                    toastSet["mensaje"] = "Error Inesperado";
                    this.invocaToast(toastSet);
                }
            }
        }
        else if (response.resul == true) {
            if (!layoutAct.hasOwnProperty("autoCommit") || (layoutAct.hasOwnProperty("autoCommit") && layoutAct.autoCommit == false)) {
                var toastSet = {};
                toastSet["tipo"] = "success";
                toastSet["titulo"] = "";
                toastSet["mensaje"] = "Correcto";
                este.invocaToast(toastSet);
            }
            if (layoutAct.success) {
                if (layoutAct.success.length == 0) {
                    este._updOtros({});
                }
                for(var i = 0, l = layoutAct.success.length; i < l; i++) {
                    este.lanzarSuccess(layoutAct.success[i], response, layoutAct.prefix || prefix);
                }
            }
            else {
                este.setState({"YB" : data});
            }
        }
        else if (response.resul && "status" in response.resul) {
            //ERROR
            if (response.resul.status == 0) {
                var toastSet = {};
                toastSet["tipo"] = "warning";
                toastSet["titulo"] = "";
                toastSet["mensaje"] = "Error Inesperado";
                this.invocaToast(toastSet);
                console.log("Error inesperado");
            }
            else if (response.resul.status == 1) {
                if (response.resul.hasOwnProperty("data")) {
                    var data = response.resul.data;
                    if (!data["pk"]) {
                        data["usuario"] = this.props.USER;
                        if (pk) {
                            data["pk"] = pk;
                        }
                        else {
                            data["pk"] = this.state.YB[prefix].DATA.pk;
                        }
                    }
                    this._updOtros(data);
                }

                if (response.resul.hasOwnProperty("msg")) {
                    var toastSet = {};
                    toastSet["tipo"] = "warning";
                    toastSet["titulo"] = "";
                    toastSet["mensaje"] = response.resul.msg;
                    this.invocaToast(toastSet);
                }

                if (layoutAct.success) {
                    for (var i = 0, l = layoutAct.success.length; i < l; i++) {
                        este.lanzarSuccess(layoutAct.success[i], response, layoutAct.prefix || prefix);
                    }
                }
                else {
                    este._updOtros({});
                }
            }
            else if (response.resul.status == -1) {
                var data = response.resul.data;
                if (response.resul.hasOwnProperty("params")) {
                    var layoutParams = response.resul.params;
                    var params = {};
                    if (!data["pk"]) {
                        data["usuario"] = this.props.USER;
                        if (pk) {
                            data["pk"] = pk;
                        }
                        else {
                            data["pk"] = this.state.YB[prefix].DATA.pk;
                        }
                    }
                    _.each(layoutParams, function(obj, key) {
                        if (layoutParams[key].tipo == "rel") {
                            if (layoutParams[key]["key"] == "user") {
                                data["usuario"] = this.props.USER;
                            }
                            else {
                                data[layoutParams[key]["key"]] = este.state.YB[layoutParams[key].rel].DATA[layoutParams[key]["key"]]
                            }
                        }
                        else {
                            if (!layoutParams[key].hasOwnProperty("visible")) {
                                params[layoutParams[key]["key"]] = layoutParams[key];
                            }

                            if (layoutParams[key].hasOwnProperty("null")) {
                                if (!params.hasOwnProperty(layoutParams[key]["key"])) {
                                    params[layoutParams[key]["key"]] = layoutParams[key];
                                }

                                if (layoutParams[key]["key"] in data) {
                                    //TODO añadir blank/null param por probar
                                    if (data[layoutParams[key]["key"]] === undefined) {
                                        data[layoutParams[key]["key"]] = null;
                                    }
                                }
                                else {
                                    if (este.state.YB.otros.hasOwnProperty(layoutParams[key]["key"])) {
                                        data[layoutParams[key]["key"]] = este.state.YB.otros[layoutParams[key]["key"]];
                                    }
                                    else {
                                        data[layoutParams[key]["key"]] = null;
                                    }
                                }
                            }
                            else if (!data[layoutParams[key]["key"]]) {
                                if (este.state.YB.otros[layoutParams[key]["key"]]) {
                                    data[layoutParams[key]["key"]] = este.state.YB.otros[layoutParams[key]["key"]];
                                    //Si se quita esta linea los parametros no se pediran una vez escritos
                                    //if(layoutParams[key].value)
                                    //  params[key] = layoutParams[key];
                                }
                                else {
                                    params[layoutParams[key]["key"]] = layoutParams[key];
                                    data[layoutParams[key]["key"]] = layoutParams[key].value;
                                }
                            }
                        }
                    });
                    this._updOtros(data);
                    var onSubmit = {};

                    //TODO no deberia meter layoutParams aqui.
                    onSubmit["params"] = layoutParams;
                    onSubmit = $.extend({}, layoutAct, onSubmit);
                    this._invocaAccionModal(params, data, onSubmit, "otros", layout);
                }
                else {
                    if (response.resul.hasOwnProperty("data")) {
                        var data = response.resul.data;
                        if (!data["pk"]) {
                            data["usuario"] = this.props.USER;
                            if (pk) {
                                data["pk"] = pk;
                            }
                            else {
                                data["pk"] = this.state.YB[prefix].DATA.pk;
                            }
                        }
                        this._updOtros(data);
                    }

                    if (response.resul.hasOwnProperty("msg")) {
                        var toastSet = {};
                        toastSet["tipo"] = "warning";
                        toastSet["titulo"] =  "";
                        toastSet["mensaje"] = response.resul.msg;
                        this.invocaToast(toastSet);
                    }

                    if (layoutAct.error) {
                        for (var i = 0, l = layoutAct.error.length; i < l; i++) {
                            este.lanzarSuccess(layoutAct.error[i], response, layoutAct.prefix || prefix);
                        }
                    }
                }
            }
            else if (response.resul.status == 2) {
                var accion = null;
                if (layoutAct.key) {
                    accion = this.props.ACCIONES[layoutAct.key];
                }
                else if (layoutAct.submit) {
                    accion = {};
                    accion["serverAction"] = layoutAct.submit;
                }
                else {
                    accion = this.props.ACCIONES[layoutAct];
                }
                if (!accion) {
                    accion = {};
                }
                var data = {}
                data[prefix] = {};
                data[prefix]["confirmacion"] = true;
                if (response.resul.hasOwnProperty("data")) {
                    data[prefix] = response.resul.data;
                }
                if (response.resul.hasOwnProperty("confirm")) {
                    accion["msg"] = response.resul.confirm;
                }
                if (response.resul.hasOwnProperty("oncancel")) {
                    accion["oncancel"] = response.resul.oncancel;
                }

                if (response.resul.hasOwnProperty("onconfirm")) {
                    accion["onconfirm"] = response.resul.onconfirm;
                }
                if (response.resul.hasOwnProperty("close")) {
                    accion["close"] = true;
                }
                this._invocaConfirmacionModal(accion, layout, prefix, layoutAct, pk, data);
            }
            else {
                //Caso no previsto o solo msg
                var toastSet = {};
                toastSet["tipo"] = "warning";
                toastSet["titulo"] =  "";
                toastSet["mensaje"] = "Error Inesperado";
                if (response.resul.hasOwnProperty("msg")) {
                    toastSet["mensaje"] = response.resul.msg;
                }
                this.invocaToast(toastSet);
            }
        }
        else {
            //Caso no previsto(no es false, no es true ni tiene status)
            console.log("Error inesperado");
            var toastSet = {};
            toastSet["tipo"] = "warning";
            toastSet["titulo"] =  "";
            toastSet["mensaje"] = "Error Inesperado";
            if (response.hasOwnProperty("msg")) {
                toastSet["mensaje"] = response.msg;
            }
            this.invocaToast(toastSet);
        }
    },

    //En caso de error al ejecutar accion.
    _mierror: function(layoutAct, layout, pk, response, xhr) {
        //console.log(" es un mi error")
        var este = this;
        $(".loadProgress").hide();
        this._updOtros({});
        if ((layoutAct.hasOwnProperty("status") && layoutAct.status == 401) ||(response && response.status == 401)){
            var toastSet = {};
            toastSet["tipo"] = "warning";
            toastSet["titulo"] = "";
            toastSet["mensaje"] = "Permiso denegado";
            this.invocaToast(toastSet);
        }
        else if (!response) {
            console.log("Error inesperado");
            var toastSet = {};
            toastSet["tipo"] = "warning";
            toastSet["titulo"] = "";
            toastSet["mensaje"] = "Error Inesperado";
            this.invocaToast(toastSet);
        }
        else if (layoutAct.hasOwnProperty("error")){
            for (var i = 0, l = layoutAct.error.length; i < l; i++) {
                este.lanzarSuccess(layoutAct.error[i], response, layoutAct.prefix);
            }
        }
        else if (response.responseJSON.hasOwnProperty("msg") && response.responseJSON.msg[0] == "No valid insert") {
            //TODO lanzar toast
            var toastSet = {};
            toastSet["tipo"] = "warning";
            toastSet["titulo"] = "";
            var mensaje = "Error de inserci&oacute;n";
            if (layoutAct.hasOwnProperty("error")) {
                mensaje = layoutAct.error;
            }

            toastSet["mensaje"] = mensaje;
            this.invocaToast(toastSet);
        }
        else {
            console.log("Error inesperado");
            var toastSet = {};
            toastSet["tipo"] = "warning";
            toastSet["titulo"] = "";
            toastSet["mensaje"] = "Error Inesperado";
            this.invocaToast(toastSet);
        }
    },

    lanzarAccion: function(layout, prefix, layoutAct, pk, data, acciones) {
        var accion = {};

        // var accionesDef = ["submit", "create", "nextPag", "previousPag", "link", "newRow", "update", "goto", "return", "firstPag", "lastPag", "onsearch", "clientAct", "submit-edit", "submit-return", "update-return"];
        // if (accionesDef.find(layoutAct) != -1) {
        //     accion["action"] = layoutAct;
        // }
/*        if (layoutAct == "submit" || layoutAct == "create" || layoutAct == "nextPag" || layoutAct == "previousPag" || layoutAct == "link" || layoutAct == "newRow" || layoutAct == "update" || layoutAct == "goto" || layoutAct == "return" || layoutAct == "firstPag" || layoutAct == "lastPag" || layoutAct == "onsearch" || layoutAct == "clientAct" || layoutAct == "submit-edit" || layoutAct == "submit-return" || layoutAct == "submit-new" || layoutAct == "update-return" || layoutAct == "newGridFilter" || layoutAct == "refrescar" || layoutAct == "getFiles") {
            accion["action"] = layoutAct;
        }
        else {
            if (layoutAct.key) {
                accion = this.props.ACCIONES[layoutAct.key];
            }
            else {
                accion = this.props.ACCIONES[layoutAct];
            }
        }*/

        if (!acciones) {
            acciones = this.props.ACCIONES;
        }

        if (typeof layoutAct === "string") {
            if (acciones && acciones.hasOwnProperty(layoutAct)) {
                accion = acciones[layoutAct];
            } else {
                accion["action"] = layoutAct;
            }
        } else {
            if (layoutAct.key) {
                accion = acciones[layoutAct.key];
            } else {
                accion["action"] = null;
            }
        }
        var este = this;
        switch (accion.action) {
            //Submit por defecto para el formulario
            case "submit": {
                este._cierraModal();
                var url = URLResolver.getRESTAccion(prefix, false, "create");
                // var layoutObj = este._dameObjetoLayout(layout);
                helpers.requestAccion(url, data, "PUT", este._misuccess.bind(this, layout, layout, data[prefix]["pk"], prefix), este._mierror.bind(this, layout, layout, data[prefix]["pk"]));
                break;
            }
            case "submit-edit": {
                este._cierraModal();
                var url = URLResolver.getRESTAccion(prefix, false, "create");
                // var layoutObj = este._dameObjetoLayout(layout);
                layout["success"] = [{"slot": "redirect"}];
                helpers.requestAccion(url, data, "PUT", este._misuccess.bind(this, layout, layout, data[prefix]["pk"], prefix), este._mierror.bind(this, layout, layout, data[prefix]["pk"]));
                break;
            }
            case "submit-return": {
                este._cierraModal();
                var url = URLResolver.getRESTAccion(prefix, false, "create");
                // var layoutObj = este._dameObjetoLayout(layout);
                layout["success"] = [{"slot": "return"}];
                helpers.requestAccion(url, data, "PUT", este._misuccess.bind(this, layout, layout, data[prefix]["pk"], prefix), este._mierror.bind(this, layout, layout, data[prefix]["pk"]));
                break;
            }
            case "submit-new": {
                este._cierraModal();
                var url = URLResolver.getRESTAccion(prefix, false, "create");
                // var layoutObj = este._dameObjetoLayout(layout);
                layout["success"] = [{"slot": "recargar"}];
                helpers.requestAccion(url, data, "PUT", este._misuccess.bind(this, layout, layout, data[prefix]["pk"], prefix), este._mierror.bind(this, layout, layout, data[prefix]["pk"]));
                break;
            }
            case "update": {
                este._cierraModal();
                var url = URLResolver.getRESTAccion(prefix, data[prefix]["pk"], "update");
                // var layoutObj = este._dameObjetoLayout(layout);
                helpers.requestAccion(url, data, "PUT", este._misuccess.bind(this, layout, layout, data[prefix]["pk"], prefix), este._mierror.bind(this, layout, layout, data[prefix]["pk"]));
                break;
            }
            case "update-return": {
                este._cierraModal();
                var url = URLResolver.getRESTAccion(prefix, data[prefix]["pk"], "update");
                // var layoutObj = este._dameObjetoLayout(layout);
                layout["success"] = [{"slot": "return"}];
                helpers.requestAccion(url, data, "PUT", este._misuccess.bind(this, layout, layout, data[prefix]["pk"], prefix), este._mierror.bind(this, layout, layout, data[prefix]["pk"]));
                break;
            }
            //Formulario newRecord
            case "create": {
                este._cierraModal();
                var url = URLResolver.getRESTAccion(prefix, null, "create");
                // var layoutObj = este._dameObjetoLayout(layout);
                helpers.requestAccion(url, data, "PUT", este._misuccess.bind(this, layout, layout, data[prefix]["pk"], prefix), este._mierror.bind(this, layout, layout, data[prefix]["pk"]));
                break;
            }
            case "actionCreate": {
                este._cierraModal();
                var layoutObj = este._dameObjetoLayout(layout);
                var action = layoutObj.action || layoutObj.actions[0];
                var url = URLResolver.getRESTAccion(prefix, null, "create");
                var modelData = {};
                modelData[this.props.PREFIX] = this.state.YB[this.props.PREFIX].DATA;
                helpers.requestAccion(url, modelData, "PUT", este._misuccess.bind(this, action, layout, pk, prefix), este._mierror.bind(this, action, layout, pk));
                break;
            }
            case "newRow": {
                este._cierraModal();
                var querystring = this.props.SCHEMA[prefix];
                if (this.state.activeGroupBox && prefix in this.state.activeGroupBox) {
                    var querystring = this.state.activeGroupBox[prefix];
                }
                var url = URLResolver.getTemplate(this.props.APLIC, prefix, null, "newRecord");
                var rel = "p_" + querystring.rel;
                var fieldRelation = querystring.fieldRelation || false;
                var params = {};
                params[rel] = this.state.YB[this.props.PREFIX].DATA.pk
                if (fieldRelation) {
                    params[rel] = this.state.YB[this.props.PREFIX].DATA[fieldRelation]
                }
                var aux = $.param(params);
                url = url + "?" + aux;
                window.location.href = url;
                break;
            }
            case "deleteRow": {
                let prefixDelete = prefix;
                if ("prefix" in accion) {
                    prefixDelete = accion.prefix;
                }

                this._invocaConfirmacionDeleteModal(layout, prefix, pk, prefixDelete);
                break;
            }
            case "focus": {
                var fdbFocus = layoutAct.receiver;
                try {
                    let domFocus = document.getElementById(fdbFocus);
                    domFocus.trigger( "click" );
                    domFocus.focus();
                }
                catch(e) {
                    console.log("error focus");
                    return;
                }
                break;
            }
            case "refrescar": {
                este._cierraModal();
                este._onRefrescar({}, {}, {}, window.location.href)
/*                var receiver = null;
                if (layoutAct && layoutAct.hasOwnProperty("receiver")) {
                    receiver = layoutAct.receiver;
                }
                este._onRefrescar(layoutAct, response, prefix, receiver, null);*/
                break;
            }
            case "select": {
                var fdbFocus = layoutAct.receiver;
                try {
                    let domFocus = document.getElementById(fdbFocus);
                    setTimeout(function() { domFocus.select(); }, 500);
                }
                catch(e) {
                    console.log("error select")
                    return;
                }
                break;
            }
            case "link": {
                var url;
                if ("template" in accion) {
                    var rel;
                    if (!prefix) {
                        prefix = this.props.PREFIX;
                    }
                    if (this.state.YB[prefix].DATA.length > 0) {
                        if (accion.rel == "master") {
                            rel = "custom"
                        }
                        else if (!pk) {
                            rel = this.state.YB[prefix].DATA[0][accion.rel];
                        }
                        else {
                            rel = pk;
                        }
                    }
                    else {
                        rel = this.state.YB[prefix].DATA[accion.rel]
                    }
                    url = URLResolver.getTemplate(this.props.APLIC, accion.template, rel);

                    if (accion.hasOwnProperty("custom")) {
                        url = URLResolver.getTemplate(this.props.APLIC, accion.template, rel, accion.custom);
                    }
                }
                else if (accion.hasOwnProperty("custom")) {
                    url = URLResolver.getTemplate(this.props.APLIC, prefix, pk, accion.custom);
                }
                else {
                    url = URLResolver.getTemplate(this.props.APLIC, prefix, pk);
                }

                window.location.href = url;
                break;
            }
            case "open": {
                var url;
                if ("template" in accion) {
                    var rel = this.state.YB[prefix].DATA[0][accion.rel]
                    url = URLResolver.getTemplate(this.props.APLIC, accion.template, rel);
                }
                else {
                    url = URLResolver.getTemplate(this.props.APLIC, prefix, pk);
                }
                window.open(url);
                break;
            }
            case "goto": {
                var oParam = {};
                if (accion.hasOwnProperty("params")) {
                    var este = this;
                    oParam["oParam"] = {};
                    _.each(accion["params"], function(obj, key) {
                        oParam["oParam"][accion["params"][key]["key"]] = este.state.YB["otros"][accion["params"][key]["key"]];
                    });
                }
                if (accion.hasOwnProperty("template")) {
                    if(accion["template"] == "form") {
                        window.location.href = window.location.pathname.slice(0, -6) + pk
                    }
                    else {
                        window.location.href = window.location.pathname.slice(0, -6) + pk + "/" + accion["template"]
                    }
                }
                else if (accion.hasOwnProperty("prefix")) {
                    var nAccion = accion.serverAction;
                    var url = URLResolver.getRESTAccion(accion.prefix, pk || this.state.YB[accion.prefix].DATA.pk, nAccion);
                    helpers.requestAccion(url, oParam, "PUT", function(response) {
                        if (response.resul != true) {
                            if (response.resul.hasOwnProperty("msg")) {
                                var toastSet = {};
                                toastSet["tipo"] = "warning";
                                toastSet["titulo"] = "";
                                toastSet["mensaje"] = response.resul.msg;
                                este.invocaToast(toastSet);
                            }
                            else if(accion.hasOwnProperty("newtab") && accion.newtab) {
                                window.open(response.resul)
                            }
                            else {
                                window.location.href = response.resul;
                            }
                        }
                    }, este._mierror);
                }
                else {
                    var nAccion = accion.serverAction;
                    var layoutObj = este._dameObjetoLayout(layout);
                    var prefix = prefix || layoutObj.prefix;
                    var url = URLResolver.getRESTAccion(prefix, pk, nAccion);
                    helpers.requestAccion(url, oParam, "PUT", function(response) {
                        if (response.resul != true) {
                            if (accion.hasOwnProperty("newtab") && accion.newtab) {
                                window.open(response.resul)
                            }
                            else {
                                window.location.href = response.resul;
                            }
                        }
                    }, este._mierror);
                }
                break;
            }
            case "return": {
                var lastHist = this.props.HISTORY;
                var url = URLResolver.getTemplate(lastHist.aplic, lastHist.prefix, lastHist.pk, lastHist.template);
                window.location.href = url;
                break;
            }
            case "updateModal": {
                var params = null;
                var prefixdata = este._getDataFromPk(prefix, pk);
                var prefixschema = this.state.YB[this.props.PREFIX].SCHEMA;
                this._invocaAccionModal(prefixschema, prefixdata, null, layout);
                break;
            }
            case "onsearch": {
                var filtro = data;
                if (layout && (layout.type  == "query" || (typeof layout === "string" && layout.startsWith("qt_")))) {
                    layout = prefix;
                    filtro["qr_t"] = prefix;
                    prefix = this.props.PREFIX;
                    if (this.state.YB[this.props.PREFIX].DATA.pk) {
                        filtro["qr_pk"] = this.state.YB[this.props.PREFIX].DATA.pk;
                    }
                }
                else {
                    layout = prefix;
                }
                // MAINFILTER
                filtro = _.extend({}, this.props.YB[layout].IDENT.MAINFILTER, filtro);
                var URL = URLResolver.getRESTQuery(prefix, "list");
                var misuccess;
                misuccess = function(response) {
                    este._onYBChange(layout, response);
                };
                helpers.requestGET(URL, filtro, misuccess);
                break;
            }
            case "nextPag": {
                var filtro = {};
                filtro = this.state.YB[prefix].IDENT.FILTER;
                filtro["p_o"] = this.state.YB[prefix].IDENT.PAG.NO
                if (this.state.YB[prefix].IDENT.PAG.NO != null) {
                    if (data && data.startsWith("qt_")) {
                        layout = data.substring(3, data.length);
                        prefix = this.props.PREFIX;
                        filtro["qr_t"] = layout;
                        filtro["qr_pk"] = this.state.YB[this.props.PREFIX].DATA.pk;
                    }
                    else {
                        layout = prefix;
                    }
                    var URL = URLResolver.getRESTQuery(prefix, "list");
                    var misuccess;
                    misuccess = function(response) {
                        este.state.YB[layout].DATA = response.data;
                        este.state.YB[layout].IDENT.PAG = response.PAG;
                        este.setState({"YB": este.state.YB});
                    };
                    helpers.requestGET(URL, filtro, misuccess);
                }
                break;
            }
            case "previousPag": {
                var filtro = {};
                filtro = this.state.YB[prefix].IDENT.FILTER;
                if (this.state.YB[prefix].IDENT.PAG.PO) {
                    filtro["p_o"] = this.state.YB[prefix].IDENT.PAG.PO;
                }
                else {
                    filtro["p_o"] = 0;
                }
                if (data && data.startsWith("qt_")) {
                    layout = data.substring(3, data.length)
                    prefix = this.props.PREFIX;
                    filtro["qr_t"] = layout;
                    filtro["qr_pk"] = this.state.YB[this.props.PREFIX].DATA.pk;
                }
                else {
                    layout = prefix;
                }
                var URL = URLResolver.getRESTQuery(prefix, "list");
                var misuccess;
                var mierror;
                misuccess = function(response) {
                    este.state.YB[layout].DATA = response.data;
                    este.state.YB[layout].IDENT.PAG = response.PAG;
                    este.setState({"YB": este.state.YB});
                };
                helpers.requestGET(URL, filtro, misuccess) ;
                break;
            }
            case "firstPag": {
                var filtro = {};
                filtro = this.state.YB[prefix].IDENT.FILTER;
                filtro["p_o"] = 0
                if (data && data.startsWith("qt_")) {
                    layout = data.substring(3, data.length)
                    prefix = this.props.PREFIX;
                    filtro["qr_t"] = layout;
                    filtro["qr_pk"] = this.state.YB[this.props.PREFIX].DATA.pk;
                }
                else {
                    layout = prefix;
                }
                var URL = URLResolver.getRESTQuery(prefix, "list");
                var misuccess;
                misuccess = function(response) {
                    este.state.YB[layout].DATA = response.data;
                    este.state.YB[layout].IDENT.PAG = response.PAG;
                    este.setState({"YB": este.state.YB});
                };
                helpers.requestGET(URL, filtro, misuccess);
                break;
            }
            case "lastPag": {
                var filtro = {};
                filtro = this.state.YB[prefix].IDENT.FILTER;
                if (data && data.startsWith("qt_")) {
                    layout = data.substring(3, data.length)
                    prefix = this.props.PREFIX;
                    filtro["qr_t"] = layout;
                    filtro["qr_pk"] = this.state.YB[this.props.PREFIX].DATA.pk;
                }
                else {
                    layout = prefix;
                }
                if (this.state.YB[prefix].IDENT.PAG.COUNT % filtro["p_l"]) {
                    filtro["p_o"] = this.state.YB[prefix].IDENT.PAG.COUNT - (this.state.YB[prefix].IDENT.PAG.COUNT % filtro["p_l"]);
                }
                else {
                    filtro["p_o"] = this.state.YB[prefix].IDENT.PAG.COUNT - filtro["p_l"];
                }

                var URL = URLResolver.getRESTQuery(prefix, "list");
                var misuccess;
                misuccess = function(response) {
                    este.state.YB[layout].DATA = response.data;
                    este.state.YB[layout].IDENT.PAG = response.PAG;
                    este.setState({"YB": este.state.YB});
                };
                helpers.requestGET(URL, filtro, misuccess);
                break;
            }
            case "toast": {
                var toastSet = {};
                toastSet["tipo"] = accion.hasOwnProperty("tipo") ? accion.tipo : "warning";
                toastSet["titulo"] = accion.hasOwnProperty("titulo") ? accion.titulo : "";
                toastSet["mensaje"] = accion.hasOwnProperty("mensaje") ? accion.mensaje : "Error";
                this.invocaToast(toastSet);
                break;
            }
            // case "sessionStore":
            //     sessionStorage.setItem(layout, this.state.YB.otros[layout]);
            //     break;
            // }
            case "clientAct": {
                // LLamar a funcion de cliente de forma dinamica
                var cliente = new client();
                var response = cliente[accion.name]();
                if (accion.hasOwnProperty("otros")) {
                    this._onOtrosChange(accion.otros, response);
                }
                if (accion.hasOwnProperty("persistente")) {
                    this._onPersistenteChange(accion.persistente, response);
                }
                if (response && layoutAct.hasOwnProperty("success")) {
                    var success = {};
                    success["resul"] = true;
                    this._misuccess(layoutAct, layoutObj, null, null, success)
                }
                break;
            }
            case "bufferChanged": {
                var buffer = this.state.changeBuffer;
                buffer[accion.name] = true;
                this.setState({"changeBuffer": buffer});
                $(".fondogris").toggleClass("active");
                this._onBufferChange("", this.props.PREFIX, accion.name, "", this.state.YB[this.props.PREFIX].DATA.pk);
                break;
            }
            case "clientBufferChanged": {
                this._onClientBufferChange(layoutAct, layoutObj, accion.name, pk, null);
                break;
            }
            case "gridAction": {
                var nAccion = accion.serverAction;
                var prefix = this.props.PREFIX;
                this._cierraModal();
                if (accion.hasOwnProperty("prefix")) {
                    prefix = accion.prefix;
                }
                var pkdata = this.state.YB[prefix].DATA.pk;
                if (!pkdata) {
                    pkdata = this.state.YB[prefix].DATA[0].pk
                }
                var url = URLResolver.getRESTAccion(prefix, pkdata, nAccion);
                var oParam = {};
                oParam["oParam"] = {};
                if (data.hasOwnProperty("otros")) {
                    data = data["otros"];
                }
                if (data.hasOwnProperty("selecteds")) {
                    oParam["oParam"]["data"] = data;
                }
                else {
                    try {
                        oParam["oParam"]["selecteds"] = data.join(",");
                    } catch(e) {
                        console.log("")
                    }
                }
                helpers.requestAccion(url, oParam, "PUT", este._misuccess.bind(this, layoutAct, layout, pkdata, prefix), este._mierror);
                break;
            }
            case "updateGridFilter": {
                var accion = {};
                accion["serverAction"] = "actualizaFiltro";
                accion["params"] = [
                    {
                        "tipo": 3,
                        "verbose_name": "filterData",
                        "key": "filterData",
                        "validaciones": null
                    },
                    {
                        "tipo": 3,
                        "verbose_name": "prefix",
                        "key": "prefix",
                        "validaciones": null
                    }
                ];
                layoutAct = {};
                layoutAct["key"] = "updateGridFilter";
                //layoutAct["success"] = [{"slot": "recargar"}]
                if ("descFilter" in this.state.YB["otros"]) {
                    this._lanzaLegacyAction(accion, layout, "sis_gridfilter", layoutAct, pk, data);
                }
                else {
                    this._lanzaLegacyAction(accion, layout, "sis_gridfilter", "updateGridFilter", pk, data);
                }
                break;                
            }
            case "newGridFilter": {
                var accion = {};
                accion["serverAction"] = "nuevoFiltro";
                accion["params"] = [
                    {
                        "tipo": 3,
                        "verbose_name": "filterData",
                        "key": "filterData",
                        "validaciones": null
                    },
                    {
                        "tipo": 3,
                        "verbose_name": "prefix",
                        "key": "prefix",
                        "validaciones": null
                    }
                ];
                layoutAct = {};
                layoutAct["key"] = "newGridFilter";
                layoutAct["success"] = [{"slot": "recargar"}]
                if ("descFilter" in this.state.YB["otros"]) {
                    this._lanzaLegacyAction(accion, layout, "sis_gridfilter", layoutAct, "NF", data);
                }
                else {
                    this._lanzaLegacyAction(accion, layout, "sis_gridfilter", "newGridFilter", "NF", data);
                }
                break;
            }
            case "gridFilter": {
                var filtro = this.state.YB[accion.prefix].IDENT.FILTER;
                var layoutObj = este._dameObjetoLayout(layout);

                delete filtro["p_o"];

                var objCol = este._dameObjetoLayout(accion.layout);

                if (objCol && objCol.hasOwnProperty("columns")) {
                    var cols = objCol.columns;
                    for (var c in cols) {
                        if (cols[c].tipo == "field") {
                            filtro["q_" + cols[c].key + "__icontains"] = this.state.YB.otros[layoutObj.key];
                        }
                    }
                }

                var sURL = URLResolver.getRESTQuery(accion.prefix, "list");
                helpers.requestGET(sURL, filtro, function(response) {
                    este._onYBChange(accion.prefix, response);
                }, function(xhr) {
                    console.log(xhr);
                });
                break;
            }
            case "confirmAction": {
                this._invocaConfirmacionModal(accion, layout, prefix, layoutAct, pk, data);
                break;
            }
            case "legacy": {
                this._lanzaLegacyAction(accion, layout, prefix, layoutAct, pk, data);
                break;
            }
            case "csvFile": {
                var nAccion = accion.serverAction;
                if (pk) {
                    data["pk"] = pk;
                }
                else {
                    data["pk"] = this.state.YB[this.props.PREFIX].DATA.pk;
                }

                var url = URLResolver.getRESTCsv(prefix, data.pk, nAccion);
                var params = accion.hasOwnProperty("params") ? accion.params : null;
                if (params) {
                    url += "?";
                    for (var p in accion.params) {
                        url += accion.params[p].key + "=" + this.state.YB["otros"][accion.params[p].key];
                    }
                }
                window.location = url;
                break;
            }
            case "getReport": {
                var nAccion = accion.serverAction;
                if (pk) {
                    data["pk"] = pk;
                }
                else {
                    data["pk"] = this.state.YB[this.props.PREFIX].DATA.pk;
                }

                var url = URLResolver.getRESTReport(prefix, data.pk, nAccion);
                window.location = url;
                break;
            }
            case "getFiles": {
                //var nAccion = accion.serverAction;
                if(!pk) {
                    pk = this.state.YB[this.props.PREFIX].DATA.pk;
                }
                var url = URLResolver.getRESTfile(prefix, pk, "getFiles");
                window.location = url;
                // window.open(link, "_blank")
                break;
            }
            case "success": {
                var response = {"resul": true};
                this._misuccess(layoutAct, layout, pk, prefix, response);
            }
            case "invocaModal": {
                this._invocaModalContainer(layoutAct, layout, pk, prefix, data);
            }
            default: {
                break;
            }
        }
    },

    _lanzaLegacyAction: function(accion, layout, prefix, layoutAct, pk, data){
        //console.log(accion, layout, prefix, layoutAct, pk, data)
        var este = this;
        if (layoutAct && layoutAct.hasOwnProperty("prefix")) {
            prefix = layoutAct.prefix;
        }
        var layoutParams = accion.params;
        try {
            if (layoutAct && layoutAct.hasOwnProperty("params")) {
                layoutParams = layoutAct.params;
            }
        } catch(err) {
            console.log(err);
        }
        var params = {};
        var nullparams = {};
        var objData = _.extend({}, data[prefix]);

        if (!objData["pk"]) {
            objData["usuario"] = this.props.USER;
            if (pk) {
                objData["pk"] = pk;
            }
            else {
                objData["pk"] = null;
                if (this.state.YB[prefix].DATA) {
                    objData["pk"] = this.state.YB[prefix].DATA.hasOwnProperty("pk") ? this.state.YB[prefix].DATA.pk : null;
                }
            }
        }
        //console.log(layoutParams)
        _.each(layoutParams, function(obj, key) {
            if (layoutParams[key].tipo == "rel") {
                if (layoutParams[key]["key"] == "user") {
                    objData["usuario"] = this.props.USER;
                }
                else {
                    objData[layoutParams[key]["key"]] = este.state.YB[layoutParams[key].rel].DATA[layoutParams[key]["key"]]
                }
            }
            else {
                if (layoutParams[key].hasOwnProperty("null")) {
                    if (layoutParams[key].hasOwnProperty("value")) {
                        if (este.state.YB.otros.hasOwnProperty(layoutParams[key]["key"])) {
                            objData[layoutParams[key]["key"]] = este.state.YB.otros[layoutParams[key]["key"]];
                        }
                        else {
                            objData[layoutParams[key]["key"]] = layoutParams[key].value;
                        }
                    }
                    if (!objData.hasOwnProperty(layoutParams[key]["key"]) && !este.state.YB.otros.hasOwnProperty(layoutParams[key]["key"])) {
                        params[layoutParams[key]["key"]] = layoutParams[key];
                    }

                    if (layoutParams[key]["key"] in objData) {
                        if (objData[layoutParams[key]["key"]] === undefined) {
                            objData[layoutParams[key]["key"]] = null;
                        }
                    }
                    else {
                        if (este.state.YB.otros.hasOwnProperty(layoutParams[key]["key"])) {
                            objData[layoutParams[key]["key"]] = este.state.YB.otros[layoutParams[key]["key"]];
                        }
                        else {
                            objData[layoutParams[key]["key"]] = null;
                        }
                    }
                }
                else if (!objData[layoutParams[key]["key"]]) {
                    if (este.state.YB.otros.hasOwnProperty(layoutParams[key]["key"])) {
                        objData[layoutParams[key]["key"]] = este.state.YB.otros[layoutParams[key]["key"]];
                    }
                    else {
                        params[layoutParams[key]["key"]] = layoutParams[key];
                        objData[layoutParams[key]["key"]] = layoutParams[key].value;
                    }
                }
            }
        });
        this._updOtros(objData);

        if (Object.keys(params).length > 0) {
            this._cierraModal();
            var onSubmit = {};
            onSubmit = layoutAct;
            if (Object.keys(params).length == 1 && params[Object.keys(params)[0]].tipo == 30){
                this._invocaModalNoSave(params, objData, onSubmit, "otros", layout);
            } else {
                this._invocaAccionModal(params, objData, onSubmit, "otros", layout);
            }
        }
        else {
            this._cierraModal();
            if (layoutAct.receiver) {
                if (layoutAct.receiver.startsWith("tdb_")) {
                    prefix = layoutAct.receiver.split("tdb_")[1];
                }
            }
            var nAccion = accion.serverAction;
            if (accion.hasOwnProperty("prefix")) {
                prefix = accion.prefix;

                // TODO: revisar para que está esto
                if (!objData["pk"]) {
                    objData["pk"] = this.state.YB[prefix].DATA.hasOwnProperty("pk") ? this.state.YB[prefix].DATA.pk : null;
                }
            }
            var oParam = {};
            oParam["oParam"] = {};
            _.each(layoutParams, function(obj, key) {
                oParam["oParam"][layoutParams[key]["key"]] = objData[layoutParams[key]["key"]];
            });
            if (objData.hasOwnProperty("confirmacion")) {
                oParam["oParam"]["confirmacion"] = objData["confirmacion"];
            }
            // var wait = 350;
            var wait = 1;
            $(".loadProgress").show(wait, function() {
                if (!objData.pk) {
                    var urpk = URLResolver.getRESTQuery(prefix, null, "list");
                    var objPk = "NF";
                    helpers.requestGET(urpk, {"p_l": 1}, function(response) {
                        if (response.data.length > 0) {
                            objPk = response.data[0].pk;
                        }
                        var url = URLResolver.getRESTAccion(prefix, objPk, nAccion);
                    helpers.requestAccion(url, oParam, "PUT", este._misuccess.bind(este, layoutAct, layout, objPk, prefix), este._mierror.bind(este, layoutAct, layout, objPk));
                        //este.lanzarAccion(layout, prefix, layoutAct, response.data[0].pk, data);
                    }, este._mierror.bind(este, layoutAct, layout, pk));
                }
                else {
                    var url = URLResolver.getRESTAccion(prefix, objData.pk, nAccion);
                    if (nAccion == "create" || nAccion == "update") {
                        url = URLResolver.getRESTAccion(prefix, false, "create");
                        oParam[este.props.PREFIX] = este.state.YB[este.props.PREFIX].DATA;
                    }
                    helpers.requestAccion(url, oParam, "PUT", este._misuccess.bind(este, layoutAct, layout, pk, prefix), este._mierror.bind(este, layoutAct, layout, pk));
                }
            });
        }
    },

    _onRefrescar: function(success, response, prefix, receiver, url) {
        var este = this;
        var custom = null;
        if (success.hasOwnProperty("receiver")) {
            receiver = success.receiver;
        }
        if (success.hasOwnProperty("custom")) {
            custom = success.custom;
        }

        if (!url) {
            var url = URLResolver.getTemplate(this.props.APLIC, this.props.PREFIX, this.state.YB[this.props.PREFIX].DATA.pk, custom);
            //if (this.state.YB[this.props.PREFIX].DATA.length > 0) {
            if (this.state.YB[this.props.PREFIX].hasOwnProperty("IDENT")) {
                if (custom) {
                    url = URLResolver.getTemplate(this.props.APLIC, this.props.PREFIX, "custom", this.props.CUSTOM);
                }
                else {
                    url = URLResolver.getTemplate(this.props.APLIC, this.props.PREFIX, "master");
                }
            }
        }

        var params = {};
        params["FILTER"] = {};
        params["otros"] = _.extend({}, this.state.YB["otros"]);
        params["labels"] = _.extend({}, this.state.YB["labels"]);
        params["drawIf"] = _.extend({}, this.state.YB["drawIf"]);
        if (receiver) {
            params["refresh"] = receiver;
        }
        var FILTER = "FILTER";
        // Sacamos IDENT de todas las tablas
        params["querystring"] = this.state.activeGroupBox;
        if (success.hasOwnProperty("mainfilter") && success.mainfilter) {
            FILTER = "MAINFILTER";
        }
        if (this.state.YB[this.props.PREFIX].hasOwnProperty("IDENT")) {
            params["FILTER"][this.props.PREFIX] = this.state.YB[this.props.PREFIX].IDENT[FILTER];
        }
        for (var s in this.props.SCHEMA) {
            if (this.state.YB[s].hasOwnProperty("IDENT")) {
                params["FILTER"][s] = this.state.YB[s].IDENT[FILTER];
                if (this.state.YB[s].META.hasOwnProperty("type") && this.state.YB[s].META.type == "query") {
                    params["FILTER"][s]["query"] = {};
                }
            }
        }
        helpers.requestAccion(url, params, "PUT", function(response) {
            var YB = response.data;
            YB.persistente = este.state.YB.persistente;
            YB.default = este.state.YB.default;
            este._refrescarCallback(response);
        });
    },

    lanzarSuccess: function(success, response, prefix) {
        var este = this;
        switch (success.slot) {
            case "goto": {
                if (response.resul.hasOwnProperty("url")) {
                    window.location.href = response.resul.url;
                }
                else {
                    if (!this.state.YB[this.props.PREFIX].DATA.pk) {
                        var urpk = URLResolver.getRESTQuery(prefix, null, "list");
                        helpers.requestGET(urpk, {"p_l": 1}, function(response) {
                            var url = URLResolver.getRESTAccion(este.props.PREFIX, response.data[0].pk, success.receiver);
                            helpers.requestAccion(url, {}, "PUT", function(response) {
                                window.location.href = response.resul;
                            }, este._mierror);
                            //este.lanzarAccion(layout, prefix, layoutAct, response.data[0].pk, data);
                        }, este._mierror);
                    }
                    var url = URLResolver.getRESTAccion(this.props.PREFIX, this.state.YB[this.props.PREFIX].DATA.pk, success.receiver);
                    helpers.requestAccion(url, {}, "PUT", function(response) {
                        window.location.href = response.resul;
                    }, este._mierror);
                }
                break;
            }
            case "refrescar": {
                var receiver = null;
                if (success.hasOwnProperty("receiver")) {
                    receiver = success.receiver;
                }
                este._onRefrescar(success, response, prefix, receiver, null);
                break;
            }
            case "recargar": {
                // var url = URLResolver.getTemplate(this.props.APLIC, this.props.PREFIX, this.state.YB[this.props.PREFIX].DATA.pk);
                var url = window.location.href;
                window.location.href = url;
                break;
            }
            case "redirect": {
                var url = URLResolver.getTemplate(this.props.APLIC, prefix, response.data[prefix].pk);
                window.location.href = url;
                break;
            }
            case "index": {
                var url = URLResolver.getRaiz();
                window.location.href = url;
                break;
            }
            case "return": {
                var lastHist = this.props.HISTORY;
                var url = URLResolver.getTemplate(lastHist.aplic, lastHist.prefix, lastHist.pk, lastHist.template);
                window.location.href = url;
                break;
            }
            case "blur": {
                var fdbFocus = success.receiver;
                try {
                    let domFocus = document.getElementById(fdbFocus);
                    domFocus.blur();
                }
                catch(e) {
                    return;
                }
                break;
            }
            case "focus": {
                var fdbFocus = success.receiver;
                try {
                    let domFocus = document.getElementById(fdbFocus);
                    domFocus.focus();
                }
                catch(e) {
                    console.log("error focus");
                    return;
                }
                break;
            }
            case "select": {
                var fdbFocus = success.receiver;
                try {
                    let domFocus = document.getElementById(fdbFocus);
                    domFocus.select();
                }
                catch(e) {
                    console.log("error select")
                    return;
                }
                break;
            }
            case "toast": {
                var toastSet = {};
                toastSet["tipo"] = success.hasOwnProperty("tipo") ? success.tipo : "warning";
                toastSet["titulo"] = success.hasOwnProperty("titulo") ? success.titulo : "";
                toastSet["mensaje"] = success.hasOwnProperty("mensaje") ? success.mensaje : "Error";
                this.invocaToast(toastSet);
                break;
            }
            case "vibrate": {
                navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
                if (navigator.vibrate) {
                    navigator.vibrate(1000);
                }
                break;
            }
            case "errorSound": {
                var errorSound= new Audio(this.props.STATICURL + "/dist/sounds/error.wav");
                errorSound.load();
                errorSound.play();
                break;
            }
            case "successSound": {
                var successSound= new Audio(this.props.STATICURL + "/dist/sounds/success.wav");
                successSound.load();
                successSound.play();
                break;
            }
            case "onfilter": {
                var filtro = this.state.YB[success.prefix].IDENT["FILTER"];
                prefix = this.props.PREFIX;
                if (success.hasOwnProperty("type") && success.type == "query") {
                    filtro["qr_t"] = success.prefix;
                    if ("pk" in this.state.YB[this.props.PREFIX].DATA) {
                        filtro["qr_pk"] = this.state.YB[this.props.PREFIX].DATA.pk;
                    }
                }
                if (success.hasOwnProperty("filter")) {
                    for (var f in success.filter) {
                        if (this.state.YB["otros"][success.filter[f]]) {
                            filtro["s_" + f + "__exact"] = String(this.state.YB["otros"][success.filter[f]]);
                        }
                        else {
                            if (filtro.hasOwnProperty("s_" + f + "__exact")) {
                                delete filtro["s_" + f + "__exact"];
                            }
                        }
                    }
                }

                var URL = URLResolver.getRESTQuery(prefix, "list");
                var misuccess;

                misuccess = function(response) {
                    este._onYBChange(success.prefix, response);
                };
                if (success.hasOwnProperty("type") && success.type == "query") {
                    helpers.requestAccion(URL, filtro, "POST", misuccess);
                }
                else {
                    helpers.requestGET(URL, filtro, misuccess);
                }
                break;
            }
            default: {
                break;
            }
        }
    },

    autoFocus: function() {
        let fdbFocus = this.props.FOCUS;
        if (!fdbFocus || fdbFocus == "") {
            return;
        }
        try {
            let domFocus = document.getElementById(fdbFocus);
            domFocus.focus();
        }
        catch(e) {
            return;
        }
    },

    invocaToast: function(toastSet) {
        $.toaster({"priority": toastSet.tipo, "title": toastSet.titulo, "message": toastSet.mensaje});
    },

    _handleEscKey: function(event) {
        if (event.keyCode == 27) {
            this._cierraModal();
        }
    },

    _newContainerCallBack: function(response, url) {
        var newContainer = _.extend(this.state.YBList, {});
        newContainer.push(response.data);
        var newMetaList = _.extend(this.state.YBListMeta, {});
        newMetaList.push({"LAYOUT": response.layout, "APLIC": response.aplic, "PREFIX": response.prefix, "STATICURL": url})
        this.setState({"YBList": newContainer, "YBListMeta": newMetaList, "YB": response.data});
    },

    _invocaModalContainer: function(layoutAct, layout, pk, prefix, data) {
        var este = this;
        var url = URLResolver.getTemplate(this.props.APLIC, prefix, "newRecord");
        var params = {};
        helpers.requestAccion(url, params, "PUT", function(response) {
            console.log(response)
            este._newContainerCallBack(response, url);
        });
    },

    _invocaModalNoSave: function(schema, data, accion, layout, datalayout) {
        if (layout == "otros") {
            datalayout = {"prefix": "otros", "componente": "YBForm", "send": false};
        }
        else if (typeof datalayout != "object") {
            this._dameObjetoLayout(datalayout);
        }

        var modalList = this.state.modalList;
        var modalName = "modal_" + accion.key;
        var objAtts = {
            "DATA": this.state.YB["otros"],
            "SCHEMA": schema,
            "LAYOUT": datalayout,
            "APLIC": this.props.APLIC,
            "drawIf": this.state.YB["drawIf"],
            "prefix": "otros",
            "multiForm": true,
            "focus": this.props.FOCUS,
            "name": modalName,
            "bufferChange": false,
            "labels": null,
            "modal": true
        };
        var objFuncs = {
            "onSubmit": "update",
            "lanzarAccion": this.lanzarAccion,
            "onBufferChange": this._onClientBufferChange,
            "onChange": this._onChange,
            "addPersistentData": this._addPersistentData
        };

        var form = YBForm.generaYBForm(objAtts, objFuncs);

        modalList.push(
            <div key={ modalName } className="modalContent modalScrool">
                <div className="modalBody">
                    <div className="modalHeader">
                        <i className="material-icons closeM" onClick={ this._cierraModal }>close</i>
                    </div>
                    <div className="modalCuerpo">
                        { form }
                    </div>
                    <div className="modalPie">
                    </div>
                </div>
            </div>
        );
        $(".modalContent, .modalList, .fondogris").toggleClass("active");
        document.addEventListener("keydown", this._handleEscKey, false);
        this.setState({"modalList": modalList});
    },

    _invocaAccionModal: function(schema, data, accion, layout, datalayout) {
        if (layout == "otros") {
            datalayout = {"prefix": "otros", "componente": "YBForm"};
        }
        else if (typeof datalayout != "object") {
            this._dameObjetoLayout(datalayout);
        }

        var modalList = this.state.modalList;
        var modalName = "modal_" + accion.key;
        var objAtts = {
            "DATA": this.state.YB["otros"],
            "SCHEMA": schema,
            "LAYOUT": datalayout,
            "APLIC": this.props.APLIC,
            "drawIf": this.state.YB["drawIf"],
            "prefix": "otros",
            "multiForm": false,
            "focus": this.props.FOCUS,
            "name": modalName,
            "bufferChange": false,
            "labels": null,
            "modal": true
        };
        var objFuncs = {
            "onSubmit": accion,
            "lanzarAccion": this.lanzarAccion,
            "onBufferChange": this._onClientBufferChange,
            "onChange": this._onChange,
            "addPersistentData": this._addPersistentData
        };

        var form = YBForm.generaYBForm(objAtts, objFuncs);

        modalList.push(
            <div key={ modalName } className="modalContent modalScrool">
                <div className="modalBody">
                    <div className="modalHeader">
                        <i className="material-icons closeM" onClick={ this._cierraModal }>close</i>
                    </div>
                    <div className="modalCuerpo">
                        { form }
                    </div>
                    <div className="modalPie">
                    </div>
                </div>
            </div>
        );
        $(".modalContent, .modalList, .fondogris").toggleClass("active");
        document.addEventListener("keydown", this._handleEscKey, false);
        this.setState({"modalList": modalList});
    },

    _invocaConfirmacionModal: function(accion, layout, prefix, layoutAct, pk, data) {
        var modalList = this.state.modalList;
        var onconfirm = this._lanzaLegacyAction.bind(this, accion, layout, prefix, layoutAct, pk, data);
        if (accion.hasOwnProperty("onconfirm") && accion.onconfirm != "lanzaraccion") {
            onconfirm = this._onConfirmacion.bind(this, accion, layout, prefix, layoutAct, pk, data);
        }
        var onCancelModal = this._cierraModal;
        if (accion.hasOwnProperty("oncancel") && accion.oncancel == "lanzaraccion") {
            onCancelModal = this._onCancelModal.bind(this, accion, layout, prefix, layoutAct, pk, data);
        }
        var buttons = [];
        if (accion.hasOwnProperty("close")){
            buttons.push(<a key="onCancelConfirm" href="javascript:void(0)" className="btn btn-primary btn-submit modal-btn" onClick={ onCancelModal }>
                                Cerrar
                            </a>);
        } else {
            buttons.push(<a key="onConfirmConfirm" href="javascript:void(0)" className="btn btn-primary btn-submit modal-btn" onClick={ onconfirm }>
                                Confirmar
                            </a>);
            buttons.push(<a key="onCancelConfirm" href="javascript:void(0)" className="btn btn-primary btn-submit modal-btn" onClick={ onCancelModal }>
                                Cancelar
                            </a>);
        }
        modalList.push(
            <div key="b" className="modalContent modalScrool">
                <div className="modalBody">
                    <div className="modalCuerpo" dangerouslySetInnerHTML={{__html: accion.msg}}>

                    </div>
                    <div className="modalPie">
                        { buttons }
                    </div>
                </div>
            </div>
        );
        $(".modalContent, .modalList, .fondogris").toggleClass("active");
        document.addEventListener("keydown", this._handleEscKey, false);
        this.setState({"modalList": modalList});
    },

    _onCancelModal: function(accion, layout, prefix, layoutAct, pk, data) {
        data[prefix]["confirmacion"] = false;
        this._lanzaLegacyAction(accion, layout, prefix, layoutAct, pk, data);
        this._cierraModal();
    },

    _onConfirmacion: function(accion, layout, prefix, layoutAct, pk, data) {
        if(accion.onconfirm == "changedata") {
            console.log("no entra por aqui??")
            var YBdata = this.state.YB;
            YBdata[prefix].DATA = data[prefix];
            this.setState({"YB": YBdata});
        }
        console.log(accion, layout, prefix, layoutAct, pk, data);
        this._cierraModal();
    },

    _invocaConfirmacionDeleteModal: function(modelo, prefix, pk, prefixDelete) {
        var modalList = this.state.modalList;
        modalList.push(
            <div key="b" className="modalContent modalScrool">
                <div className="modalBody">
                    <div className="modalCuerpo">
                        La l&iacute;nea ser&aacute; eliminada
                    </div>
                    <div className="modalPie">
                        <a href="javascript:void(0)" className="btn btn-primary btn-submit modal-btn" onClick={ this._onDelete.bind(this, prefix, pk, prefixDelete) }>
                            Confirmar
                        </a>
                        <a href="javascript:void(0)" className="btn btn-primary btn-submit modal-btn" onClick={ this._cierraModal }>
                            Cancelar
                        </a>
                    </div>
                </div>
            </div>
        );
        $(".modalContent, .modalList, .fondogris").toggleClass("active");
        document.addEventListener("keydown", this._handleEscKey, false);
        this.setState({"modalList": modalList});
    },

    _cierraModal: function() {
        var modalList = this.state.modalList;
        var data = this.state.YB;
        var antDrawIf = data["drawIf"];

        if ($(".modalContent").length > 0) {
            var modal = undefined;
            if ($(".modalContent").length > 1) {
                modal = modalList.pop();
            }
            else {
                modal = modalList.pop();
                $(".modalContent,.modalList,.fondogris").toggleClass("active");
                document.removeEventListener("keydown", this._handleEscKey, false);
            }
            data["otros"] = _.extend({}, this.state.YB["persistente"]);
            data["otros"]["usuario"] = this.props.USER;
            if (antDrawIf && modal.key in antDrawIf) {
                delete antDrawIf[modal.key];
            }
            data["drawIf"] = antDrawIf;
            this.setState({"modalList": modalList, "YB": data});
        }
    },

    _cierraModalList: function() {
        var modalList = this.state.YBList;
        var modalMeta = this.state.YBListMeta
        var data = this.state.YB;

        if (modalList.length > 0) {
            var modal = undefined;
            if (modalList.length > 1) {
                modal = modalList.pop();
                modalMeta.pop();
            }
            else {
                modal = modalList.pop();
                modalMeta.pop();
                $(".modalContent,.modalList,.fondogris").toggleClass("active");
                document.removeEventListener("keydown", this._handleEscKey, false);
            }
            this.setState({"YBList": modalList, "YB": modalList[this.state.YBList.length - 1], "YBListMeta": modalMeta});
        }
    },

    _dameObjetoLayout: function(layoutKey) {
        return this.props.LAYOUT.layout[layoutKey];
    },

    _getModalContainerList: function() {
        var componentes = [];
        for(var i = 0, l = this.state.YBList.length; i < l; i++) {
            var YB = this.state.YBList[i];
            if (i == this.state.YBList.length -1) {
                YB = this.state.YB;
            }
            var objAtts = {
                "name": "parentGroupBox",
                "clases": "parentgroupbox",
                "staticurl": this.state.YBListMeta[i].STATICURL,
                "data": YB,
                "layout": this.state.YBListMeta[i].LAYOUT.layout,
                "aplic": this.state.YBListMeta[i].APLIC,
                "prefix": this.state.YBListMeta[i].PREFIX,
                "acciones": this.state.YBListMeta[i].LAYOUT.acciones,
                "focus": this.props.FOCUS,
                "schema": this.props.SCHEMA
            };
            var objFuncs = {
                "lanzarAccion": this.lanzarAccion,
                "onBufferChange": this._onBufferChange,
                "onClientBufferChange": this._onClientBufferChange,
                "onChange": this._onChange,
                "onFieldChange": this._onFieldChange,
                "newRecord": this._newRecord,
                "onDataChange": this._onDataChange,
                "addPersistentData": this._addPersistentData,
                "onYBChange": this._onYBChange,
                "onActiveGroupBox": this._onActiveGroupBox
            };
            if (i > 0) {
                var modalName = this.state.YBListMeta[i].PREFIX + "__Modal";
                componentes.push(<div key={ modalName } className="modalContent modalScrool">
                <div className="modalBody">
                        <div className="modalHeader">
                            <i className="material-icons closeM" onClick={ this._cierraModalList }>close</i>
                        </div>
                        <div className="modalCuerpo">
                            { YBGroupBox.generaYBGroupBox(objAtts, objFuncs) }
                        </div>
                        <div className="modalPie">
                        </div>
                    </div>
                </div>)
            } else {
                objAtts["isParent"] = true;
                componentes.push(YBGroupBox.generaYBGroupBox(objAtts, objFuncs));
            }
        }
        return componentes;
    },

    _onWebSocketMessage: function(e) {
        var este = this;
        var content = JSON.parse(e.data);
        if (content.hasOwnProperty("slot")) {
            if (content["slot"] == "refrescar") {
                var success = {};
                success["vacio"] = true;
                var name = null;
                if (this.state.YB.hasOwnProperty(content["receiver"]) && content["receiver"]) {
                    name = content["receiver"];
                }
                este._onRefrescar(success, null, este.props.PREFIX, name, window.location.href);
            }
        }
    },

    componentWillMount: function() {
        if (this.props.YB.hasOwnProperty("ws")) {
            for (var s in this.props.YB["ws"]) {
                var este = this;
                var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
                var socket = new WebSocket(ws_scheme + "://" + window.location.host + "/" + this.props.YB["ws"][s] + "/");
                socket.onmessage = this._onWebSocketMessage;
                if (socket.readyState == WebSocket.OPEN) {
                    socket.onopen();
                }
                this.setState({"websocket": socket});
            }
        }
    },

    render: function() {
        var este = this;
        console.log(this.state.YB);
        //console.log(this.state.YBList);

        var titulo = this.state.YBList[0][this.props.PREFIX].META.verbose_name;
        if (this.props.TITLE) {
            titulo =  this.props.TITLE;
        }
        var objAtts = {
            "user": this.props.USER,
            "usergroups": null,
            "superuser": this.props.superuser,
            "aplic": this.props.APLIC,
            "titulo": titulo,
            "prefix": this.props.PREFIX,
            "staticurl": this.props.STATICURL,
            "rootUrl": this.props.ROOTURL,
            "aplicLabel": this.props.APLICLABEL,
            "menu": this.props.MENU
        };
        var objFuncs = {};
        var navbar = null;
        if (this.state.YB["drawIf"].hasOwnProperty("navbar") && !this.state.YB["drawIf"]["navbar"]) {
            navbar = null;
        }
        else {
            navbar = YBNavBar.generaYBNavBar(objAtts, objFuncs);
        }

        var error = null;
        if (this.props.MSG) {
            error = this.props.MSG
        }

        var aux = this.state.YB;
        aux.otros["usuario"] = this.props.USER;

/*        var componentes = [];
        var objAtts = {
            "name": "parentGroupBox",
            "clases": "parentgroupbox",
            "staticurl": this.props.STATICURL,
            "data": this.state.YB,
            "layout": this.props.LAYOUT,
            "aplic": this.props.APLIC,
            "prefix": this.props.PREFIX,
            "acciones": this.props.ACCIONES,
            "focus": this.props.FOCUS,
            "schema": this.props.SCHEMA
        };
        var objFuncs = {
            "lanzarAccion": this.lanzarAccion,
            "onBufferChange": this._onBufferChange,
            "onClientBufferChange": this._onClientBufferChange,
            "onChange": this._onChange,
            "onFieldChange": this._onFieldChange,
            "newRecord": this._newRecord,
            "onDataChange": this._onDataChange,
            "addPersistentData": this._addPersistentData,
            "onYBChange": this._onYBChange,
            "onActiveGroupBox": this._onActiveGroupBox
        };
        componentes = YBGroupBox.generaYBGroupBox(objAtts, objFuncs);*/
        var modalContainerList = [];
        modalContainerList = this._getModalContainerList();
        var componentes = modalContainerList.shift();
        if(modalContainerList.length >= 1){
            $(".modalContent, .modalList, .fondogris").toggleClass("active");
            document.addEventListener("keydown", this._handleEscKey, false);
        }


        var objAttsC = {
            "user": this.props.USER,
            "chatObj": this.state.YB.chat
        };
        var objFuncsC = {
            "invocaToast": this.invocaToast,
            "onChatChange": this._onChatChange
        };

        var chat = null;
        if (this.state.YB.chat) {
            chat = YBChat.generaYBChat(objAttsC, objFuncsC);
        }

        return  <div id="parent-container">
                    <div className="loadProgress" style={{"display": "none"}}></div>
                        { navbar }
                    <div id="YBError">
                        { error }
                    </div>
                    <MuiThemeProvider muiTheme={ getMuiTheme() }>
                        <div id="modal-container">
                            <div className="fondogris"></div>
                            <div className="modalList">
                                { this.state.modalList }
                                { modalContainerList }
                            </div>
                        </div>
                    </MuiThemeProvider>

                    <MuiThemeProvider muiTheme={getMuiTheme()}>
                        <div id="componentContainer">
                            { componentes }
                        </div>
                    </MuiThemeProvider>
                    <MuiThemeProvider muiTheme={ getMuiTheme() }>
                        <div id="YBChat">
                            { chat }
                        </div>
                    </MuiThemeProvider>
                </div>;
    }
});

module.exports.generaYBContainer = function(domObj, objAtts, objFuncs)
{
    var datas = {};
    // _.each(sessionStorage, function(obj, key) {
    //     data["otros"][sessionStorage.key(key)] = sessionStorage.getItem(sessionStorage.key(key));
    //     if(sessionStorage.key(key) in data[prefix].DATA && data[prefix].DATA[sessionStorage.key(key)] == null)
    //         data[prefix].DATA[sessionStorage.key(key)] = sessionStorage.getItem(sessionStorage.key(key));
    // });

    var title = objAtts.layout.title || "";
    return ReactDOM.render(
        <YBContainer
            key = "AQContainer"
            YB = { objAtts.data }
            TITLE = { title }
            APLIC = { objAtts.aplic }
            APLICLABEL = { objAtts.aplicLabel }
            LAYOUT = { objAtts.layout }
            MENU = { objAtts.menu }
            ACCIONES = { objAtts.layout.acciones }
            SCHEMA = { objAtts.layout.schema }
            FOCUS = { objAtts.layout.focus }
            PREFIX = { objAtts.prefix }
            USER = { objAtts.user }
            GROUP = { objAtts.usergroups }
            ROOTURL = { objAtts.rootUrl}
            STATICURL = { objAtts.staticUrl }
            MSG = { objAtts.msg }
            HISTORY = { objAtts.history }
            superuser = { objAtts.superuser }
            CUSTOM = { objAtts.custom }/>
        , domObj
    );
};
