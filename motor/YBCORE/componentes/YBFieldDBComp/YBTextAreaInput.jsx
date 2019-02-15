var React = require('react');

var YBTextAreaInputBase = {

    render: function() {
        var value = this.props.input.inputValue ? this.props.input.inputValue : "";

        return  <div className="">
                    <textarea
                        key = { this.props.input.inputKey }
                        ref = { this.props.input.inputRef }
                        id = { this.props.input.inputKey }
                        name = { this.props.input.inputName }
                        className = "YBTextAreaInput form-control"
                        rows = "3"
                        value = { value }
                        disabled = { this.props.input.inputDisabled }
                        autoFocus = { this.props.input.inputAutoFocus }
                        required = { this.props.input.inputRequired }
                        onKeyDown = { this.props.onKeyDown }
                        onChange = { this.props.onChange }
                        onBlur = { this.props.onBlur }
                        onFocus = { this.props.onFocus }/>
                    <span className="help-block"></span>
                </div>;
    }
};

var YBTextAreaInput = React.createClass(YBTextAreaInputBase);

module.exports.generaYBTextAreaInput = function(objAtts, objFuncs)
{
    return  <YBTextAreaInput
                input = { objAtts.input }
                onKeyDown = { objFuncs.onKeyDown }
                onChange = { objFuncs.onChange }
                onBlur = { objFuncs.onBlur }
                onFocus = { objFuncs.onFocus }/>;
};