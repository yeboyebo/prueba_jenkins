var React = require("react");
var YBAvatar = require("./YBAvatar.jsx");

import getMuiTheme from "material-ui/styles/getMuiTheme";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";

var NavBar = React.createClass({

    _dameItemsMenu: function() {
        var items = [];
        if (this.props.superuser == "True") {
            items.push({
                "key": "users",
                "value": 1,
                "text": "Gestionar aplicación",
                "href": "/system"
            });
        }
        items.push({
            "key": "account",
            "value": 8,
            "text": "Configuración de cuenta",
            "href": "/account"
        });
        items.push({
            "key": "logout",
            "value": 9,
            "text": "Desconectar",
            "href": "/logout"
        });
        return items;
    },

    _renderAvatar: function() {
        var objAtts = {
            "name": this.props.user,
            "classname": "YBNavBarAvatar",
            "imgDir": this.props.urlStatic + "dist/img/",
            // "img": "users/" + this.props.user,
            "altValue": this.props.user,
            "navbar": true,
            "menuItems": this._dameItemsMenu(),
            "multiselectable": false
        };
        var objFuncs = {};
        return YBAvatar.generaYBAvatar(objAtts, objFuncs);
    },

    _renderTitulo: function(dimensions) {
        if (dimensions.width < 800) {
            return null;
        }

        return  <div className="YBNavBar-title navbar-dashboard">
                    { this.props.titulo }
                </div>;
    },

    _renderSubNavBar: function(dimensions) {
        if (dimensions.width > 800 || !this.props.titulo) {
            return null;
        }

        return  <nav className="navbar navbar-default YBNavBar-sub">
                    <div className="YBNavBar-subtitle navbar-dashboard">
                        { this.props.titulo }
                    </div>
                </nav>;
    },

    _renderSidebarItems: function() {
        var items = [];
        var style = {
            "color": "rgb(215, 30, 30)"
        };
        for (var i in this.props.menu.items) {
/*            var href = this.props.rootUrl + this.props.menu.items[i].URL);
            if ("TYPE" in this.props.menu.items[i] && this.props.menu.items[i].TYPE == "absolute") {
                href = this.props.menu.items[i].URL;
            }*/
            var key = "SidebarItem" + this.props.menu.items[i].NAME;
            var href = this.props.rootUrl + (this.props.aplic == "portal" ? this.props.menu.items[i].NAME : this.props.menu.items[i].URL);
            if (this.props.menu.items[i].type && this.props.menu.items[i].type == "absolute") {
                href = this.props.menu.items[i].URL;
            }
            items.push(<li key={ key } className="YBSidebarItem" style={ style }>
                            <a className="YBSideBarItemLink" href={ href }> { this.props.menu.items[i].TEXT.toUpperCase() } </a>
                        </li>)
        }
        return items;
    },

    _renderSidebar: function(logo, dashboardUrl) {
        // <div className="YBCloseSideBar" onClick={ this._closeSideBar }> Close </div>
        if (this.props.menu && this.props.menu.hasOwnProperty("format") && this.props.menu.format == "navBarMenu") {
            var sidebarItems = this._renderSidebarItems();
            return  <div id="YBSideBar" className="YBSideBar-White" style={ {"display": "none"} }>
                        <div className="YBSideBarTitle">
                            <div className="navbar-img" style={ {"cursor": "pointer"} }>
                                <img src={ logo } className="logo"></img>
                            </div>
                            <a href={ dashboardUrl }>
                                <div className="navbar-dashboard">
                                    INDICE
                                </div>
                            </a>
                        </div>
                        <ul className="YBSiderBarItems">
                            { sidebarItems }
                        </ul>
                    </div>;
        }
        else {
            return "";
        }
    },

    _closeSideBar: function() {
        document.getElementById("YBSideBar").style.display = "none";
        document.getElementById("YBSideBarBlank").style.display = "none";  
    },

    _onLogoClick: function() {
        if (this.props.menu && this.props.menu.hasOwnProperty("format") && this.props.menu.format == "navBarMenu") {
            document.getElementById("YBSideBar").style.display = "block";
            document.getElementById("YBSideBarBlank").style.display = "block";
        }
        else {
            window.location.href = this.props.rootUrl;
        }
    },

    render: function() {
        let dimensions = _getDimensions();
        let logo = this.props.urlStatic + "dist/img/logo/icon.png";
        //let dashboardUrl = this.props.rootUrl + this.props.aplic;
        let dashboardUrl = "/";
        let avatar = this._renderAvatar();
        let titulo = this._renderTitulo(dimensions);
        let subNavBar = this._renderSubNavBar(dimensions);
        let sideBar = this._renderSidebar(logo, dashboardUrl);
        //let sideBar = null;

        return <MuiThemeProvider muiTheme={ getMuiTheme() }>
                <div id="YBNavBar">
                    <nav className="navbar navbar-default YBNavBar-main">
                        <div className="sideBar">
                            { sideBar }
                            <div id="YBSideBarBlank" style={ {"display": "none"} } onClick={ this._closeSideBar }></div>
                        </div>
                        <div className="navbar-header">
                            <div className="navbar-header-left">
                                <div className="navbar-img" style={ {"cursor": "pointer"} } onClick={ this._onLogoClick }>
                                    <img src={ logo } className="logo"></img>
                                </div>
                                <a href={ dashboardUrl }>
                                    <div className="navbar-dashboard">
                                        { this.props.aplicLabel }
                                    </div>
                                </a>
                            </div>

                                { titulo }

                            <div className="navbar-user navbar-header-right">
                                { avatar }
                            </div>
                        </div>
                    </nav>
                    { subNavBar }
                </div>
            </MuiThemeProvider>;
    }
});

function _getDimensions() {
    var w = window,
        d = document,
        documentElement = d.documentElement,
        body = d.getElementsByTagName("body")[0],
        width = w.innerWidth || documentElement.clientWidth || body.clientWidth,
        height = w.innerHeight|| documentElement.clientHeight|| body.clientHeight;

    return {"width": width, "height": height};
};

module.exports.generaYBNavBar = function(objAtts, objFuncs)
{
    if (objAtts.aplic == "portal") {
        objAtts.aplic = "";
    }

    return  <NavBar
                aplic = { objAtts.aplic }
                aplicLabel = { objAtts.aplicLabel }
                titulo = { objAtts.titulo }
                urlStatic = { objAtts.staticurl }
                user = { objAtts.user }
                prefix = { objAtts.prefix }
                superuser = { objAtts.superuser }
                rootUrl = { objAtts.rootUrl }
                menu = { objAtts.menu }/>;
};
