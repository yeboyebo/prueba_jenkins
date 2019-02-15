var React = require('react');
var Formatter = require("../../data/format.js");

var YBNumberInputBase = {

    getInitialState: function() {
        // value con comas en decimales(formatear antes de enviar en blur)
        // isFocused para focus
        // isSelected para hacer el select con el primer focus(Conflicto con setstate)
        return {
            value: this.formatValue(this.props.input.inputValue),
            isfocused: false,
            isSelected: false
        };
    },

    _onNumberFocus: function(event) {
        this.props.onFocus(event);
        this.setState({isfocused: true, isSelected: false, value: this.formatValue(this.props.input.inputValue)});
        event.target.select();
    },

    _onKeyDown: function(event) {
        //event.preventDefault();
        if(event.which == 13){
            this._onBlur(event);
            this.props.onKeyDown(event);
        }
    },

    _onKeyPress: function(event) {
        const numberPattern = /[0-9,\-]+/g;
        //const valuePattern = /^\-?[0-9]+(,[0-9]{0,1})?$/g;
        // Controlamos que solo pueda poner una coma decimal
        var decimalCount = event.target.value.split(",");
        if((event.which == 44 || event.which == 46) && decimalCount.length > 1){
            event.preventDefault();
            return;
        }
        // Convertimos . en ,
        if(event.which == 46)
        {
            event.preventDefault();
            event.target.value += ",";
            return;
        }
        // Controlamos que solo se puedan introducir el patron
        if (!numberPattern.test(event.key)) {
            event.preventDefault();
            return;
        }
    },

    _onChange: function(event) {
        var maxDigits = "+";
        if(this.props.maxDigits){
            maxDigits = "{1," + this.props.maxDigits + "}";
        }
        const valuePattern = new RegExp("^\\-?[0-9]" + maxDigits + "(,[0-9]{0," + (this.props.decimalPlaces) + "})?$");
        //console.log(valuePattern);
        if(event.target.value && event.target.value != "-" && !valuePattern.test(event.target.value)){
            return;
        }
        this.setState({value: event.target.value});
        //this.props.onChange(event);
    },

    _onBlur: function(event) {
        if (event.target.value == "-" || event.target.value == ","){
            event.target.value = 0;
            this.props.onBlur(event, this.unFormatValue(0));
            this.setState({value: 0});
        } else{
            this.props.onBlur(event, this.unFormatValue(this.state.value));
            this.setState({isfocused: false, isSelected: false});
        }
    },

    formatPrettyval: function(val) {
        var format = Formatter.fromJSONfunc(this.props.input.inputType);
        //console.log(this.props.input.inputKey, this.props.input.inputType)
        return format(val);
    },

    unFormatValue: function(val) {
        if(val)
            val = val.toString().replace(",", ".");
        else val = null;
        return val;
    },

    formatValue: function(val) {
        if(val)
            val = val.toString().replace(".", ",");
        else val = null;
        return val;
    },

    componentDidUpdate: function() {
        if(this.state.isfocused && !this.state.isSelected){
            this.refs[this.props.input.inputRef].select();
            this.setState({isSelected: true})
        }
    },

    render: function() {
        var value = this.state.value;
        if(!this.state.isfocused)
            value = this.formatPrettyval(this.props.input.inputValue);
        return  <input
                    key = { this.props.input.inputKey }
                    ref = { this.props.input.inputRef }
                    id = { this.props.input.inputKey }
                    name = { this.props.input.inputName }
                    className = "YBNumberInput form-control numberField"
                    type = "string"
                    value = { value}
                    disabled = { this.props.input.inputDisabled }
                    autoFocus = { this.props.input.inputAutoFocus }
                    required = { this.props.input.inputRequired }
                    onKeyDown = { this._onKeyDown }
                    onChange = { this._onChange }
                    onBlur = { this._onBlur }
                    onKeyPress = { this._onKeyPress }
                    onFocus = { this._onNumberFocus }/>;
    }
};

var YBNumberInput = React.createClass(YBNumberInputBase);

module.exports.generaYBNumberInput = function(objAtts, objFuncs)
{
    var decimalPlaces = 0;
    var maxDigits = null;
    if("decimal_places" in objAtts.modelfield)
        decimalPlaces = objAtts.modelfield.decimal_places;
    if("max_digits" in objAtts.modelfield)
        maxDigits = objAtts.modelfield.max_digits;
    return  <YBNumberInput
                input = { objAtts.input }
                decimalPlaces = { decimalPlaces }
                maxDigits = { maxDigits }
                onKeyDown = { objFuncs.onKeyDown }
                onChange = { objFuncs.onChange }
                onBlur = { objFuncs.onBlur }
                onFocus = { objFuncs.onFocus }/>;
};