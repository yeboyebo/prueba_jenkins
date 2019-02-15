var React = require("react");

var YBComponentInfoItemBase = {

    _onClickGridIcon: function() {
        $("." + this.props.name).toggleClass("hidden");
    },

    _renderComponentInfo: function() {
        var componentInfo = [];
        var label = this.props.INFO ? this.props.INFO : this.props.LAYOUT.hasOwnProperty("label") ? this.props.LAYOUT.label : null;
        var iconClassname = "material-icons YBComponentInfoIcon";
        var labelClassName = "YBComponentInfoText";
        if(this.props.LAYOUT.hasOwnProperty("icon")) {
            let keyI = this.props.name + "_InfoIcon";
            componentInfo.push(<i key = { keyI } onClick={this._onClickGridIcon} className={ iconClassname }>{ this.props.LAYOUT.icon }</i>);
        }
        if(label) {
            let keyL = this.props.name + "_InfoLabel";
            componentInfo.push(<div key = { keyL } className={ labelClassName }>{label}</div>);
        }
        return componentInfo;
    },

    render: function() {
        var componentInfo = this._renderComponentInfo();
        var componentInfoClassname = "YBComponentInfo"
        if (this.props.LAYOUT.hasOwnProperty("className")) {
           componentInfoClassname += " " + this.props.LAYOUT["className"];
        }
        return  <div className={ componentInfoClassname }>{ componentInfo }</div>;
    }
};

var YBComponentInfoItem = React.createClass(YBComponentInfoItemBase);

module.exports.generaYBComponentInfo = function(objAtts, objFuncs)
{
    var name = objAtts.name + "_Info";
    return  <YBComponentInfoItem
                key = { name }
                name = { objAtts.name }
                LAYOUT = { objAtts.LAYOUT }
                INFO = { objAtts.INFO }/>;
};
