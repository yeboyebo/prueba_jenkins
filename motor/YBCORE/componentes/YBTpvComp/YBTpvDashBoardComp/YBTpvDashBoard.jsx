var React = require("react");
var YBTpvDashBoardItem = require("./YBTpvDashBoardItem.jsx");
var YBTpvDashBoardConfig = require("./YBTpvDashBoardConfig.jsx");

var YBTpvDashBoardBase = {

    _onItemClick: function(uri, params) {
        this.props.onItemClick(uri, params);
    },

    _filterDashItems: function(item) {
        if (item.key.startsWith("table")) {
            return true;
        }

        // Configurar en server
        switch (this.props.currentorder.value) {
            case "bebidas": {
                if (item.key != "BEB") {
                    return false;
                }
                break;
            }
            case "entrantes": {
                if (item.key != "ENT" && item.key != "ENS") {
                    return false;
                }
                break;
            }
            case "principales": {
                if (item.key != "HAM" && item.key != "ENS" && item.key != "MIN") {
                    return false;
                }
                break;
            }
            case "postres": {
                if (item.key != "POS") {
                    return false;
                }
                break;
            }
            case "cafes": {
                if (item.key != "CAF") {
                    return false;
                }
                break;
            }
            default: {
                return false;
            }
        }
        return true;
    },

    _renderTpvDashBoardTitle: function() {
        return  <div className="YBTpvDashBoardTitle">
                    { this.props.desc.toUpperCase() }
                </div>;
    },

    _renderTpvDashBoardItems: function() {
        if (!this.props.items) {
            return "";
        }
        return this.props.items.map((item) => {
            if (this.props.uri == "/" && !this._filterDashItems(item)) {
                return "";
            }
            return YBTpvDashBoardItem.generate({
                "name": this.props.name + "_" + item.key,
                "item": item,
                "qty": this.props.getQty(item.key),
                "checked": "False",
                "menu": this.props.menu,
                "confmenu": this.props.confmenu,
                "staticurl": this.props.staticurl,
                "onClick": this._onItemClick
            });
        });
    },

    _renderTpvDashBoardConfig: function() {
        if (!this.props.config) {
            return "";
        }
        return this.props.config.map((config) => {
            return YBTpvDashBoardConfig.generate({
                "name": this.props.name + "_" + config.key,
                "config": config,
                "menu": this.props.menu,
                "confmenu": this.props.confmenu,
                "staticurl": this.props.staticurl,
                "onItemClick": this._onItemClick,
                "getChecked": this.props.getChecked
            });
        });
    },

    _renderTpvDashBoardFixed: function() {
        let tpvDashBoardTable = this._renderTpvDashBoardTable();
        let tpvDashBoardCommand = this._renderTpvDashBoardCommand();
        let tpvDashBoardBack = this._renderTpvDashBoardBack();
        let tpvDashBoardConfirm = this._renderTpvDashBoardConfirm();
        let tpvDashBoardOrder = this._renderTpvDashBoardOrder();
        let tpvDashBoardMessage = this._renderTpvDashBoardMessage();

        return  <div className="YBTpvDashBoardConfig">
                    { tpvDashBoardTable }
                    { tpvDashBoardCommand }
                    { tpvDashBoardBack }
                    { tpvDashBoardConfirm }
                    { tpvDashBoardOrder }
                    { tpvDashBoardMessage }
                </div>;
    },

    _renderTpvDashBoardCommand: function() {
        if (this.props.uri != "/") {
            return "";
        }
        if (!this.props.currenttable.key) {
            return "";
        }

        return YBTpvDashBoardItem.generate({
            "name": this.props.name + "_command",
            "item": {"uri": "command", "desc": "Ver comanda"},
            "staticurl": this.props.staticurl,
            "onClick": this._onItemClick
        });
    },

    _renderTpvDashBoardTable: function() {
        if (this.props.uri != "/") {
            return "";
        }

        return YBTpvDashBoardItem.generate({
            "name": this.props.name + "_table",
            "item": this.props.currenttable,
            "staticurl": this.props.staticurl,
            "onClick": this._onItemClick
        });
    },

    _renderTpvDashBoardBack: function() {
        if (this.props.uri == "/") {
            return "";
        }

        return YBTpvDashBoardItem.generate({
            "name": this.props.name + "_back",
            "item": {"uri": "back_dash", "desc": "Volver"},
            "menu": this.props.menu,
            "confmenu": this.props.confmenu,
            "staticurl": this.props.staticurl,
            "onClick": this._onItemClick
        });
    },

    _renderTpvDashBoardConfirm: function() {
        if (!this.props.config) {
            return "";
        }

        return YBTpvDashBoardItem.generate({
            "name": this.props.name + "_confirm",
            "item": {"uri": "confirm_dash", "desc": "Hecho"},
            "menu": this.props.menu,
            "confmenu": this.props.confmenu,
            "staticurl": this.props.staticurl,
            "onClick": this._onItemClick
        });
    },

    _renderTpvDashBoardOrder: function() {
        if (this.props.uri != "/") {
            return "";
        }
        if (!this.props.currenttable.key) {
            return "";
        }

        let desc = this.props.currentorder ? "Orden " + this.props.currentorder.alias : "Sin orden";
        return YBTpvDashBoardItem.generate({
            "name": this.props.name + "_order",
            "item": {"uri": "order_dash", "desc": desc},
            "staticurl": this.props.staticurl,
            "menu": "False",
            "confmenu": "False",
            "onClick": this._onItemClick
        });
    },

    _renderTpvDashBoardMessage: function() {
        if (this.props.uri != "/") {
            return "";
        }
        if (!this.props.currenttable.key) {
            return "";
        }

        return YBTpvDashBoardItem.generate({
            "name": this.props.name + "_message",
            "item": {"uri": "message_dash", "desc": "Mensajes"},
            "staticurl": this.props.staticurl,
            "menu": "False",
            "confmenu": "False",
            "onClick": this._onItemClick
        });
    },

    render: function() {
        let tpvDashBoardFixed = this._renderTpvDashBoardFixed();
        let tpvDashBoardItems = this._renderTpvDashBoardItems();
        let tpvDashBoardConfig = this._renderTpvDashBoardConfig();
        let tpvDashBoardTitle = this._renderTpvDashBoardTitle();

        return  <div className="YBTpvDashBoard">
                    { tpvDashBoardTitle }
                    { tpvDashBoardFixed }
                    { tpvDashBoardItems }
                    { tpvDashBoardConfig }
                </div>;
    }
};

var YBTpvDashBoard = React.createClass(YBTpvDashBoardBase);

module.exports.generate = function(objAtts)
{
    return  <YBTpvDashBoard
                key = { objAtts.name }
                name = { objAtts.name }
                dashkey = { objAtts.dashkey }
                desc = { objAtts.desc }
                menu = { objAtts.menu }
                confmenu = { objAtts.confmenu }
                items = { objAtts.items }
                config = { objAtts.config }
                currenttable = { objAtts.currenttable }
                currentorder = { objAtts.currentorder }
                uri = { objAtts.uri }
                staticurl = { objAtts.staticurl }
                getQty = { objAtts.getQty }
                getChecked = { objAtts.getChecked }
                onItemClick = { objAtts.onItemClick }/>;
};
