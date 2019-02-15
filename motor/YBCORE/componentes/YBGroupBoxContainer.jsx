var React = require("react");
var _ = require("underscore");
var YBGroupBox = require("./YBGroupBox.jsx");
var helpers = require("../navegacion/helpers.js");

var YBGroupBoxContainerBase = {

    getInitialState: function() {
        return {
            "header": "",
            "active": null
        };
    },

    _renderComponent: function(component, keyc) {
        var objAtts = {
            "name": keyc,
            "clases": component.className,
            "staticurl": this.props.STATICURL,
            "data": this.props.YB,
            "layout": component.layout,
            "aplic": this.props.APLIC,
            "prefix": this.props.PREFIX,
            "acciones": this.props.ACCIONES,
            "focus": this.props.FOCUS,
            "schema": this.props.SCHEMA
        };
        var objFuncs = {
            "lanzarAccion": this.props.lanzarAccion,
            "onBufferChange": this.props.onBufferChange,
            "onClientBufferChange": this.props.onClientBufferChange,
            "onChange": this.props.onChange,
            "onFieldChange": this.props.onFieldChange,
            "newRecord": this.props._newRecord,
            "onDataChange": this.props.onDataChange,
            "addPersistentData": this.props.addPersistentData,
            "onYBChange": this.props.onYBChange
        };
        return YBGroupBox.generaYBGroupBox(objAtts, objFuncs);
    },

    _getDataFromQuerystring: function(component) {
        var url = window.location.href;
        var params = {};
        var este = this;
        params["FILTER"] = {};
        params["otros"] = _.extend({}, this.props.YB["otros"]);
        params["labels"] = _.extend({}, this.props.YB["labels"]);
        params["querystring"] = component.querystring;

        // Sacamos IDENT de todas las tablas
        if (this.props.YB[this.props.PREFIX].hasOwnProperty("IDENT")) {
            params["FILTER"][this.props.PREFIX] = this.props.YB[this.props.PREFIX].IDENT.FILTER;
        }
        for (var s in this.props.SCHEMA) {
            params["FILTER"][s] = this.props.YB[s].IDENT.FILTER
            if (this.props.YB[s].META.hasOwnProperty("type") && this.props.YB[s].META.type == "query") {
                params["FILTER"][s]["query"] = {}
            }
        }
        helpers.requestAccion(url, params, "PUT", function(response) {
            este.props.onActiveGroupBox(component.querystring, response.data);
        });
    },

    _activeGroupBox: function(key, component) {
        if (this.props.drawIf && key in this.props.drawIf && this.props.drawIf[key] == "disabled") {
            return true;
        }

        $(".gbc_" + this.state.active).toggleClass("active");
        var YB = this._getDataFromQuerystring(component);
        $(".gbc_" + key).toggleClass("active");
        this.setState({"active": key});
    },

    _renderHeader: function(layout, active) {
        var este = this;
        var header = Object.keys(layout).map((key) => {
            var gbDisabled = false;
            if (this.props.drawIf && key in this.props.drawIf && this.props.drawIf[key] == "hidden") {
                return "";
            }
            if (this.props.drawIf && key in this.props.drawIf && this.props.drawIf[key] == "disabled") {
                gbDisabled = true;
            }
            var clasname = "gbContainerItem gbc_" + key;
            if (active == key) {
                clasname += " active";
            }
            if (gbDisabled) {
                clasname += " gbContainerDisabled"
            }

            return 	<div
            			key={ "p_" + key }
            			className={ clasname }
            			style={ {"cursor": "pointer"} }
            			onClick={ este._activeGroupBox.bind(this, key, layout[key]) }>
            				{ key }
            		</div>;
        });

        return	<div>
            		{ header }
        		</div>;
    },

    _renderGroupBox: function() {
        if(!this.state.active) {
            return null
        }

        return this._renderComponent(this.props.LAYOUT.layout[this.state.active], this.state.active);
    },

    componentWillMount: function() {
        name = Object.keys(this.props.LAYOUT.layout)[0];
        var header = this._renderHeader(this.props.LAYOUT.layout, name);
        var url = window.location.href;
        var params = {};
        var este = this;
        params["FILTER"] = {};
        params["otros"] = _.extend({}, this.props.YB["otros"]);
        params["labels"] = _.extend({}, this.props.YB["labels"]);
        params["querystring"] = this.props.LAYOUT.layout[name].querystring;

        if (this.props.YB[this.props.PREFIX].hasOwnProperty("IDENT")) {
            params["FILTER"][this.props.PREFIX] = this.props.YB[this.props.PREFIX].IDENT.FILTER;
        }
        for (var s in this.props.SCHEMA) {
            params["FILTER"][s] = this.props.YB[s].IDENT.FILTER
            if (this.props.YB[s].META.hasOwnProperty("type") && this.props.YB[s].META.type == "query") {
                params["FILTER"][s]["query"] = {}
            }
        }

        helpers.requestAccion(url, params, "PUT", function(response) {
            este.props.onActiveGroupBox(este.props.LAYOUT.layout[name].querystring, response.data);
            este.setState({"header": header, "active": name});
        });
    },

    render: function() {
        var componente = this._renderGroupBox();
        var clases = "groupbox " + this.props.name + " " + this.props.clases;
        var style = this.props.style || {};
        return  <div className={ clases } style={ style }>
                    { this.state.header }
                    { componente }
                </div>;
    }
};

var YBGroupBoxContainer = React.createClass(YBGroupBoxContainerBase);

module.exports.generaYBGroupBoxContainer = function(objAtts, objFuncs)
{
    return  <YBGroupBoxContainer
                key = { objAtts.name || "YBGroupBoxContainer" }
                name = { objAtts.name || "parentGroupBox" }
                clases = { objAtts.clases }
                style = { objAtts.style }
                YB = { objAtts.data }
                APLIC = { objAtts.aplic }
                LAYOUT = { objAtts.layout }
                ACCIONES = { objAtts.acciones }
                PREFIX = { objAtts.prefix }
                FOCUS = { objAtts.focus }
                SCHEMA = { objAtts.schema }
                STATICURL = { objAtts.staticurl }
                lanzarAccion = { objFuncs.lanzarAccion }
                onBufferChange = { objFuncs.onBufferChange }
                onClientBufferChange = { objFuncs.onClientBufferChange }
                onChange = { objFuncs.onChange }
                onFieldChange = { objFuncs.onFieldChange }
                newRecord = { objFuncs.newRecord }
                onDataChange = { objFuncs.onDataChange }
                addPersistentData = { objFuncs.addPersistentData }
                onYBChange = { objFuncs.onYBChange }
                onActiveGroupBox = { objFuncs.onActiveGroupBox }
                drawIf = { objAtts.drawIf }/>;
};
