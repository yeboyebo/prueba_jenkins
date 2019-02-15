var React = require("react");

var URLResolver = require("../../navegacion/URLResolver.js");
var helpers = require("../../navegacion/helpers.js");
var YBFieldDB = require("./YBFieldDB.jsx");
var YBButton = require("../YBButton.jsx");

var YBFileInputBase = {

    getInitialState: function() {
        var disabled = false;
        if(this.props.LAYOUT.hasOwnProperty("fileRequired") && this.props.LAYOUT["fileRequired"]){
            disabled = true;
        }
        return ({
            "disabled": disabled
        })
    },

    _onChange: function(event, val) {
        if(this.state.disabled){
            this.setState({"disabled": false});
        }
        return true;
    },

    _onSubmit: function(e) {
        e.preventDefault();
        var este = this;
        var formData = new FormData(document.getElementById("formUploadFile"));
        /*var files = document.getElementById(this.props.keyc).files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            console.log(file)
            formData.append('fileData', file, file.name);
        }
        formData.append("tengo", true)*/
        var tengoData = false;
        for (var i in this.props.LAYOUT.fields) {
            let item = this.props.LAYOUT.fields[i];
            if($("#" +  item.key).val())
                tengoData = true;

        }

        if (document.getElementById("fileData").value) {
            tengoData = true;
        }
        if (tengoData) {
            if (this.props.LAYOUT.hasOwnProperty("autoUpload") && this.props.LAYOUT.autoUpload == false) {
                formData.append("autoUpload", false);
            }
            var url = URLResolver.getRESTAccionF(this.props.prefix, this.props.DATA.pk, this.props.LAYOUT.action);
            helpers.requestAccionF(url, formData, function(response) {
/*                console.log(response["resul"])
                console.log(response["resul"]["status"])
                console.log(response["resul"].hasOwnProperty["status"] && response["resul"]["status"] == false)
                console.log(response["resul"]["status"] == false)
*/                if (response["resul"] != true){
                    $.toaster({"priority": "warning", "title": "", "message": response["resul"]["msg"]});
                    este.props.lanzarAccion(null, null, "refrescar", null);
                } else { 
                    $.toaster({"priority": "success", "title": "", "message": "Correcto"});
                    este.props.lanzarAccion(null, null, "refrescar", null);
                    if (document.getElementById("fileName")) {
                        document.getElementById("fileName").innerHTML = "Ajuntar Archivo";
                        document.getElementById("fileData").value = "";
                    }
                }
                
            },
            function(xhr, textStatus, errorThrown) {
                $.toaster({"priority": "warning", "title": "", "message": "Error inesperado"});
                if (xhr.status == 400) {
                    console.log(xhr.responseText);
                };
                console.log("error");
                este.props.lanzarAccion(null, null, "refrescar", null);
            });
        } else {
            return true;
        }
    },

    _renderFields: function() {
        if (!this.props.LAYOUT.hasOwnProperty("fields")) {
            return null;
        }
        else {
            var form = [];
            for (var i in this.props.LAYOUT.fields) {
                let item = this.props.LAYOUT.fields[i];
                let schema = {};
                let relData = false;
                let data = this.props.DATA[item.key];
                schema["verbose_name"] = item.key;
                schema["required"] = false;
                if ("disabled" in item) {
                    schema["disabled"] = item.disabled;
                }

                schema["tipo"] = item.tipo;
                schema["auto"] = item.auto;
                if (item.defaultvalue && !data) {
                    schema["defaultvalue"] = item.defaultvalue;
                }
                schema["className"] = item.className;
                let objAtts = {
                    "layoutName": item.key,
                    "fieldName": item.key,
                    "modelfield": schema,
                    "SCHEMA": schema,
                    "DATA": this.props.DATA,
                    "modeldata": this.props.DATA,
                    "relData": relData,
                    "prefix": this.props.prefix,
                    "focus": this.props.FOCUS,
                    "related": {},
                    "LAYOUT": item,
                    "actions": item.actions,
                    "calculate": this.props.DATA["related"],
                    "countFields": 1
                };
                let objFuncs = {
                    "onChange": this.props.onChange,
                    "onBufferChange": this.props.onBufferChange,
                    "onClientBufferChange": this.props.onClientBufferChange,
                    "lanzarAccion": this.props.lanzarAccion,
                    "addPersistentData": this.props.addPersistentData
                };
                form.push(YBFieldDB.generaYBFieldDB(objAtts, objFuncs));
            }
        }
        return form;
    },

    _rendercomp: function() {
        var label = this.props.LAYOUT.label;
        var fields = this._renderFields();
        var style= { "position": "relative", "float": "right"}
        return  <div id="YBFileInput">
                    <form encType="multipart/form-data" action="/gesttare/uploadFile" id="formUploadFile" method="post" onSubmit={ this._onSubmit }>
                        { fields }
                        <input
                            key = { this.props.keyc }
                            ref = { this.props.keyc }
                            id = "fileData"
                            name = "fileData"
                            className = "YBFileInput"
                            type = "file"
                            onChange = { this._onChange }/>
                        <label htmlFor="fileData" className="YBFileInputLabel"><span></span> <strong><svg xmlns="http://www.w3.org/2000/svg" width="20" height="17" viewBox="0 0 20 17"><path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"/></svg> <span id="fileName">Ajuntar Archivo</span></strong></label>
                        <button disabled={ this.state.disabled } name="submit" style={ style } className="YBButtonElement YBButtonSecondary YBButtonRaised" type="submit">{label}</button>
                    </form>

                </div>;
    },

    _changeFile: function(e) {
        var fileName = e.target.value.split( '\\' ).pop();
        document.getElementById("fileName").innerHTML = fileName;
    },

    componentDidMount() {
        document.getElementById("fileData").addEventListener('change', this._changeFile);
    },

    render: function() {
        var rendercomp = this._rendercomp();
        return rendercomp;
    }
};

var YBFileInput = React.createClass(YBFileInputBase);

module.exports.generaYBFileInput = function(objAtts, objFuncs)
{
    return  <YBFileInput
                key = { objAtts.layoutName }
                name = { objAtts.fieldName }
                keyc = { objAtts.layoutName }
                DATA = { objAtts.DATA }
                modeldata = { objAtts.DATA[objAtts.fieldName] }
                modelfield = { objAtts.modelfield }
                relData = { objAtts.relData }
                calculate = { objAtts.calculate }
                modelfocus = { objAtts.focus }
                pkSchema = { objAtts.SCHEMA["pk"] }
                SCHEMA = { objAtts.SCHEMA }
                LAYOUT = { objAtts.LAYOUT }
                prefix = { objAtts.prefix }
                combolimit = { objAtts.combolimit }
                onChange = { objFuncs.onChange }
                onBufferChange = { objFuncs.onBufferChange }
                onClientBufferChange = { objFuncs.onClientBufferChange }
                lanzarAccion = { objFuncs.lanzarAccion }
                addPersistentData = { objFuncs.addPersistentData }
                maindata = { objAtts.modeldata }
                modal = { objAtts.modal }/>;
};
