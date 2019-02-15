var React = require("react");
var YBTpvDashBoardItem = require("./YBTpvDashBoardItem.jsx");

var YBTpvDashBoardConfigBase = {

    _onItemClick: function(uri, params) {
        params["configtype"] = this.props.config.type;
        this.props.onItemClick(uri, params);
    },

    _renderTpvDashBoardConfigTitle: function() {
        if (this.props.config && this.props.config.required == "True") {
            return "";
        }
        return  <div className="YBTpvDashBoardConfigTitle">
                    { this.props.config.desc.toUpperCase() }
                </div>;
    },

    _renderTpvDashBoardItems: function() {
        if (!this.props.config) {
            return "";
        }
        if (this.props.config.required == "True") {
            return "";
        }
        return this.props.config.options.map((option) => {
            return YBTpvDashBoardItem.generate({
                "name": this.props.name + "_" + option.key,
                "item": option,
                "qty": false,
                "checked": this.props.getChecked(option.uri),
                "menu": this.props.menu,
                "confmenu": this.props.confmenu,
                "staticurl": this.props.staticurl,
                "onClick": this._onItemClick
            });
        });
    },

    render: function() {
        let tpvDashBoardItems = this._renderTpvDashBoardItems();
        let tpvDashBoardConfigTitle = this._renderTpvDashBoardConfigTitle();

        return  <div className="YBTpvDashBoardConfig">
                    { tpvDashBoardConfigTitle }
                    { tpvDashBoardItems }
                </div>;
    }
};

var YBTpvDashBoardConfig = React.createClass(YBTpvDashBoardConfigBase);

module.exports.generate = function(objAtts)
{
    return  <YBTpvDashBoardConfig
                key = { objAtts.name }
                name = { objAtts.name }
                config = { objAtts.config }
                menu = { objAtts.menu }
                confmenu = { objAtts.confmenu }
                staticurl = { objAtts.staticurl }
                getChecked = { objAtts.getChecked }
                onItemClick = { objAtts.onItemClick }/>;
};
