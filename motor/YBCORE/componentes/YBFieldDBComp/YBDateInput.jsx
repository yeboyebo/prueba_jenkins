var React = require('react');

var YBDateInputBase = {

    render: function() {
        var value = this.props.input.inputValue ? this.props.input.inputValue : "";

        return  <input
                    key = { this.props.input.inputKey }
                    ref = { this.props.input.inputRef }
                    id = { this.props.input.inputKey }
                    name = { this.props.input.inputName }
                    className = "YBDateInput form-control"
                    type = "date"
                    value = { value }
                    disabled = { this.props.input.inputDisabled }
                    autoFocus = { this.props.input.inputAutoFocus }
                    required = { this.props.input.inputRequired }
                    onChange = { this.props.onChange }
                    onKeyDown = { this.props.onKeyDown }
                    onBlur = { this.props.onBlur }
                    onFocus = { this.props.onFocus }/>;
    }
};

var YBDateInput = React.createClass(YBDateInputBase);

module.exports.generaYBDateInput = function(objAtts, objFuncs)
{
    return  <YBDateInput
                input = { objAtts.input }
                onKeyDown = { objFuncs.onKeyDown }
                onChange = { objFuncs.onChange }
                onBlur = { objFuncs.onBlur }
                onFocus = { objFuncs.onFocus }/>;
};