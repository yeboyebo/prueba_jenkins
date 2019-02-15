var React = require("react");
var _ = require("underscore");
var YBButton = require("../../YBButton.jsx");
var YBTpvNumericModal = require("./YBTpvNumericModal.jsx");
var YBTpvAlphaNumericModal = require("./YBTpvAlphaNumericModal.jsx");
var YBTpvSelectionModal = require("./YBTpvSelectionModal.jsx");

var YBTpvModalBase = {

    getInitialState: function() {
        let param = _.extend({}, this.props.param);

        if (param.value == undefined) {
            if (this.props.type == "numeric") {
                param.value = 0;
            }
            else {
                param.value = "";
            }
        }

        return {
            "param": param
        };
    },

    _onChange: function(value) {
    	let st = _.extend({}, this.state);

        st.param.value = value;
        return this.setState({
            "param": st.param
        });
    },

    _onAccept: function() {
        this.props.onAccept(this.state.param.value);
    },

    _renderHeader: function() {
        return <div className="YBTpvModalHeader">
            { this.props.param.alias }
            <i className="material-icons" onClick={ this.props.onCancel }>close</i>
        </div>;
    },

    _renderBody: function() {
        let modal = "";
        let obj = {
            "name": this.props.name + "_" + this.props.type + "modal",
            "staticurl": this.props.staticurl,
            "param": this.state.param,
            "onChange": this._onChange
        }

        if (this.props.type == "numeric") {
            modal = YBTpvNumericModal.generate(obj);
        }
        else if (this.props.type == "alphanumeric") {
            modal = YBTpvAlphaNumericModal.generate(obj);
        }
        else if (this.props.type == "selection") {
            modal = YBTpvSelectionModal.generate(obj);
        }

        return <div className="YBTpvModalBody">
            { modal }
        </div>;
    },

    _renderConfirm: function() {
        return YBButton.generaYBButton({
            "name": this.props.name + "_confirm",
            "layout": {
                "label": "Confirmar",
                "buttonType": "raised",
                "primary": false,
                "secondary": true,
                "className": "floatRight"
            }
        }, {
            "onClick": this._onAccept
        });
    },

    _renderCancel: function() {
        return YBButton.generaYBButton({
            "name": this.props.name + "_cancel",
            "layout": {
                "label": "Cancelar",
                "buttonType": "flat",
                "primary": false,
                "secondary": true,
                "className": "floatRight"
            }
        }, {
            "onClick": this.props.onCancel
        });
    },

    _renderFooter: function() {
        let confirmB = this._renderConfirm();
        let cancelB = this._renderCancel();

        return <div className="YBTpvModalFooter">
            { confirmB }
            { cancelB }
        </div>;
    },

    _getClassName: function() {
        let className = "YBTpvModal";
        return className;
    },

    render: function() {
        let className = this._getClassName();
        let header = this._renderHeader();
        let body = this._renderBody();
        let footer = this._renderFooter();

        return  <div className={ className }>
                    <div className="YBTpvModalBackground"/>
                    <div className="YBTpvModalForeground">
                        { header }
                        { body }
                        { footer }
                    </div>
                </div>;
    }
};

var YBTpvModal = React.createClass(YBTpvModalBase);

module.exports.generate = function(objAtts)
{
    return  <YBTpvModal
                key = { objAtts.name }
                name = { objAtts.name }
                type = { objAtts.type }
                param = { objAtts.param }
                staticurl = { objAtts.staticurl }
                onAccept = { objAtts.onAccept }
                onCancel = { objAtts.onCancel }/>;
};
