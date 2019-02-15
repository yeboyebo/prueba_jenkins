var React = require("react");
// var _ = require("underscore");
var YBTpvDashBoardItem = require("../YBTpvDashBoardComp/YBTpvDashBoardItem.jsx");
var YBFieldDB = require("../../YBFieldDBComp/YBFieldDB.jsx");
var YBTpvList = require("../YBTpvCommandComp/YBTpvList.jsx");

var YBTpvPaymentsBase = {

    getInitialState: function() {
        return this._getPrices(this.props);
    },

    componentWillReceiveProps: function(newProps) {
        return this.setState(this._getPrices(newProps));
    },

    _getPrices: function(props) {
        let pending = props.total - props.paid;
        // let customer = props.total / props.customers;
        // let pair = customer * 2;

        if (pending < 0) {
        	pending = 0;
        }

        return {
            "pending": pending
            // "customer": customer,
            // "pair": pair
        };
    },

    _onItemClick: function(uri, params) {
        params["newpayment"] = {
            "pending": this.state.pending
            // "pair": this.state.pair,
            // "customer": this.state.customer
        };
        this.props.onItemClick(uri, params);
    },

    _onActionExec: function(action, pk, data) {
        if (action.key == "remove") {
            this.props.slicePayment(pk, data["id"]);
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
        return aPrice.join(".");
    },

    _renderList: function() {
        let items = {
            "primary": {
                "title": "methoddesc",
                "subtitle": "amount",
                "body": []
            },
            "secondary": {
                "item": {},
                "actions": [
                    {"key": "remove", "tipo": "act"}
                ]
            },
            "avatar": "method"
        };

        let dummyFunc = ((a) => {return a;});
        let formatter = {
            "method": dummyFunc,
            "methoddesc": dummyFunc,
            "amount": dummyFunc
        };

        let actions = {
            "remove": {
                "icon": "remove_circle circle"
            }
        };

        let payments = this.props.payments.map((payment) => {
            return {
                "pk": payment.method,
                "id": payment.id,
                "method": payment.method,
                "methoddesc": payment.methoddesc,
                "amount": this._formatPrice(payment.amount)
            };
        });

        let tpvList = YBTpvList.generate({
            "name": this.props.name + "_list",
            "staticurl": this.props.staticurl,
            "items": items,
            "data": payments,
            "acciones": actions,
            "rowclick": this._onRowClick,
            "onActionExec": this._onActionExec,
            "formatter": formatter
        });

        return  <div className="YBTpvDashBoardConfig">
                    { tpvList }
                </div>;
    },

    _renderFields: function() {
        // let fields = ["total", "pagado", "pendiente", "por comensal", "por pareja"];
        // let values = [this.props.total, this.props.paid, this.state.pending, this.state.customer, this.state.pair];
        let fields = ["total", "pagado", "pendiente"];
        let values = [this.props.total, this.props.paid, this.state.pending];

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

    _renderNewPayment: function() {
        return YBTpvDashBoardItem.generate({
            "name": this.props.name + "_newpayment",
            "item": {"uri": "goto_newpayment", "desc": "Nuevo pago"},
            "menu": "False",
            "staticurl": this.props.staticurl,
            "confmenu": "False",
            "onClick": this._onItemClick
        });
    },

    _renderBack: function() {
        return YBTpvDashBoardItem.generate({
            "name": this.props.name + "_back",
            "item": {"uri": "back_payments", "desc": "Volver"},
            "menu": "False",
            "staticurl": this.props.staticurl,
            "confmenu": "False",
            "onClick": this._onItemClick
        });
    },

    _renderTitle: function() {
        return  <div className="YBTpvDashBoardTitle">
                    Pagos
                </div>;
    },

    _renderFixed: function() {
        let back = this._renderBack();
        let newpayment = this._renderNewPayment();

        return  <div className="YBTpvDashBoardConfig">
                    { back }
                    { newpayment }
                </div>;
    },

    render: function() {
        let title = this._renderTitle();
        let fixed = this._renderFixed();
        let fields = this._renderFields();
        let paymentList = this._renderList();

        return  <div className="YBTpvPayments">
                    { title }
                    { fixed }
                    { fields }
                    { paymentList }
                </div>;
    }
};

var YBTpvPayments = React.createClass(YBTpvPaymentsBase);

module.exports.generate = function(objAtts)
{
    return  <YBTpvPayments
                key = { objAtts.name }
                name = { objAtts.name }
                desc = { objAtts.desc }
                payments = { objAtts.payments }
                total = { objAtts.total }
                discount = { objAtts.discount }
                paid = { objAtts.paid }
                customers = { objAtts.customers }
                slicePayment = { objAtts.slicePayment }
                dashkey = { objAtts.dashkey }
                staticurl = { objAtts.staticurl }
                onItemClick = { objAtts.onItemClick }/>;
};
