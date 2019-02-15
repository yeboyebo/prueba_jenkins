var React = require('react');

var YBCheckBoxInputBase = {

    render: function() {
        var value = this.props.input.inputValue ? true : false;

        return  <label>
                    <input
                        key = { this.props.input.inputKey }
                        ref = { this.props.input.inputRef }
                        id = { this.props.input.inputKey }
                        name = { this.props.input.inputKey }
                        className = "YBCheckBoxInput"
                        type = "checkbox"
                        checked = { value }
                        disabled = { this.props.input.inputDisabled }
                        required = { this.props.input.inputRequired }
                        onChange = { this.props.onChange }
                        onBlur = { this.props.onBlur }
                        onFocus = { this.props.onFocus }/>
                    <div className="YBCheckBoxLabel">{ this.props.input.inputVerboseName }</div>
                </label>;
    }
};

var YBCheckBoxInput = React.createClass(YBCheckBoxInputBase);

module.exports.generaYBCheckBoxInput = function(objAtts, objFuncs)
{
    return  <YBCheckBoxInput
                input = { objAtts.input }
                onKeyDown = { objFuncs.onKeyDown }
                onChange = { objFuncs.onChange }
                onBlur = { objFuncs.onBlur }
                onFocus = { objFuncs.onFocus }/>;
};