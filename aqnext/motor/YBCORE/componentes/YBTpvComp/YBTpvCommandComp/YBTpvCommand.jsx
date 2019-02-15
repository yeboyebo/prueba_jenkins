var React = require("react");
var _ = require("underscore");
var YBTpvDashBoardItem = require("../YBTpvDashBoardComp/YBTpvDashBoardItem.jsx");
var YBTpvList = require("./YBTpvList.jsx");

var YBTpvCommandBase = {

    getInitialState: function() {
        return {
            "filter": "current"
        };
    },

    _onItemClick: function(uri, params) {
        if (uri == "filter_command") {
            let st = this.state;
            if (st.filter == "current") {
                st.filter = "all";
            }
            else {
                st.filter = "current";
            }
            return this.setState(st);
        }
        this.props.onItemClick(uri, params);
    },

    _onRowClick: function(pk, config) {
        if (!config || Object.keys(config) == 0) {
            return;
        }
        this.props.editConfig(pk, config, false);
    },

    _onActionExec: function(action, pk, data) {
        if (action.key == "add") {
            this.props.appendProduct(pk, data.config);
        }
        else if (action.key == "remove") {
            this.props.sliceProduct(pk, data.config);
        }
        else {
            return;
        }
    },

    _formatPrice: function(price) {
        price = Math.round(price * 100) / 100;
        let aPrice = price.toString().split(".");
        if (!aPrice[1]) {
            aPrice[1] = "00";
        }
        while (aPrice[1].length < 2) {
            aPrice[1] += "0";
        }
        return aPrice.join(",");
    },

    _getLines: function(command) {
        let lines = [];
        let objs = [];
        let line = false;
        let cmdlines = _.extend({}, command.lines);
        let keys = Object.keys(cmdlines);
        for (let i in keys) {
            line = _.extend({}, cmdlines[keys[i]]);
            objs = this._getItems(line);
            for (let j in objs) {
                objs[j]["pk"] = objs[j]["key"];
                let price = Math.round(objs[j]["price"] * objs[j]["qty"] * 100) / 100;
                let aPrice = price.toString().split(".");
                if (!aPrice[1]) {
                    aPrice[1] = "00";
                }
                while (aPrice[1].length < 2) {
                    aPrice[1] += "0";
                }
                objs[j]["price"] = "Precio: " + aPrice.join(",") + "€";
                objs[j]["rawprice"] = price;
                objs[j]["qty"] = "Cantidad: " + objs[j]["qty"];
                lines.push(objs[j]);
            }
        }
        return lines;
    },

    _getDesc: function(obj, objConf, is_conf) {
        let desc = obj.desc;
        if (is_conf) {
            desc = "";
        }
        let c = false;
        let keys = Object.keys(objConf).sort();
        for (let i in keys) {
            c = objConf[keys[i]];
            if (c["checked"] == "True" && c["default"] == "False") {
                desc += " +" + c.key;
            }
            else if (c["checked"] == "False" && c["default"] == "True") {
                desc += " -" + c.key;
            }
            if (c["config"]) {
                desc += this._getDesc(c, c["config"], true);
            }
        }
        return desc;
    },

    _getPrice: function(obj, objConf) {
        let price = parseFloat(obj.price);
        let c = false;
        for (let i in objConf) {
            c = objConf[i];
            if (c["config"]) {
                price += this._getPrice(c, c["config"]);
            }
            else if (c["price"]) {
                price += parseFloat(c["price"]);
            }
        }
        return price;
    },

    _getItems: function(line) {
        if (!("config" in line)) {
            return [line];
        }
        let lines = [];
        let linestmp = {};
        let obj = false;
        for (let i = 0; i < line["config"].length; i++) {
            obj = _.extend({}, line);
            obj.desc = this._getDesc(obj, obj["config"][i]);
            obj.price = this._getPrice(obj, obj["config"][i]);
            if (!(obj.desc in linestmp)) {
                linestmp[obj.desc] = {};
                linestmp[obj.desc]["obj"] = obj;
                linestmp[obj.desc]["qty"] = 0;
                linestmp[obj.desc]["obj"]["config"] = obj["config"][i];
            }
            linestmp[obj.desc]["qty"] += 1;
        }
        for (let l in linestmp) {
            linestmp[l]["obj"]["qty"] = linestmp[l]["qty"];
            lines.push(linestmp[l]["obj"]);
        }
        return lines;
    },

    _renderTitle: function(currentLines) {
        let price = this.props.command.total;
        let cPrice = 0;
        let discount = this.props.command.discount;

        for (let l in currentLines) {
            cPrice += currentLines[l].rawprice;
        }

        if (discount && discount >= 0 && discount <= 100) {
            price += cPrice - (cPrice * discount / 100);
        }
        else {
        	price += cPrice;
        }

        let text = "Total: " + this._formatPrice(price) + "€";

        if (discount && discount >= 0 && discount <= 100) {
            text += " (-" + discount + "%)";
        }

        return  <div className="YBTpvDashBoardTitle">
                    { text }
                </div>;
    },

    _renderList: function(lines, type) {
        let items = {
            "primary": {
                "title": "desc",
                "subtitle": "qty",
                "body": [
                    "price"
                ]
            },
            "secondary": {
                "item": {},
                "actions": [
                    {"key": "add", "tipo": "act"},
                    {"key": "remove", "tipo": "act"}
                ]
            },
            "avatar": "key"
        };

        let dummyFunc = ((a)=>{return a;});
        let formatter = {
            "desc": dummyFunc,
            "key": dummyFunc,
            "qty": dummyFunc,
            "price": dummyFunc
        };

        let actions = {
            "add": {
                "icon": "add_circle circle"
            },
            "remove": {
                "icon": "remove_circle circle"
            }
        };

        let tpvList = YBTpvList.generate({
            "name": this.props.name + "_list",
            "title": type == "current" ? "Sin enviar" : "Enviado",
            "staticurl": this.props.staticurl,
            "items": items,
            "data": lines,
            "acciones": actions,
            "rowclick": this._onRowClick,
            "onActionExec": this._onActionExec,
            "formatter": formatter
        });

        return  <div className="YBTpvDashBoardConfig">
                    { tpvList }
                </div>;
    },

    _renderFixed: function() {
        let back = this._renderBack();
        let confirm = this._renderConfirm();
        let discount = this._renderDiscount();
        let payment = this._renderPayment();
        let filter = this._renderFilter();

        return  <div className="YBTpvDashBoardConfig">
                    { back }
                    { confirm }
                    { filter }
                    { discount }
                    { payment }
                </div>;
    },

    _renderBack: function() {
        return YBTpvDashBoardItem.generate({
            "name": this.props.name + "_back",
            "item": {"uri": "back_command", "desc": "Volver"},
            "menu": "False",
            "staticurl": this.props.staticurl,
            "confmenu": "False",
            "onClick": this._onItemClick
        });
    },

    _renderConfirm: function() {
        if (this.props.currentcommand.isSent) {
            return "";
        }

        return YBTpvDashBoardItem.generate({
            "name": this.props.name + "_confirm",
            "item": {"uri": "confirm_command", "desc": "Enviar a cocina"},
            "staticurl": this.props.staticurl,
            "menu": "False",
            "confmenu": "False",
            "onClick": this._onItemClick
        });
    },

    _renderDiscount: function() {
        return YBTpvDashBoardItem.generate({
            "name": this.props.name + "_discount",
            "item": {"uri": "discount_command", "desc": "Descuento"},
            "staticurl": this.props.staticurl,
            "menu": "False",
            "confmenu": "False",
            "onClick": this._onItemClick
        });
    },

    _renderPayment: function() {
        return YBTpvDashBoardItem.generate({
            "name": this.props.name + "_payments",
            "item": {"uri": "payments_command", "desc": "Cobrar"},
            "staticurl": this.props.staticurl,
            "menu": "False",
            "confmenu": "False",
            "onClick": this._onItemClick
        });
    },

    _renderFilter: function() {
        if (this.state.filter == "current") {
            return YBTpvDashBoardItem.generate({
                "name": this.props.name + "_filter",
                "item": {"uri": "filter_command", "desc": "Mostrar todo"},
                "staticurl": this.props.staticurl,
                "menu": "False",
                "confmenu": "False",
                "onClick": this._onItemClick
            });
        }
        else {
            return YBTpvDashBoardItem.generate({
                "name": this.props.name + "_filter",
                "item": {"uri": "filter_command", "desc": "Sin enviar"},
                "staticurl": this.props.staticurl,
                "menu": "False",
                "confmenu": "False",
                "onClick": this._onItemClick
            });
        }
    },

    render: function() {
        let currentLines = this._getLines(this.props.currentcommand);
        let lines = this._getLines(this.props.command);
        let fixed = this._renderFixed();
        let currentList = this._renderList(currentLines, "current");
        let list = this._renderList(lines, "all");
        let title = this._renderTitle(currentLines);

        return  <div className="YBTpvCommand">
                    { title }
                    { fixed }
                    { currentList }
                    { this.state.filter == "all" ? list : "" }
                </div>;
    }
};

var YBTpvCommand = React.createClass(YBTpvCommandBase);

module.exports.generate = function(objAtts)
{
    return  <YBTpvCommand
                key = { objAtts.name }
                name = { objAtts.name }
                desc = { objAtts.desc }
                dashkey = { objAtts.dashkey }
                command = { objAtts.command }
                currentcommand = { objAtts.currentcommand }
                staticurl = { objAtts.staticurl }
                appendProduct = { objAtts.appendProduct }
                sliceProduct = { objAtts.sliceProduct }
                editConfig = { objAtts.editConfig }
                onItemClick = { objAtts.onItemClick }/>;
};
