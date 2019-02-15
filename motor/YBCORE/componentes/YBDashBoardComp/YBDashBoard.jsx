var React = require("react");
var ReactDOM = require("react-dom");
var YBDashBoardItem = require("./YBDashBoardItem.jsx");
var YBNavBar = require("./../YBNavBar.jsx");

var YBDashBoardBase = {

    _renderDashBoardItems: function() {
        return this.props.items.map((item) => {
            var objAtts = {
                "item": item,
                "aplic": this.props.aplic,
                "staticUrl": this.props.staticUrl,
                "rootUrl": this.props.rootUrl
            };
            var objFuncs = {};
            return YBDashBoardItem.generaYBDashBoardItem(objAtts, objFuncs);
        });
    },

    _renderNavBar: function() {
        var objAtts = {
            "user": this.props.user,
            "superuser": this.props.superuser,
            "usergroups": null,
            "aplic": this.props.aplic,
            "titulo": "",
            "staticurl": this.props.urlStatic,
            "menuitems": this.props.items,
            "rootUrl": this.props.rootUrl,
            "aplicLabel": this.props.aplicLabel
        };
        var objFuncs = {};
        return YBNavBar.generaYBNavBar(objAtts, objFuncs);
    },

    render: function() {
        var navBar = this._renderNavBar();
        var dashBoardItems = this._renderDashBoardItems();

        return  <div id="parent-container">
                    <div id="YBNavBar">
                        { navBar }
                    </div>

                    <div className="YBDashBoard">
                        { dashBoardItems }
                    </div>
                </div>;
    }
};

var YBDashBoard = React.createClass(YBDashBoardBase);

module.exports.generaYBDashBoard = function(domObj, objAtts, objFuncs)
{
    return ReactDOM.render(
        <YBDashBoard
            aplic = { objAtts.aplic }
            aplicLabel = { objAtts.aplicLabel }
            items = { objAtts.menuDict }
            user = { objAtts.user }
            superuser = { objAtts.superuser }
            urlStatic = { objAtts.staticUrl }
            rootUrl = { objAtts.rootUrl }/>
        , domObj
    );
};
