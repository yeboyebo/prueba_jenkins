import { RadioButtonGroup, RadioButton } from "material-ui/RadioButton";
var React = require("react");

var YBTpvSelectionModalBase = {

    _onChange: function(ev) {
        ev.persist();
        this.props.onChange(ev.target.value);
    },

    _renderOptions: function() {
        return this.props.param.options.map((option) => {
            return <RadioButton
                    key = { this.props.name + "_option_" + option.value }
                    value = { option.value }
                    label = { option.alias }
                    className="YBRadioButton"/>;
        });
    },

    _getClassName: function() {
        let className = "YBTpvSelectionModal YBRadioButtonGroup";
        return className;
    },

    render: function() {
        let className = this._getClassName();
        let options = this._renderOptions();

        return  <RadioButtonGroup
                    key = { this.props.name }
                    name = { this.props.name }
                    defaultSelected = { this.props.param.value }
                    value = { this.props.param.value }
                    className = { className }
                    onChange = { this._onChange }>
                    { options }
                </RadioButtonGroup>;
    }
};

var YBTpvSelectionModal = React.createClass(YBTpvSelectionModalBase);

module.exports.generate = function(objAtts)
{
    return  <YBTpvSelectionModal
                key = { objAtts.name }
                name = { objAtts.name }
                param = { objAtts.param }
                staticurl = { objAtts.staticurl }
                onChange = { objAtts.onChange }/>;
};
