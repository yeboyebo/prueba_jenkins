var React = require("react");
var ReactDOM = require("react-dom");
var YBNavBar = require("./YBNavBar.jsx");
var URLResolver = require("../navegacion/URLResolver.js");
var helpers = require("../navegacion/helpers.js");

var style = {
    "YBAclAplication" : {
        "width": "20%",
        "overflow": "hidden",
        "float": "left"
    },
    "YBAclTemplates" : {
        "width": "80%",
        "overflow": "hidden",
        "float": "left"
    }
};

var YBAclBase = {

    getInitialState: function() {
        return {
            "aplication": null,
            "acl": this.props.acl
        };
    },

    _renderNavBar: function() {
        var objAtts = {
            "user": this.props.user,
            "superuser": "True",
            "usergroups": null,
            "aplic": this.props.aplic,
            "titulo": "",
            "staticurl": this.props.urlStatic,
            "menuitems": null,
            "rootUrl": this.props.rootUrl,
            "aplicLabel": this.props.aplicLabel
        };
        var objFuncs = {};
        return YBNavBar.generaYBNavBar(objAtts, objFuncs);
    },

    _getTemplates: function(aplic) {
        this.setState({"aplication": aplic});
    },

    _changePermission: function(type, aplic, val, app, isAplic) {
        if (isAplic) {
            this._getTemplates(aplic)
        }
        // console.log(type, aplic, val);
        var este = this;
        // Si es aplic hay que cambiar los permisos de todos sus templates
        //var url = URLResolver.getAclAccion(this.props.prefix, this.props.pk , "changePermision");
        var url = URLResolver.getRESTAccion(this.props.prefix, this.props.pk, "changePermision");
        // console.log(url)
        var oParam = {};
        var tipo = isAplic ? "app" : "tabla";
        oParam["oParam"] = {"permision": type, "rule": aplic, "valor": val, "tipo": tipo, "app": app};
        helpers.requestAccion(url, oParam , "PUT",
            function(response) {
                //console.log("bien, tiene oParam", response);
                var urlRe = window.location.href;
                helpers.requestAccion(urlRe, {}, "PUT", function(response) {
                    este.setState({"acl": response["acl"]});
                });
            },
            function(xhr, textStatus, errorThrown) {
                if (xhr.status == 400) {
                    console.log(xhr.responseText);
                };
            }
        );
    },

    _getAplics: function() {
        var aplications = [];
        var arrAcl = Object.keys(this.state.acl);
        arrAcl.sort();
        var acl_val;

        for (var a in arrAcl) {
            acl_val = arrAcl[a];
            var read = this.state.acl[acl_val].permiso[0] == "r" ? true : false;
            var write = this.state.acl[acl_val].permiso[1] == "w" ? true : false;

            aplications.push(
                <div key={ "showAplic_" + acl_val } >
                    <div>
                        <input
                            key = { acl_val + "_read" }
                            ref = { acl_val + "_read" }
                            id = { acl_val + "_read" }
                            name = { acl_val + "_read" }
                            className = "YBCheckBoxInput"
                            type = "checkbox"
                            checked = { read }
                            onChange = { this._changePermission.bind(this, "read", acl_val, read, false, true) }/>
                        <input
                            key = { acl_val + "_write" }
                            ref = { acl_val + "_write" }
                            id = { acl_val + "_write" }
                            name = { acl_val + "_write" }
                            className = "YBCheckBoxInput"
                            type = "checkbox"
                            checked = { write }
                            onChange = { this._changePermission.bind(this, "write", acl_val, write, false, true) }/><span onClick={ this._getTemplates.bind(this, acl_val) } style={ {"cursor": "pointer"}}>{ acl_val.toUpperCase() }</span>
                    </div>
                </div>)
        };
        return  <div>&nbsp;R&nbsp;&nbsp;&nbsp;&nbsp;W{ aplications }</div>;
    },

    _getAplicTemplates: function() {
        if (!this.state.aplication) {
            return false;
        }

        var templates = [];
        var tObj = this.state.acl[this.state.aplication];

        tObj.templates.map((val, ind) => {
            var read = val.permiso[0] == "r" ? true : false;
            var write = val.permiso[1] == "w" ? true : false;
            var app = val.app;
            templates.push(
                <div key={ "showAplic_" + val.text } >
                    <div>
                        <input
                            key = { val.text + "_read" }
                            ref = { val.text + "_read" }
                            id = { val.text + "_read" }
                            name = { val.text + "_read" }
                            className = "YBCheckBoxInput"
                            type = "checkbox"
                            checked = { read }
                            onChange = { this._changePermission.bind(this, "read", val.name, read, app, false) }/>
                        <input
                            key = { val.text + "_write" }
                            ref = { val.text + "_write" }
                            id = { val.text + "_write" }
                            name = { val.text + "_write" }
                            className = "YBCheckBoxInput"
                            type = "checkbox"
                            checked = { write }
                            onChange = { this._changePermission.bind(this, "write", val.name, write, app, false) }/>{ val.text.toUpperCase() }
                    </div>
                </div>)
        });
        return <div>&nbsp;R&nbsp;&nbsp;&nbsp;&nbsp;W{ templates }</div>;
    },

    render: function() {
        var navBar = this._renderNavBar();
        var aplics = this._getAplics();
        var templates = this._getAplicTemplates();

        return  <div id="parent-container">
                    <div id="YBNavBar">
                        { navBar }
                    </div>
                    <div className="YBAclAplication" style={ style.YBAclAplication }>
                        { aplics }
                    </div>
                    <div className="YBAclTemplates" style={ style.YBAclTemplates }>
                        { templates }
                    </div>
                </div>;
    }
};

var YBAcl = React.createClass(YBAclBase);

module.exports.generaYBAcl = function(domObj, objAtts, objFuncs)
{
    return ReactDOM.render(
        <YBAcl
            acl = { objAtts.acl }
            aplic = { objAtts.aplic }
            aplicLabel = { objAtts.aplicLabel }
            user = { objAtts.user }
            group = { objAtts.group }
            urlStatic = { objAtts.staticUrl }
            rootUrl = { objAtts.rootUrl }
            prefix = { objAtts.prefix }
            pk = { objAtts.pk }/>
        , domObj
    );
};
