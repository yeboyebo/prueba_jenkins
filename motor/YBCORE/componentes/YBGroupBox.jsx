var React = require("react");
var _ = require("underscore");
var YBGrid = require("./YBGridComp/YBGrid.jsx");
var YBFieldDB = require("./YBFieldDBComp/YBFieldDB.jsx");
var YBFileInput = require("./YBFieldDBComp/YBFileInput.jsx");
var YBChart = require("./YBChartComp/YBChart.jsx");
var YBForm = require("./YBFormComp/YBForm.jsx");
var YBMultiForm = require("./YBFormComp/YBMultiForm.jsx");
var YBButton = require("./YBButton.jsx");
var YBLabel = require("./YBLabel.jsx");
var YBWizard = require("./YBWizard.jsx");
var YBGroupBoxContainer = require("./YBGroupBoxContainer.jsx");
var YBCalendar = require("./YBCalendar/YBCalendar.jsx");
var YBSeparator = require("./YBSeparator.jsx");
var YBComponentInfo = require("./YBComponentInfo.jsx");
//tmp
var YBTpv = require("./YBTpvComp/YBTpv.jsx");
var YBTpvTables = require("./YBTpvComp/YBTpvTablesComp/YBTpvTables.jsx");
var YBTpvKeyboard = require("./YBTpvComp/YBTpvKeyboardComp/YBTpvKeyboard.jsx");

var YBGroupBoxBase = {

    _renderComponent: function(component, keyc, acciones) {
        let gbDisabled = false;
        let componentInfo = false;
        if (this.props.YB.drawIf && this.props.name in this.props.YB.drawIf && keyc in this.props.YB.drawIf[this.props.name] && this.props.YB.drawIf[this.props.name][keyc] == "hidden") {
            return "";
        }
        if (this.props.YB.drawIf && this.props.name in this.props.YB.drawIf && keyc in this.props.YB.drawIf[this.props.name] && this.props.YB.drawIf[this.props.name][keyc] == "disabled") {
            gbDisabled = true;
        }
        else if ("disabled" in this.props && this.props.disabled) {
            gbDisabled = true;
        }

        if (component.prefix == "master") {
            component.prefix = this.props.PREFIX;
        }

        if (component.hasOwnProperty("visible") && component.visible == false) {
            return null;
        }

        if (component.hasOwnProperty("label") || component.hasOwnProperty("icon") || (this.props.YB.info && this.props.YB.info.model && this.props.YB.info.model.hasOwnProperty(keyc))) {
            let info = (this.props.YB.info && this.props.YB.info.model) ? this.props.YB.info.model.hasOwnProperty(keyc) ? this.props.YB.info.model[keyc] : null : null;
            let objAtts = {
                "name": keyc,
                "LAYOUT": component,
                "INFO": info
            };
            let objFuncs = {
            };
            let cKey = keyc + "_InfoBox";
            componentInfo = <div key = { cKey }>{ YBComponentInfo.generaYBComponentInfo(objAtts, objFuncs) }</div>;
        }

        switch (component.componente) {
            case "YBForm": {
                let submit = null;
                if (component.submit) {
                    submit = component.submit;
                }
                let data = this.props.YB[component.prefix].DATA[0] ? this.props.YB[component.prefix].DATA[0] : this.props.YB[component.prefix].DATA;

                let objAtts = {
                    "name": keyc,
                    "DATA": data,
                    "SCHEMA": this.props.YB[component.prefix].SCHEMA,
                    "LAYOUT": component,
                    "APLIC": this.props.APLIC,
                    "drawIf": this.props.YB.drawIf,
                    "prefix": this.props.PREFIX,
                    "multiForm": false,
                    "focus": this.props.FOCUS,
                    "disabled": "disabled" in this.props && this.props.disabled ? true : false,
                    "bufferChange": true,
                    "labels": this.props.YB.labels
                };
                let objFuncs = {
                    "onSubmit": submit,
                    "lanzarAccion": this.props.lanzarAccion,
                    "onBufferChange": this.props.onBufferChange,
                    "onClientBufferChange": this.props.onClientBufferChange,
                    "onChange": this.props.onChange,
                    "addPersistentData": this.props.addPersistentData
                };
                let cKey = keyc + "_Box";
                return <div key = { cKey } className="groupBoxComponent">{ componentInfo }{ YBForm.generaYBForm(objAtts, objFuncs) }</div>;
            }
            case "YBMultiForm": {
                let data = {}, schema = {};
                for (let f in component.forms) {
                    data[component.forms[f].prefix] = this.props.YB[component.forms[f].prefix].DATA[0] ? this.props.YB[component.forms[f].prefix].DATA[0] : this.props.YB[component.forms[f].prefix].DATA;
                    schema[component.forms[f].prefix] = this.props.YB[component.forms[f].prefix].SCHEMA;
                }

                let objAtts = {
                    "name": keyc,
                    "DATA": data,
                    "schema": schema,
                    "LAYOUT": component,
                    "aplic": this.props.APLIC,
                    "bufferChange": true,
                    "drawIf": this.props.YB.drawIf,
                    "focus": this.props.FOCUS,
                    "disabled": "disabled" in this.props && this.props.disabled ? true : false,
                    "labels": this.props.YB.labels,
                    "relSchema": this.props.SCHEMA || {}
                };
                let objFuncs = {
                    "lanzarAccion": this.props.lanzarAccion,
                    "onBufferChange": this.props.onBufferChange,
                    "onChange": this.props.onChange,
                    "addPersistentData": this.props.addPersistentData
                };
                let cKey = keyc + "_Box";
                return <div key = { cKey } className="groupBoxComponent">{ componentInfo }{ YBMultiForm.generaYBMultiForm(objAtts, objFuncs) }</div>;
            }
            case "YBTable":
            case "YBList":
            case "YBGrid": {
                let objAtts = {
                    "name": keyc,
                    "STATICURL": this.props.STATICURL,
                    "YB": this.props.YB[component.prefix],
                    "drawIf": this.props.YB.drawIf,
                    "YBparent": this.props.YB[this.props.PREFIX],
                    "LAYOUT": component,
                    "acciones": acciones,
                    "PREFIX": this.props.PREFIX
                };
                let objFuncs = {
                    "lanzarAccion": this.props.lanzarAccion,
                    "onDataChange": this.props.onDataChange,
                    "onYBChange": this.props.onYBChange,
                    "onBufferChange": this.props.onBufferChange
                };
                let cKey = keyc + "_Box";
                return <div key = { cKey } className="groupBoxComponent">{ componentInfo }{ YBGrid.generaYBGrid(objAtts, objFuncs) }</div>;
            }
            case "YBDetail": {
                let value;
                if ("key" in component) {
                    value = this.props.YB[component.prefix].DATA[component["key"]];
                }
                else {
                    value = component.text;
                }
                return  <div key={ keyc } className={ component.className }>
                            { value }
                        </div>;
            }
            case "YBFileInput": {
                let schema = {};
                let relData = false;
                let data = this.props.YB["otros"][component.key];
                schema["verbose_name"] = keyc;
                schema["required"] = true;
                if ("disabled" in component) {
                    schema["disabled"] = component.disabled;
                }
                else if (this.props.YB.drawIf && this.props.name in this.props.YB.drawIf && keyc in this.props.YB.drawIf[this.props.name] && this.props.YB.drawIf[this.props.name][keyc] == "disabled") {
                    schema["disabled"] = true;
                }
                else if (gbDisabled) {
                    schema["disabled"] = true;
                }

                schema["tipo"] = component.tipo;
                schema["auto"] = component.auto;
                if (component.defaultvalue && !data) {
                    schema["defaultvalue"] = component.defaultvalue;
                }
                schema["className"] = component.className;

                let YB = {};
                if (component.hasOwnProperty("prefix") && component.prefix != "otros") {
                    YB = this.props.YB[component.prefix].DATA;
                }
                else {
                    YB = this.props.YB["otros"];
                }

                let onBufferChange = this.props.onBufferChange;
                if (component.prefix && component.prefix == "otros" && component.clientBch) {
                    onBufferChange = this.props.onClientBufferChange;
                }
                else if (component.prefix && component.prefix == "otros") {
                    onBufferChange = null;
                }

                let objAtts = {
                    "layoutName": keyc,
                    "fieldName": component.key,
                    "modelfield": schema,
                    "SCHEMA": schema,
                    "DATA": YB,
                    "modeldata": this.props.YB[this.props.PREFIX].DATA,
                    "relData": relData,
                    "prefix": this.props.PREFIX,
                    "focus": this.props.FOCUS,
                    "related": {},
                    "LAYOUT": component,
                    "actions": component.actions,
                    "calculate": this.props.YB["related"],
                    "user": this.props.YB["otros"].idusuario
                };
                let objFuncs = {
                    "onChange": this.props.onFieldChange,
                    "onClientBufferChange": this.props.onClientBufferChange,
                    "lanzarAccion": this.props.lanzarAccion,
                    "addPersistentData": this.props.addPersistentData
                };
                let cKey = keyc + "_Box";
                return <div key = { cKey } className="groupBoxComponent">{ YBFileInput.generaYBFileInput(objAtts, objFuncs) }</div>;
            }
            case "YBFieldDB": {
                let schema = {};
                let relData = false;
                let data = this.props.YB["otros"][component.key];
                schema["verbose_name"] = keyc;
                schema["required"] = false;
                if ("disabled" in component) {
                    schema["disabled"] = component.disabled;
                }
                else if (this.props.YB.drawIf && this.props.name in this.props.YB.drawIf && keyc in this.props.YB.drawIf[this.props.name] && this.props.YB.drawIf[this.props.name][keyc] == "disabled") {
                    schema["disabled"] = true;
                }
                else if (gbDisabled) {
                    schema["disabled"] = true;
                }

                schema["tipo"] = component.tipo;
                schema["auto"] = component.auto;
                if (component.defaultvalue && !data) {
                    schema["defaultvalue"] = component.defaultvalue;
                }
                schema["className"] = component.className;

                let YB = {};
                if (component.hasOwnProperty("prefix") && component.prefix != "otros") {
                    YB = this.props.YB[component.prefix].DATA;
                }
                else {
                    YB = this.props.YB["otros"];
                }

                let onBufferChange = this.props.onBufferChange;
                if (component.prefix && component.prefix == "otros" && component.clientBch) {
                    onBufferChange = this.props.onClientBufferChange;
                }
                else if (component.prefix && component.prefix == "otros") {
                    onBufferChange = null;
                }

                let objAtts = {
                    "layoutName": keyc,
                    "fieldName": component.key,
                    "modelfield": schema,
                    "SCHEMA": schema,
                    "DATA": YB,
                    "modeldata": this.props.YB[this.props.PREFIX].DATA,
                    "relData": relData,
                    "prefix": this.props.PREFIX,
                    "focus": this.props.FOCUS,
                    "related": {},
                    "LAYOUT": component,
                    "actions": component.actions,
                    "calculate": this.props.YB["related"],
                    "countFields": 1
                };
                let objFuncs = {
                    "onChange": this.props.onFieldChange,
                    "onBufferChange": onBufferChange,
                    "onClientBufferChange": this.props.onClientBufferChange,
                    "lanzarAccion": this.props.lanzarAccion,
                    "addPersistentData": this.props.addPersistentData
                };
                let cKey = keyc + "_Box";
                return <div key = { cKey } className="groupBoxComponent">{ YBFieldDB.generaYBFieldDB(objAtts, objFuncs) }</div>;
            }
            case "YBNewRecord": {
                let clase = "btn btn-fab btn-" + component.class;
                let icon = "add";
                if (component.icon) {
                    icon = component.icon;
                }

                return  <div
                            className="floatButton"
                            key="floatButton">
                                <a
                                    href="javascript:void(0)"
                                    className={ clase }
                                    onClick={ this.props.newRecord }>
                                        <i className="material-icons">{ icon }</i>
                                </a>
                        </div>;
            }
            case "YBNewRecordGoTo": {
                let clase = "btn btn-fab btn-" + component.class;
                let icon = "add";
                if (component.icon) {
                    icon = component.icon;
                }

                return  <div
                            className="floatButton"
                            key="floatButton">
                                <a
                                    href={ component.goto }
                                    className={ clase }>
                                        <i className="material-icons">{ icon }</i>
                                </a>
                        </div>;
            }
            case "YBButton": {
                let layout = _.extend({}, component);
                if (this.props.YB.drawIf && this.props.name in this.props.YB.drawIf && keyc in this.props.YB.drawIf[this.props.name] && this.props.YB.drawIf[this.props.name][keyc] == "disabled") {
                    layout["disabled"] = true;
                }
                else if (this.props.YB.drawIf["parentGroupBox"] && this.props.name in this.props.YB.drawIf["parentGroupBox"] && keyc in this.props.YB.drawIf["parentGroupBox"][this.props.name] && this.props.YB.drawIf["parentGroupBox"][this.props.name][keyc] == "disabled") {
                    layout["disabled"] = true;
                }
                else if (this.props.YB.drawIf && this.props.name in this.props.YB.drawIf && keyc in this.props.YB.drawIf[this.props.name] && this.props.YB.drawIf[this.props.name][keyc] == true) {
                    layout["disabled"] = false;
                }
                else if (gbDisabled) {
                    layout["disabled"] = true;
                }
                else {
                    layout["disabled"] = "disabled" in component ? component["disabled"] : false;
                }

                let objAtts = {
                    "name": keyc,
                    "layout": layout
                };
                let objFuncs = {
                    "lanzarAccion": this.props.lanzarAccion
                };
                let cKey = keyc + "_Box";
                return YBButton.generaYBButton(objAtts, objFuncs);
                return <div key = { cKey } className="groupBoxComponent">{ YBButton.generaYBButton(objAtts, objFuncs) } </div>;
            }
            case "YBLabel": {
                let alias = this.props.PREFIX;
                if (component.hasOwnProperty("alias")) {
                    alias = component.alias;
                }
                let objAtts = {
                    "name": keyc,
                    "layout": component,
                    "modelData": this.props.YB[alias].DATA,
                    "modelSchema": this.props.YB[alias].SCHEMA,
                    "relData": this.props.YB.related,
                    "labelData": this.props.YB.labels
                };
                let objFuncs = {};
                return YBLabel.generaYBLabel(objAtts, objFuncs);
            }
            case "YBWizard": {
                let objAtts = {
                    "name": keyc,
                    "clases": component.className,
                    "data": this.props.YB,
                    "aplic": this.props.APLIC,
                    "layout": component,
                    "acciones": acciones,
                    "prefix": this.props.PREFIX,
                    "focus": this.props.FOCUS
                };
                let objFuncs = {
                    "lanzarAccion": this.props.lanzarAccion,
                    "onBufferChange": this.props.onBufferChange,
                    "onChange": this.props.onChange,
                    "onFieldChange": this.props.onFieldChange,
                    "newRecord": this.props._newRecord,
                    "onDataChange": this.props.onDataChange
                };
                return YBWizard.generaYBWizard(objAtts, objFuncs);
            }
            case "YBChart": {
                let data = {}
                if (component.hasOwnProperty("prefix") && component.prefix != "otros") {
                    data = this.props.YB[component.prefix].DATA;
                }
                else if (component.hasOwnProperty("prefix") && component.prefix == "otros") {
                    data = this.props.YB["otros"];
                }
                else {
                    data = this.props.YB[this.props.PREFIX].DATA;
                }

                let objAtts = {
                    "name": keyc,
                    "data": data,
                    "relData": this.props.YB[component.subtable] ? this.props.YB[component.subtable].DATA : false,
                    "layout": component,
                    "aplic": this.props.APLIC,
                    "prefix": this.props.PREFIX
                };
                let objFuncs = {
                    "lanzarAccion": this.props.lanzarAccion
                };
                return YBChart.generaYBChart(objAtts, objFuncs);
            }
            case "YBGroupBox": {
                let info = false;
                let cKey = keyc + "_Box";
                if (componentInfo) {
                    info = <div key = { cKey } className="groupBoxComponent">{ componentInfo }</div>;
                }
                cKey = keyc + "_BoxGroup";
                return <div key = { cKey }> { info }  <YBGroupBox
                            key = { keyc || "parentGroupBox" }
                            name = { keyc || "parentGroupBox" }
                            clases = { component.className }
                            style = { component.style }
                            YB = { this.props.YB }
                            APLIC = { this.props.APLIC }
                            LAYOUT = { component.layout }
                            ACCIONES = { acciones }
                            PREFIX = { this.props.PREFIX }
                            FOCUS = { this.props.FOCUS }
                            SCHEMA = { this.props.SCHEMA }
                            disabled = { gbDisabled }
                            STATICURL = { this.props.STATICURL }
                            lanzarAccion = { this.props.lanzarAccion }
                            onBufferChange = { this.props.onBufferChange }
                            onClientBufferChange = { this.props.onClientBufferChange }
                            onChange = { this.props.onChange }
                            onFieldChange = { this.props.onFieldChange }
                            newRecord = { this.props._newRecord }
                            onDataChange = { this.props.onDataChange }
                            addPersistentData = { this.props.addPersistentData }
                            onActiveGroupBox = { this.props.onActiveGroupBox }/></div>;
            }
            case "YBGroupBoxContainer": {
                var drawIfCond = this.props.YB.drawIf.hasOwnProperty(keyc) ? this.props.YB.drawIf[keyc] : null;
                let objAtts = {
                    "name": keyc,
                    "clases": component.className,
                    "staticurl": this.props.STATICURL,
                    "data": this.props.YB,
                    "layout": this.props.LAYOUT[keyc],
                    "aplic": this.props.APLIC,
                    "prefix": this.props.PREFIX,
                    "acciones": acciones,
                    "focus": this.props.FOCUS,
                    "schema": this.props.SCHEMA,
                    "drawIf": drawIfCond
                };
                let objFuncs = {
                    "lanzarAccion": this.props.lanzarAccion,
                    "onBufferChange": this.props.onBufferChange,
                    "onClientBufferChange": this.props.onClientBufferChange,
                    "onChange": this.props.onChange,
                    "onFieldChange": this.props.onFieldChange,
                    "newRecord": this.props._newRecord,
                    "onDataChange": this.props.onDataChange,
                    "addPersistentData": this.props.addPersistentData,
                    "onYBChange": this.props.onYBChange,
                    "onActiveGroupBox": this.props.onActiveGroupBox
                };
                return YBGroupBoxContainer.generaYBGroupBoxContainer(objAtts, objFuncs);
            }
            case "YBTpv": {

                let objAtts = {
                    "name": keyc,
                    "staticurl": this.props.STATICURL
                };
                return YBTpv.generate(objAtts);
            }
            case "YBTpvTables": {

                // tmp
                let objAtts = {
                    "name": keyc,
                    "editable": true,
                    "staticurl": this.props.STATICURL
                };
                return YBTpvTables.generate(objAtts);
            }
            case "YBTpvKeyboard": {

                // tmp
                let objAtts = {
                    "name": keyc,
                    "type": component.type,
                    "onChange": ((value) => { console.log(value); }),
                    "staticurl": this.props.STATICURL
                };
                return YBTpvKeyboard.generate(objAtts);
            }
            case "YBCalendar": {

                let objAtts = {
                    "name": keyc,
                    "staticurl": this.props.STATICURL,
                    "aplic": this.props.APLIC,
                    "prefix": this.props.PREFIX,
                    "YB": this.props.YB[component.prefix],
                    "LAYOUT": component
                };
                let objFuncs = {
                    "lanzarAccion": this.props.lanzarAccion
                };
                return YBCalendar.generaYBCalendar(objAtts, objFuncs);
            }
            case "YBSeparator": {

                let objAtts = {
                    "name": keyc,
                    "LAYOUT": component
                };
                let objFuncs = {
                };
                let cKey = keyc + "_Box";
                return <div key = { cKey } className="groupBoxComponent">{ YBSeparator.generaYBSeparator(objAtts, objFuncs) }</div>;
            }
            default: {
                return null;
            }
        }
    },

    _renderComponents: function() {
        let components = [];

        components = Object.keys(this.props.LAYOUT).map((key) => {
            return this._renderComponent(this.props.LAYOUT[key], key, this.props.ACCIONES);
        });

        if (!this.props.isParent) {
            return components;
        }

        if (this.props.YB["info"] && this.props.YB["info"]["app"] && this.props.APLIC in this.props.YB["info"]["app"] && this.props.YB["info"]["app"][this.props.APLIC]) {
            let app_info = this.props.YB["info"]["app"][this.props.APLIC];
            this.props.YB["appinfo"] = {
                "DATA": app_info["data"],
                "IDENT": []
            };

            let layout_info = {
                "componente": "YBGroupBox",
                "layout": app_info["layout"]
            };

            let labelInfo = this._renderComponent(layout_info, "appinfo", app_info["acciones"]);
            components = [labelInfo].concat(components);
        }

        return components;
    },

    render: function() {
        let componentes = this._renderComponents();
        let clases = "groupbox " + this.props.name + " " + this.props.clases;
        let style = this.props.style || {};
        return  <div className={ clases } style={ style }>
                    { componentes }
                </div>;
    }
};

let YBGroupBox = React.createClass(YBGroupBoxBase);

module.exports.generaYBGroupBox = function(objAtts, objFuncs)
{
    return  <YBGroupBox
                key = { objAtts.name || "YBGroupBox" }
                name = { objAtts.name || "parentGroupBox" }
                isParent = { objAtts.isParent || false }
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
                onActiveGroupBox = { objFuncs.onActiveGroupBox }/>;
};
