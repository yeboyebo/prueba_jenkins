var React = require("react");

var YBStringInputBase = {

    render: function() {
        var value = this.props.input.inputValue ? this.props.input.inputValue : "";

        return  <input
                    key = { this.props.input.inputKey }
                    ref = { this.props.input.inputRef }
                    id = { this.props.input.inputKey }
                    name = { this.props.input.inputName }
                    className = "YBStringInput form-control"
                    type = "text"
                    value = { value }
                    disabled = { this.props.input.inputDisabled }
                    autoFocus = { this.props.input.inputAutoFocus }
                    required = { this.props.input.inputRequired }
                    onKeyDown = { this.props.onKeyDown }
                    onChange = { this.props.onChange }
                    onBlur = { this.props.onBlur }
                    onFocus = { this.props.onFocus }/>;
    }
};

var YBStringInput = React.createClass(YBStringInputBase);

module.exports.generate = function(objAtts)
{
    return  <YBStringInput
                input = { objAtts.input }
                onKeyDown = { objAtts.onKeyDown }
                onChange = { objAtts.onChange }
                onBlur = { objAtts.onBlur }
                onFocus = { objAtts.onFocus }/>;
};
