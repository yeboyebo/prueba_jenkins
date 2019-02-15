var React = require("react");
var YBCheckBoxInput = require("./YBCheckBoxInput.jsx");

import { RadioButton, RadioButtonGroup } from "material-ui/RadioButton";

var YBMultiCheckBoxInputBase = {

    getInitialState: function() {
        return {
            "value": {},
        };
    },


    _onChecked: function(event, value) {
        var value = this.state.value;
        value[event.target.name] =  event.target.checked;
        this.setState({"value": value});
        //Lo que envia
/*        event.target.name = this.props.name;
        event.target.value = JSON.stringify(value);*/
        this.props.onChange(this.props.name, JSON.stringify(value));
    },

    _onBlur: function(event) {

    },

    _onFocus: function(event) {

    },

    _renderOptions: function() {
        var este = this;
        var objFuncs = {
            "onChange": this._onChecked,
            "onBlur": this._onBlur,
            "onFocus": this._onFocus
        };
        return this.props.input.inputOpts.map((opt) => {
            var input = {
                "inputKey": opt.key,
                "inputRef": opt.key,
                "inputName": opt.label,
                "inputVerboseName": opt.label,
                "inputValue": este.state.value[opt.key],
                "inputDisabled": false,
                "inputRequired": false
            };
            var objAtts = {
                "input": input
            };
            var keyC = opt.key + "_chekBox";
            return <div className="YBMultiCheckItem" key = { keyC }>{ YBCheckBoxInput.generaYBCheckBoxInput(objAtts, objFuncs) }</div>;
        });
    },

    componentWillMount: function() {
        var val = {};

        this.props.input.inputOpts.map((opt) => {
            val[opt.key] = opt.hasOwnProperty("value") ? opt.value : false;
        });

        this.setState({"value": val});
        this.props.onChange(this.props.name, JSON.stringify(val));
    },

    render: function() {
        var options = this._renderOptions();

        return  <div className="YBMultiCheckBoxInput"> { options } </div>;
    }
};

var YBMultiCheckBoxInput = React.createClass(YBMultiCheckBoxInputBase);

module.exports.generaYBMultiCheckBoxInput = function(objAtts, objFuncs)
{
    return  <YBMultiCheckBoxInput
                input = { objAtts.input }
                name = { objAtts.name }
                onKeyDown = { objFuncs.onKeyDown }
                onChange = { objFuncs.onChange }
                onBufferChange = { objFuncs.onBufferChange }
                onBlur = { objFuncs.onBlur }
                onFocus = { objFuncs.onFocus }/>;
};