var React = require("react");

import { RadioButton, RadioButtonGroup } from "material-ui/RadioButton";

var YBRadioButtonInputBase = {

    _onChange: function(event, value) {
        this.props.onChange(event, value);
        if (this.props.onBufferChange) {
            this.props.onBufferChange(null, null, this.props.input.inputKey, value, null);
        }
    },

    _renderOptions: function() {
        return this.props.input.inputOpts.map((opt) => {
            return  <RadioButton
                        key = { this.props.input.inputKey + "__" + opt.key }
                        value = { opt.key }
                        label = { opt.alias }
                        disabled = { this.props.input.inputDisabled }
                        className="YBRadioButton"/>;
        });
    },

    render: function() {
        var options = this._renderOptions();

        return  <RadioButtonGroup
                    key = { this.props.input.inputKey }
                    id = { this.props.input.inputKey }
                    ref = { this.props.input.inputRef }
                    name = { this.props.input.inputName }
                    defaultSelected = { this.props.input.inputValue }
                    value = { this.props.input.inputValue }
                    disabled = { this.props.input.inputDisabled }
                    required = { this.props.input.inputRequired }
                    className = "YBRadioButtonGroup"
                    onChange = { this._onChange }>
                    	{ options }
                </RadioButtonGroup>;
    }
};

var YBRadioButtonInput = React.createClass(YBRadioButtonInputBase);

module.exports.generaYBRadioButtonInput = function(objAtts, objFuncs)
{
    return  <YBRadioButtonInput
                input = { objAtts.input }
                onKeyDown = { objFuncs.onKeyDown }
                onChange = { objFuncs.onChange }
                onBufferChange = { objFuncs.onBufferChange }
                onBlur = { objFuncs.onBlur }
                onFocus = { objFuncs.onFocus }/>;
};