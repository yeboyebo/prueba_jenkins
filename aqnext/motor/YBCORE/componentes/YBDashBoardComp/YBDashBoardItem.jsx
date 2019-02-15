var React = require("react");

var YBDashBoardItemBase = {

    _renderIcon: function() {
        if (!this.props.icon) {
            return "";
        }

        return  <i className="material-icons YBDashBoardIcon">
                    { this.props.icon }
                </i>;
    },

    render: function() {
        var icon = this._renderIcon();
        var href = this.props.rootUrl + (this.props.aplic == "portal" ? this.props.name : this.props.itemUrl);
        if (this.props.type && this.props.type == "absolute") {
            href = this.props.itemUrl;
        }

        var style = {
            "color": this.props.color ? this.props.color : "rgb(215, 30, 30)"
        };

        return  <a className="YBDashBoardItem" href={ href } style={ style }>
                    { icon }
                    { this.props.text.toUpperCase() }
                </a>;
    }
};

var YBDashBoardItem = React.createClass(YBDashBoardItemBase);

module.exports.generaYBDashBoardItem = function(objAtts, objFuncs)
{
    if ("VISIBLE" in objAtts.item && !objAtts.item.VISIBLE) {
        return null;
    }

    return  <YBDashBoardItem
                key = { objAtts.item.NAME }
                name = { objAtts.item.NAME }
                text = { objAtts.item.TEXT }
                icon = { objAtts.item.ICON }
                itemUrl = { objAtts.item.URL }
                color = { objAtts.item.COLOR }
                type = { objAtts.item.TYPE || null}
                aplic = { objAtts.aplic }
                urlStatic = { objAtts.staticUrl }
                rootUrl = { objAtts.rootUrl }/>;
};
