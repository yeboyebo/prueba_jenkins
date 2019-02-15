var React = require("react");
// var _ = require("underscore");
var YBTpvDashBoardItem = require("../YBTpvDashBoardComp/YBTpvDashBoardItem.jsx");
var YBTpvKeyboard = require("../YBTpvKeyboardComp/YBTpvKeyboard.jsx");
var YBFieldDB = require("../../YBFieldDBComp/YBFieldDB.jsx");

var YBTpvNewPaymentBase = {

    getInitialState: function() {
        return {
            "change": 0.0,
            "value": this.props.payment.method == "TARJ" ? this.props.payment.amount : 0,
            "currentpayment": {}
        };
    },

    _onKeyboardChange: function(value) {
        let change = 0.0;
        if (this.props.payment.method == "CONT" && value > this.props.payment.amount) {
            change = value - this.props.payment.amount;
        }
        this.setState({"value": value, "change": change});
    },

    _onItemClick: function(uri, params) {
        if (uri.endsWith("amountpayment")) {
            if (uri.startsWith("limpiar")) {
                return this.setState({"currentpayment": {}, "value": 0.0, "change": 0.0});
            }
            let currpay = this.state.currentpayment;
            let amount = uri.split("_")[0];
            if (!(amount in currpay)) {
                currpay[amount] = 0;
            }
            currpay[amount] += 1;
            let value = this.state.value;
            value += parseFloat(amount);
            let change = 0.0;
            if (this.props.payment.method == "CONT" && value > this.props.payment.amount) {
                change = value - this.props.payment.amount;
            }
            return this.setState({"currentpayment": currpay, "value": value, "change": change});
        }
        if (uri.startsWith("confirm")) {
            params["value"] = this.props.payment.method == "CONT" ? this.state.value - this.state.change : this.state.value;
            params["method"] = this.props.payment.method;
        }
        this.props.onItemClick(uri, params);
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
        return aPrice.join(".");
    },

    _renderFields: function() {
        let fields = ["a pagar"];
        let values = [this.props.payment.amount];

        if (this.props.payment.method == "CONT") {
            fields.push("pagado");
            fields.push("cambio");
            values.push(this.state.value);
            values.push(this.state.change);
        }

        return fields.map((field, i) => {
            return this._renderField(field, values[i]);
        });
    },

    _renderField: function(field, value) {
        let objAtts = {
            "layoutName": this.props.name + "_" + field,
            "fieldName": this.props.name + "_" + field,
            "LAYOUT": {
                "label": field.toUpperCase(),
                "disabled": true
            },
            "SCHEMA": {
                "pk": null
            },
            "DATA": {},
            "modelfield": {
                "auto": false,
                "tipo": 19,
                "decimal_places": 2
            }
        };
        objAtts["DATA"][this.props.name + "_" + field] = this._formatPrice(value);
        return YBFieldDB.generaYBFieldDB(
            objAtts,
            {}
        );
    },

    _renderCash: function() {
        if (this.props.payment.method != "CONT") {
            return "";
        }

        let bills = ["limpiar", "500", "200", "100", "50", "20", "10", "5"];
        let coins = ["2", "1", "0.5", "0.2", "0.1", "0.05", "0.02", "0.01"];

        bills = bills.map((bill) => {
            return YBTpvDashBoardItem.generate({
                "name": this.props.name + "_bill_" + bill,
                "item": {"uri": bill + "_amountpayment", "desc": bill},
                "menu": "False",
                "staticurl": this.props.staticurl,
                "confmenu": "False",
                "qty": bill in this.state.currentpayment ? this.state.currentpayment[bill] : 0,
                "onClick": this._onItemClick
            });
        });

        coins = coins.map((coin) => {
            return YBTpvDashBoardItem.generate({
                "name": this.props.name + "_coin_" + coin,
                "item": {"uri": coin + "_amountpayment", "desc": coin},
                "menu": "False",
                "staticurl": this.props.staticurl,
                "confmenu": "False",
                "qty": coin in this.state.currentpayment ? this.state.currentpayment[coin] : 0,
                "onClick": this._onItemClick
            });
        });

        return  <div>
                    <div className="YBTpvDashBoardConfig">
                        { bills }
                    </div>
                    <div className="YBTpvDashBoardConfig">
                        { coins }
                    </div>
                </div>;
    },

    _renderKeyboard: function() {
        if (this.props.payment.method == "CONT") {
            return "";
        }

        return YBTpvKeyboard.generate({
            "name": this.props.name + "_keyboard",
            "type": "numeric",
            "value": this.state.value ? this._formatPrice(this.state.value) : this.state.value,
            "staticurl": this.props.staticurl,
            "onChange": this._onKeyboardChange
        });
    },

    _renderBack: function() {
        return YBTpvDashBoardItem.generate({
            "name": this.props.name + "_back",
            "item": {"uri": "back_newpayment", "desc": "Volver"},
            "menu": "False",
            "staticurl": this.props.staticurl,
            "confmenu": "False",
            "onClick": this._onItemClick
        });
    },

    _renderConfirm: function() {
        return YBTpvDashBoardItem.generate({
            "name": this.props.name + "_confirm",
            "item": {"uri": "confirm_newpayment", "desc": "Confirmar"},
            "menu": "False",
            "staticurl": this.props.staticurl,
            "confmenu": "False",
            "onClick": this._onItemClick
        });
    },

    _renderTitle: function() {
        return  <div className="YBTpvDashBoardTitle">
                    Nuevo Pago
                </div>;
    },

    _renderFixed: function() {
        let back = this._renderBack();
        let confirm = this._renderConfirm();

        return  <div className="YBTpvDashBoardConfig">
                    { back }
                    { confirm }
                </div>;
    },

    render: function() {
        let title = this._renderTitle();
        let fixed = this._renderFixed();
        let fields = this._renderFields();
        let keyboard = this._renderKeyboard();
        let cash = this._renderCash();

        return  <div className="YBTpvNewPayment">
                    { title }
                    { fixed }
                    { fields }
                    { cash }
                    { keyboard }
                </div>;
    }
};

var YBTpvNewPayment = React.createClass(YBTpvNewPaymentBase);

module.exports.generate = function(objAtts)
{
    return  <YBTpvNewPayment
                key = { objAtts.name }
                name = { objAtts.name }
                desc = { objAtts.desc }
                payment = { objAtts.payment }
                dashkey = { objAtts.dashkey }
                staticurl = { objAtts.staticurl }
                onItemClick = { objAtts.onItemClick }/>;
};
