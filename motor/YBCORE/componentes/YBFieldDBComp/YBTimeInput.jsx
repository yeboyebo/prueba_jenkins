var React = require('react');

var YBTimeInputBase = {

    render: function() {
        var value = this.props.input.inputValue ? this.props.input.inputValue : "";

        return  <input
                    key = { this.props.input.inputKey }
                    ref = { this.props.input.inputRef }
                    id = { this.props.input.inputKey }
                    name = { this.props.input.inputName }
                    className = "YBTimeInput form-control"
                    type = "time"
                    value = { value }
                    disabled = { this.props.input.inputDisabled }
                    autoFocus = { this.props.input.inputAutoFocus }
                    required = { this.props.input.inputRequired }
                    onChange = { this.props.onChange }
                    onBlur = { this.props.onBlur }
                    onFocus = { this.props.onFocus }
                    step = "1"/>;
    }
};

var YBTimeInput = React.createClass(YBTimeInputBase);

module.exports.generaYBTimeInput = function(objAtts, objFuncs)
{
    return  <YBTimeInput
                input = { objAtts.input }
                onKeyDown = { objFuncs.onKeyDown }
                onChange = { objFuncs.onChange }
                onBlur = { objFuncs.onBlur }
                onFocus = { objFuncs.onFocus }/>;
};