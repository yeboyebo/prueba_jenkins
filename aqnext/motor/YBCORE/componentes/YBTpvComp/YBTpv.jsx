var React = require("react");
var _ = require("underscore");
var YBTpvDashBoard = require("./YBTpvDashBoardComp/YBTpvDashBoard.jsx");
var YBTpvCommand = require("./YBTpvCommandComp/YBTpvCommand.jsx");
var YBTpvPayments = require("./YBTpvPaymentsComp/YBTpvPayments.jsx");
var YBTpvNewPayment = require("./YBTpvPaymentsComp/YBTpvNewPayment.jsx");
var YBTpvModal = require("./YBTpvModalComp/YBTpvModal.jsx");

var noTable = {
    "uri": false,
    "desc": "Sin mesa",
    "key": false
};

var noCommand = {
    "idComanda": false,
    "discount": 0,
    "paid": 0,
    "total": 0,
    "customers": 0,
    "lines": {}
};

var noCurrentCommand = {
    "isSent": true,
    "lines": {}
};

var noPayment = {
    "id": false,
    "method": false,
    "methoddesc": false,
    "amount": false
};

var noCatalog = {
    "key": "catalogo",
    "desc": "TPV",
    "uri": "/",
    "items": []
};

// Configurar en server
var noOrderOptions = [
    {"value": "bebidas", "alias": "Bebidas"},
    {"value": "entrantes", "alias": "Entrantes"},
    {"value": "principales", "alias": "Principales"},
    {"value": "postres", "alias": "Postres"},
    {"value": "cafes", "alias": "Cafés"}
];

var defaultAjaxObj = {
    "dataType": "json",
    "contentType": "application/json",
    "method": "PUT",
    "processData": false,
    "async": false
};

var YBTpvBase = {

    getInitialState: function() {
        let command = localStorage.getItem("comanda");
        let currentcommand = localStorage.getItem("comandaActual");
        let tables = localStorage.getItem("mesas");
        let table = localStorage.getItem("mesaActual");
        let catalog = localStorage.getItem("catalogo");
        let payments = localStorage.getItem("pagos");

        return {
            "history": ["/"],
            "fullcat": catalog ? JSON.parse(catalog) : _.extend({}, noCatalog),
            "currentcat": catalog ? JSON.parse(catalog) : _.extend({}, noCatalog),
            "tables": tables ? JSON.parse(tables) : [],
            "currenttable": table ? JSON.parse(table) : _.extend({}, noTable),
            "command": command ? JSON.parse(command) : _.extend({}, noCommand),
            "currentcommand": currentcommand ? JSON.parse(currentcommand) : _.extend({}, noCurrentCommand),
            "config": {},
            "currentconfig": {},
            "screen": "tpv",
            "currentorder": false,
            "cmdedit": false,
            "modal": false,
            "newpayment": _.extend({}, noPayment),
            "payments": payments ? JSON.parse(payments) : []
        };
    },

    componentWillMount() {
        $.getJSON(this.props.staticurl + "dist/catalog.json", function(catalogo) {
            console.log(catalogo);
            localStorage.setItem("catalogo", JSON.stringify(catalogo));
        });
        $.getJSON(this.props.staticurl + "dist/tables.json", function(mesas) {
            console.log(mesas.tables);
            localStorage.setItem("mesas", JSON.stringify(mesas.tables));
        });
    },

    _getDefaultConf: function(cat) {
        let conf = {};
        if (!cat.hasOwnProperty("config")) {
            return conf;
        }
        let g, o;
        let group, option;
        for (g in cat["config"]) {
            group = cat["config"][g];
            for (o in group["options"]) {
                option = group["options"][o];
                if (option["default"] == "True") {
                    option["checked"] = "True";
                    conf[option["uri"]] = _.extend({}, option);
                }
            }
        }
        return conf;
    },

    _invokeModal: function(type, param, callback) {
        this.setState({
            "modal": {
                "type": type,
                "param": param,
                "callback": callback
            }
        });
    },

    _acceptedModal: function(value) {
        let modal = _.extend({}, this.state.modal);
        this.setState({"modal": false});
        if (modal.callback) {
            modal.callback(value);
        }
    },

    _canceledModal: function() {
        this.setState({"modal": false});
    },

    _getQty: function(key) {
        let lines = _.extend({}, this.state.currentcommand["lines"]);
        if (lines.hasOwnProperty(key)) {
            return lines[key]["qty"];
        }
        return false;
    },

    _getChecked: function(uri) {
        let conf = _.extend({}, this.state.currentconfig);
        if (conf.hasOwnProperty(uri)) {
            return conf[uri]["checked"];
        }
        return false;
    },

    _getSiblings: function(uri, parent) {
        let conf = this._getParent(parent);
        let siblings = [];

        let aPath = uri.split("/");
        aPath.pop();
        aPath.pop();
        aPath.pop();
        let uriPatt = aPath.join("/");

        for (let c in conf) {
            if (!c.startsWith(uriPatt) || c == uri) {
                continue;
            }
            siblings.push(c);
        }
        return siblings;
    },

    _getParent: function(parent) {
        return _.extend({}, parent);
    },

    _getNode: function(uri, parent) {
        parent = this._getParent(parent);
        let json = parent;
        let path = uri.split("/");
        let step = false;

        for (let p in path) {
            step = path[p];
            if (step == "" || step == undefined) {
                continue;
            }
            if (!isNaN(step)) {
                step = parseInt(step);
            }
            json = json[step];
        }

        return json;
    },

    _setTable: function(key) {
        let st = _.extend({}, this.state);

        if (key) {
            st["currenttable"] = _.extend({}, st.tables.filter((t) => {
                return t.key == key;
            })[0]);
            st["currenttable"]["uri"] += "_current";

            return $.ajax(_.extend(defaultAjaxObj, {
                "url": "/models/REST/tpv_comandas/accion/descargarcomanda",
                "data": {
                    "oParam": {
                        "table": key
                    }
                },
                "error": (xhr) => {
                    if (xhr.status == 400) {
                        console.log("err res");
                        console.log(xhr.responseText);
                    }
                },
                "success": (res) => {
                    if (res && res["resul"]) {
                        console.log(res["resul"]);
                        // return;
                        st.screen = "tpv";
                        st.history = ["/"];
                        st.config = {};
                        st.currentconfig = {};
                        st.currentorder = false;
                        st.cmdedit = false;
                        st.modal = false;
                        st.currentcommand = _.extend({}, noCurrentCommand);

                        st.command = _.extend({}, res["resul"].command);
                        st.payments = _.extend([], res["resul"].payments);
                        st.fullcat = _.extend({}, res["resul"].catalog);
                        st.currentcat = _.extend({}, res["resul"].catalog);
                        st.tables = _.extend([], res["resul"].tables);

                        if (!st.command.customers || st.command.customers == 0) {
                            let param = {
                                "name": "comensales",
                                "alias": "Comensales",
                                "value": st.command.customers
                            };
                            return this._invokeModal("numeric", param, (
                                (value) => {
                                    if (isNaN(value) || value <= 0) {
                                        return false;
                                    }
                                    st.command.customers = value;
                                    localStorage.setItem("comanda", JSON.stringify(st.command));
                                    localStorage.setItem("mesas", JSON.stringify(st.tables));
                                    localStorage.setItem("mesaActual", JSON.stringify(st.currenttable));
                                    localStorage.setItem("comandaActual", JSON.stringify(st.currentcommand));
                                    localStorage.setItem("catalogo", JSON.stringify(st.fullcat));
                                    localStorage.setItem("pagos", JSON.stringify(st.payments));
                                    return this.setState(st);
                                }
                            ));
                        }
                        else {
                            localStorage.setItem("comanda", JSON.stringify(st.command));
                            localStorage.setItem("mesas", JSON.stringify(st.tables));
                            localStorage.setItem("mesaActual", JSON.stringify(st.currenttable));
                            localStorage.setItem("comandaActual", JSON.stringify(st.currentcommand));
                            localStorage.setItem("catalogo", JSON.stringify(st.fullcat));
                            localStorage.setItem("pagos", JSON.stringify(st.payments));
                            return this.setState(st);
                        }
                    }
                }
            }));
        }
        else {
            if (!st["currentcommand"]["isSent"]) {
                $.toaster({
                    "title": "",
                    "priority": "warning",
                    "message": "Debes enviar la comanda a cocina",
                    "settings": {
                        "toaster": {
                            "class": "YBTpvToaster"
                        }
                    }
                });
                return false;
            }
            st["currenttable"] = _.extend({}, noTable);
        }

        // Actualizar command, currentcat, fullcat, tables
        // Meter todo en localStorage

        localStorage.setItem("mesaActual", JSON.stringify(st["currenttable"]));
        this.setState(st);
    },

    _addProduct: function(item, config) {
        let st = this.state;
        let lines = _.extend({}, st.currentcommand["lines"]);
        if (!lines.hasOwnProperty(item.key)) {
            lines[item.key] = _.extend({}, item);
            lines[item.key]["qty"] = 0;
            lines[item.key]["order"] = [];

            if (lines[item.key].hasOwnProperty("config")) {
                lines[item.key]["config"] = [];
            }
        }
        lines[item.key]["qty"] += 1;
        lines[item.key]["order"].push(this.state.currentorder.value);

        if (config) {
            let prodConf = _.extend({}, st.currentconfig);
            for (let i in prodConf) {
                if (prodConf[i]["config"] && ("map" in prodConf[i]["config"])) {
                    prodConf[i]["config"] = this._getDefaultConf(_.extend({}, prodConf[i]));
                }
            }
            lines[item.key]["config"].push(prodConf);
        }
        st.currentcommand["lines"] = lines;
        st.currentcommand["isSent"] = false;
        localStorage.setItem("comandaActual", JSON.stringify(st.currentcommand));
        return st.currentcommand;
    },

    _checkProduct: function(item, conftype, parent) {
        let conf = this._getParent(parent);

        if (!conf.hasOwnProperty(item.uri)) {
            conf[item.uri] = _.extend({}, item);
            conf[item.uri] = false;
        }

        let isChecked = conf[item.uri]["checked"] == "True";
        let siblings = _.extend([], this._getSiblings(item.uri, parent));

        if (conftype == "unique" && isChecked) {
            return conf;
        }
        else if (conftype == "unique" && !isChecked && siblings.length) {
            for (let s in siblings) {
                delete conf[siblings[s]];
            }
        }
        if (conf[item.uri] && conf[item.uri]["checked"] == "True") {
            if (conftype == "multi" && conf[item.uri]["default"] == "True") {
                conf[item.uri]["checked"] = "False";
            }
            else {
                delete conf[item.uri];
            }
        }
        else {
            conf[item.uri] = _.extend({}, item);
            conf[item.uri]["checked"] = "True";
        }
        return conf;
    },

    _appendProduct: function(pk, config) {
        let st = _.extend({}, this.state);
        let lines = _.extend({}, st.currentcommand["lines"]);
        let ord = lines[pk]["order"];

        lines[pk]["qty"] += 1;

        if (config) {
            let idx = lines[pk]["config"].lastIndexOf(config);
            if (idx != -1) {
                ord.push(ord[idx]);
            }
            else {
                ord.push(ord[ord.length - 1]);
            }

            lines[pk]["config"].push(config);
        }
        else {
            ord.push(ord[ord.length - 1]);
        }
        st.currentcommand["lines"] = lines;
        st.currentcommand["isSent"] = false;
        localStorage.setItem("comandaActual", JSON.stringify(this.state.currentcommand));
        return this.setState(st);
    },

    _sliceProduct: function(pk, config) {
        let st = _.extend({}, this.state);
        let lines = _.extend({}, st.currentcommand["lines"]);

        lines[pk]["qty"] -= 1;

        if (config) {
            let idx = lines[pk]["config"].lastIndexOf(config);
            if (idx != -1) {
                lines[pk]["config"].splice(idx, 1);
                lines[pk]["order"].splice(idx, 1);
            }
        }
        else {
            lines[pk]["order"].pop();
        }

        st.currentcommand["isSent"] = false;
        if (lines[pk]["qty"] == 0) {
            delete lines[pk];
            if (!Object.keys(lines).length) {
                st.currentcommand["isSent"] = true;
            }
        }
        st.currentcommand["lines"] = lines;
        localStorage.setItem("comandaActual", JSON.stringify(this.state.currentcommand));
        return this.setState(st);
    },

    _editProduct: function(pk, config, nconfig) {
        let st = _.extend({}, this.state);
        let lines = _.extend({}, st.currentcommand["lines"]);

        if (config && nconfig) {
            for (let i in lines[pk]["config"]) {
                if (this._deepEqual(lines[pk]["config"][i], config)) {
                    lines[pk]["config"][i] = nconfig;
                }
            }
        }

        st["cmdedit"] = false;
        st["screen"] = "command";
        st["history"] = ["/", "command"];
        st.currentcommand["lines"] = lines;
        st.currentcommand["isSent"] = false;
        localStorage.setItem("comandaActual", JSON.stringify(this.state.currentcommand));
        return this.setState(st);
    },

    _editChildProduct: function(pk, child, config, nchildconfig) {
        let st = _.extend({}, this.state);

        if (config) {
            config = this._checkProduct(_.extend({}, child), "unique", config);
            config[child.uri]["config"] = _.extend({}, nchildconfig);
        }

        delete st["cmdedit"]["child"];
        this._editConfig(pk, config, true);
    },

    _editConfig: function(pk, config, fromChild) {
        let st = _.extend({}, this.state);
        let lines = _.extend({}, st.currentcommand["lines"]);

        if (!st["cmdedit"]) {
            st["cmdedit"] = {};
        }
        st["cmdedit"].pk = pk;
        st["cmdedit"].config = config;

        if (!fromChild) {
            st["cmdedit"].antconfig = config;
        }
        st["screen"] = "tpv";
        st["history"].push(lines[pk].uri);
        st["currentcat"] = _.extend({}, this._getNode(lines[pk].uri, st.fullcat));
        st["config"] = _.extend({}, config);
        st["currentconfig"] = _.extend({}, config);

        return this.setState(st);
    },

    _slicePayment: function(pk, id) {
        let st = this.state;
        let payments = st.payments;

        for (let p in payments) {
            if (payments[p]["id"] == id) {
                return $.ajax(_.extend(defaultAjaxObj, {
                    "url": "/models/REST/tpv_comandas/accion/eliminarpagotpvweb",
                    "data": {
                        "oParam": {
                            "paymentid": id,
                            "command": st.command
                        }
                    },
                    "error": (xhr) => {
                        if (xhr.status == 400) {
                            console.log("err res");
                            console.log(xhr.responseText);
                        }
                    },
                    "success": (res) => {
                        if (res && res["resul"]) {
                            st.command.paid -= payments[p]["amount"];
                            payments.splice(p, 1);

                            localStorage.setItem("pagos", JSON.stringify(st.payments));
                            localStorage.setItem("comanda", JSON.stringify(st.command));
                            return this.setState(st);
                        }
                    }
                }));
            }
        }
    },

    _confirmCommand: function() {
        let st = this.state;

        return $.ajax(_.extend(defaultAjaxObj, {
            "url": "/models/REST/tpv_comandas/accion/crearcomandatpvweb",
            "data": {
                "oParam": {
                    "command": st.command,
                    "currentcommand": st.currentcommand,
                    "table": st.currenttable,
                    "catalog": st.fullcat
                }
            },
            "error": (xhr) => {
                if (xhr.status == 400) {
                    console.log("err res");
                    console.log(xhr.responseText);
                }
            },
            "success": (res) => {
                if (res && res["resul"]) {
                    st.screen = "tpv";
                    st.history = ["/"];
                    st.currentorder = false;
                    st.currenttable = _.extend({}, noTable);
                    st.currentcat = _.extend({}, st.fullcat);
                    st.command = _.extend({}, noCommand);
                    st.currentcommand = _.extend({}, noCurrentCommand);
                    st.config = {};
                    st.currentconfig = {};
                    st.currentorder = false;
                    st.cmdedit = false;
                    st.modal = false;
                    localStorage.setItem("mesaActual", JSON.stringify(st.currenttable));
                    localStorage.setItem("comanda", JSON.stringify(st.command));
                    localStorage.setItem("comandaActual", JSON.stringify(st.currentcommand));
                    return this.setState(st);
                }
            }
        }));
    },

    _hasNext: function(item) {
        if (item.hasOwnProperty("items")) {
            return true;
        }
        if (!item.hasOwnProperty("config")) {
            return false;
        }
        for (let c in item["config"]) {
            if (item["config"][c].required == "False") {
                return true;
            }
        }
        return false;
    },

    _deepEqual: function(obj1, obj2) {
        let keys1 = Object.keys(obj1).sort();
        let keys2 = Object.keys(obj2).sort();

        if (keys1.length != keys2.length) {
            return false;
        }
        for (let k in keys1) {
            if (!(keys1[k] in obj2)) {
                return false;
            }
            if (typeof(obj1[keys1[k]]) === "object" || Array.isArray(obj1[keys1[k]])) {
                if (!this._deepEqual(obj1[keys1[k]], obj2[keys1[k]])) {
                    return false;
                }
            }
            else {
                if (obj1[keys1[k]] != obj2[keys1[k]]) {
                    return false;
                }
            }
        }
        return true;
    },

    _onItemClick: function(uri, params) {
        let st = _.extend({}, this.state);

        if (!uri) {
            return false;
        }

        let is_discount = uri.startsWith("discount") ? true : false;
        let is_message = uri.startsWith("message") ? true : false;
        let is_order = uri.startsWith("order") ? true : false;
        let is_back = uri.startsWith("back") ? true : false;
        let is_confirm = uri.startsWith("confirm") ? true : false;
        let is_payments = uri.startsWith("payments") ? true : false;
        let is_newpayment = uri.endsWith("newpayment") ? true : false;
        let is_table = uri.startsWith("table") ? true : false;
        let is_command = uri.endsWith("command") ? true : false;

        if (is_newpayment) {
            if (is_back) {
                st.history.pop();
                st.screen = "payments";
                return this.setState(st);
            }
            else if (is_confirm) {
                // Configurar en server
                let methods = {
                    "TARJ": "Tarjeta",
                    "CONT": "Efectivo",
                    "CHEQ": "Cheque Restaurant"
                };
                let objPago = {
                    "method": params.method,
                    "methoddesc": methods[params.method],
                    "amount": params.value
                }

                return $.ajax(_.extend(defaultAjaxObj, {
                    "url": "/models/REST/tpv_comandas/accion/crearpagotpvweb",
                    "data": {
                        "oParam": {
                            "payment": objPago,
                            "command": st.command
                        }
                    },
                    "error": (xhr) => {
                        if (xhr.status == 400) {
                            console.log("err res");
                            console.log(xhr.responseText);
                        }
                    },
                    "success": (res) => {
                        if (res && res["resul"]) {
                            objPago["id"] = res["resul"]["idPago"]
                            st.payments.push(objPago);
                            st.history.pop();
                            st.screen = "payments";
                            st.command.paid += params.value;

                            localStorage.setItem("pagos", JSON.stringify(st.payments));
                            localStorage.setItem("comanda", JSON.stringify(st.command));
                            return this.setState(st);
                        }
                    }
                }));
            }
            else {
                // Configurar en server
                let param = {
                    "name": "formapago",
                    "alias": "Método de pago",
                    "value": "TARJ",
                    "options": [
                        {"value": "TARJ", "alias": "Tarjeta"},
                        {"value": "CONT", "alias": "Efectivo"},
                        {"value": "CHEQ", "alias": "Cheque Restaurant"}
                    ]
                };
                return this._invokeModal("selection", param, (
                    (formapago) => {
                        st.newpayment.method = formapago;

                        // if (formapago != "CHEQ") {
                        //     let param = {
                        //         "name": "apagar",
                        //         "alias": "A pagar",
                        //         "value": "pending",
                        //         "options": [
                        //             {"value": "pending", "alias": "Pendiente"},
                        //             {"value": "pair", "alias": "Por pareja"},
                        //             {"value": "customer", "alias": "Por comensal"}
                        //         ]
                        //     };
                        //     return this._invokeModal("selection", param, (
                        //         (apagar) => {
                        //             st.history.push("newpayment");
                        //             st.screen = "newpayment";
                        //             st.newpayment.amount = params["newpayment"][apagar];
                        //             return this.setState(st);
                        //         }
                        //     ));
                        // }
                        // else {
                        //     st.history.push("newpayment");
                        //     st.screen = "newpayment";
                        //     st.newpayment.amount = params["newpayment"]["pending"];
                        //     return this.setState(st);
                        // }
                        st.history.push("newpayment");
                        st.screen = "newpayment";
                        st.newpayment.amount = params["newpayment"]["pending"];
                        return this.setState(st);
                    }
                ));
            }
        }
        if (is_discount) {
            let param = {
                "name": "discount",
                "alias": "Descuento",
                "value": st.command.discount
            };
            return this._invokeModal("numeric", param, (
                (value) => {
                    if (value >= 0 && value <= 100) {
                        return $.ajax(_.extend(defaultAjaxObj, {
                            "url": "/models/REST/tpv_comandas/accion/actualizarDtoTpvWeb",
                            "data": {
                                "oParam": {
                                    "idComanda": st.command.idComanda,
                                    "discount": value
                                }
                            },
                            "error": (xhr) => {
                                if (xhr.status == 400) {
                                    console.log("err res");
                                    console.log(xhr.responseText);
                                }
                            },
                            "success": (res) => {
                                if (res && res["resul"]) {
                                    st.command.discount = value;
                                    st.command.total = res["resul"]["total"];
                                    localStorage.setItem("comanda", JSON.stringify(st.command));
                                    return this.setState({"command": st.command});
                                }
                            }
                        }));
                    }
                }
            ));
        }
        if (is_message) {
            // tmp
            let param = {
                "name": "message",
                "alias": "Mensaje",
                "value": false,
                "options": [
                    {"value": "juan", "alias": "Juan"},
                    {"value": "mateo", "alias": "Mateo"},
                    {"value": "lucas", "alias": "Lucas"},
                    {"value": "marcos", "alias": "Marcos"}
                ]
            };
            return this._invokeModal("selection", param, (
                (value) => {
                    console.log(value);
                }
            ));
        }
        if (is_order) {
            let param = {
                "name": "order",
                "alias": "Orden",
                "value": this.state.currentorder ? this.state.currentorder.value : "bebidas",
                "options": _.extend([], noOrderOptions)
            };
            return this._invokeModal("selection", param, (
                (value) => {
                    return this.setState({"currentorder": noOrderOptions.filter((o) => { return o.value == value; })[0]});
                }
            ));
        }
        if (is_table) {
            if (uri.endsWith("current")) {
                return this._setTable(false);
            }
            return this._setTable(uri);
        }
        if (is_payments) {
            if (is_back) {
                st["screen"] = "tpv";
                st["history"] = ["/"];
                st["currentcat"] = _.extend({}, this._getNode("/", st.fullcat));
            }
            else {
                if (!st["currentcommand"]["isSent"]) {
                    $.toaster({
                        "title": "",
                        "priority": "warning",
                        "message": "Debes enviar la comanda a cocina",
                        "settings": {
                            "toaster": {
                                "class": "YBTpvToaster"
                            }
                        }
                    });
                    return false;
                }
                st["history"].push("payments");
                st["screen"] = "payments";
            }
            return this.setState(st);
        }
        if (is_command) {
            if (is_back) {
                st["screen"] = "tpv";
                st["history"] = ["/"];
                st["currentcat"] = _.extend({}, this._getNode("/", st.fullcat));
                st["cmdedit"] = false;
            }
            else if (is_confirm) {
                return this._confirmCommand();
            }
            else {
                st["history"].push("command");
                st["screen"] = "command";
            }
            return this.setState(st);
        }
        if (is_back) {
            st["history"].pop();
            let nextHst = st["history"][st["history"].length - 1];
            if (nextHst == "command") {
                st["screen"] = "command";
            }
            else {
                st["currentcat"] = _.extend({}, this._getNode(nextHst, st.fullcat));
            }
            return this.setState(st);
        }
        if (is_confirm) {
            if (st["cmdedit"]) {
                if (params["confmenu"] == "True") {
                    return this._editChildProduct(st["cmdedit"].pk, st["cmdedit"].child, st["config"], _.extend({}, st["currentconfig"]));
                }
                else {
                    return this._editProduct(st["cmdedit"].pk, st["cmdedit"].antconfig, _.extend({}, st["currentconfig"]));
                }
            }
            if (st["currentcat"]["confmenu"] == "True") {
                // TODO - quitar hardcoded unique
                st["config"] = this._checkProduct(_.extend({}, st["currentcat"]), "unique", st["config"]);
                st["config"][st["currentcat"]["uri"]]["config"] = _.extend({}, st["currentconfig"]);
                st["currentconfig"] = _.extend({}, st["config"]);
            }
            else {
                st["currentcommand"] = this._addProduct(_.extend({}, st["currentcat"]), true);
                st["config"] = {};
                st["currentconfig"] = {};
            }
            st["history"].pop();
            st["currentcat"] = _.extend({}, this._getNode(st["history"][st["history"].length - 1], st.fullcat));
            return this.setState(st);
        }
        let item = _.extend({}, this._getNode(uri, st.fullcat));

        let has_next = this._hasNext(item);
        let is_config = item.hasOwnProperty("config") ? true : false;
        let is_menu = params["menu"] == "True" ? true : false;
        let is_param = item.hasOwnProperty("default") ? true : false;

        if (has_next) {
            if (is_menu) {
                item["confmenu"] = "True";
            }

            st["history"].push(uri);
            st["currentcat"] = item;

            if (is_config) {
                st["config"] = _.extend({}, st["currentconfig"]);
                if (st["config"][item.uri] && !("map" in st["config"][item.uri])) {
                    st["currentconfig"] = _.extend({}, st["config"][item.uri]["config"]);
                }
                else {
                    st["currentconfig"] = this._getDefaultConf(_.extend({}, st["currentcat"]));
                }
                if (st["cmdedit"]) {
                    st["cmdedit"].child = st["currentcat"];
                }
            }
        }
        else if (is_param) {
            st["currentconfig"] = this._checkProduct(_.extend({}, item), params["configtype"], st.currentconfig);
        }
        else {
            st["currentcommand"] = this._addProduct(_.extend({}, item), "config" in item ? true : false);
        }
        return this.setState(st);
    },

    _renderModal: function() {
        if (!this.state.modal) {
            return "";
        }
        return YBTpvModal.generate({
            "name": this.props.name + "_modal_" + this.state.modal.param.name,
            "type": this.state.modal.type,
            "param": this.state.modal.param,
            "onAccept": this._acceptedModal,
            "onCancel": this._canceledModal,
            "staticurl": this.props.STATICURL
        });
    },

    _rendercomp: function() {
        if (this.state.screen == "tpv") {
            return YBTpvDashBoard.generate({
                "dashkey": this.state.currentcat.key,
                "desc": this.state.currentcat.desc,
                "uri": this.state.currentcat.uri,
                "menu": this.state.currentcat.menu,
                "confmenu": this.state.currentcat.confmenu,
                "items": this.state.currenttable.uri ? this.state.currentcat.items : this.state.tables,
                "currenttable": this.state.currenttable,
                "currentorder": this.state.currentorder,
                "config": this.state.currentcat.config,
                "name": this.props.name + "_" + this.state.currentcat.key,
                "staticurl": this.props.staticurl,
                "getQty": this._getQty,
                "getChecked": this._getChecked,
                "onItemClick": this._onItemClick
            });
        }
        else if (this.state.screen == "command") {
            return YBTpvCommand.generate({
                "dashkey": "command",
                "name": this.props.name + "_command",
                "desc": "Comanda",
                "command": this.state.command,
                "currentcommand": this.state.currentcommand,
                "staticurl": this.props.staticurl,
                "onItemClick": this._onItemClick,
                "appendProduct": this._appendProduct,
                "sliceProduct": this._sliceProduct,
                "editConfig": this._editConfig
            });
        }
        else if (this.state.screen == "payments") {
            return YBTpvPayments.generate({
                "dashkey": "payment",
                "name": this.props.name + "_payment",
                "desc": "Pagos",
                "payments": this.state.payments,
                "total": this.state.command.total,
                "discount": this.state.command.discount,
                "paid": this.state.command.paid,
                "customers": this.state.command.customers || 1,
                "slicePayment": this._slicePayment,
                "onItemClick": this._onItemClick,
                "staticurl": this.props.staticurl
            });
        }
        else if (this.state.screen == "newpayment") {
            return YBTpvNewPayment.generate({
                "dashkey": "newpayment",
                "name": this.props.name + "_newpayment",
                "desc": "Nuevo pago",
                "payment": this.state.newpayment,
                "onItemClick": this._onItemClick,
                "staticurl": this.props.staticurl
            });
        }
    },

    render: function() {
        let modal = this._renderModal();
        let rendercomp = this._rendercomp();

        return  <div className="YBTpv">
                    { modal }
                    { rendercomp }
                </div>;
    }
};

var YBTpv = React.createClass(YBTpvBase);

module.exports.generate = function(objAtts)
{
    return  <YBTpv
                key = { objAtts.name }
                name = { objAtts.name }
                staticurl = { objAtts.staticurl }/>;
};
