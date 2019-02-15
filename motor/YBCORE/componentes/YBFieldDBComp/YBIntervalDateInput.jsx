var React = require("react");
var _ = require("underscore");
var YBDateInput = require("./YBDateInput.jsx");
var YBSelectFieldDB = require("../YBFieldDBComp/YBSelectFieldDB.jsx");

const today = "hoy";
const yesterday = "ayer";
const thisWeek = "estasemana";
const untilToday = "hastahoy";

var YBIntervalDateInputBase = {

    getInitialState: function() {
        return {
            "interval": null,
            "sValue": null,
            "dValue": null,
            "hValue": null
        };
    },

    _renderSelectFilter: function() {
        var filtros = {};
        for (var f in this.props.customfilter) {
            filtros[f] = f;
        }
        var layout = {};
        layout["clientoptionslist"] = {"Hoy": today, "Ayer": yesterday, "Esta semana": thisWeek, "Hasta hoy": untilToday};
        layout["key"] = "Intervalo";
        var data = [];
        data["intervalDate"] = this.state.interval;
        var objAtts = {
            "layoutName": "YBCustomFilterForm",
            "fieldName": "intervalDate",
            "modelfield": "intervalDate",
            "SCHEMA": {},
            "DATA": data,
            "LAYOUT": layout,
        };
        var objFuncs = {
            "onChange": this._onIntervalSelected
        };
        return YBSelectFieldDB.generaYBSelectFieldDB(objAtts, objFuncs);
    },

    _onIntervalSelected: function(key, prefix, val) {
        var sValue = null;
        var dValue = null;
        var hValue = null;
        // TODO valores
        if (val == null) {
            
        }
        else if (val == today) {
            var date = new Date();
            var day = date.getDate().toString();
            day = day.length > 1 ? day : '0' + day;
            var month = (1 + date.getMonth()).toString();
            month = month.length > 1 ? month : '0' + month;
            var year = date.getFullYear();
            sValue = year + "-" + month + "-" + day;
        }
        else if (val == yesterday) {
            var date = new Date();
            var day = (date.getDate() - 1).toString();
            day = day.length > 1 ? day : '0' + day;
            var month = (1 + date.getMonth()).toString();
            month = month.length > 1 ? month : '0' + month;
            var year = date.getFullYear();
            sValue = year + "-" + month + "-" + day;
            //TODO
        }
        else if (val == thisWeek) {
            var date = new Date();
            var day = date.getDay();
            var firstday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + (day == 0 ? -6 : 1) - day);
            dValue = this._formatDate(firstday);
            var lastday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + (day == 0 ? 0 : 7) - day);
            hValue = this._formatDate(lastday);
        }
        else if (val == untilToday) {
            var date = new Date();
            var day = (date.getDate() - 1).toString();
            day = day.length > 1 ? day : '0' + day;
            var month = (1 + date.getMonth()).toString();
            month = month.length > 1 ? month : '0' + month;
            var year = date.getFullYear();
            hValue = year + "-" + month + "-" + day;
        }
        this.props.propsChange(this.props.input.inputKey, this.props.prefix, sValue);
        this.props.propsChange("d_" + this.props.input.inputKey, this.props.prefix, dValue);
        this.props.propsChange("h_" + this.props.input.inputKey, this.props.prefix, hValue);
        this.props.propsChange("i_" + this.props.input.inputKey, this.props.prefix, val);
        this.setState({"interval": val, "sValue": sValue});
    },

    _formatDate: function(date) {
        var day = date.getDate().toString();
        day = day.length > 1 ? day : '0' + day;
        var month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;
        var year = date.getFullYear();
        var value = year + "-" + month + "-" + day;
        return value;
    },

    _generaDateInput: function() {
        var className = "form-group label-floating col-sm-4";
        var style = {};
        var labelClassName = "control-label";
        var dateInput;
        var dateInput2;

        var objAtts = {
            "input": this.props.input
        };

        var objFuncs = {
            "onKeyDown": this.props.onKeyDown,
            "onChange": this.props.onChange,
            "onBlur": this.props.onBlur,
            "onFocus": this.props.onFocus
        };

        if (this.state.interval == today || this.state.interval == yesterday) {
            objAtts.input.inputValue = this.state.sValue;
            var dateInput = YBDateInput.generaYBDateInput(objAtts, objFuncs);

            return  <div
	                    className={ className }
	                    key={ this.props.input.inputKey }
	                    style={ style }>
	                        <label className={ labelClassName } htmlFor={ this.props.input.inputKey }>
	                            { this.props.input.inputVerboseName }
	                        </label>
	                        { dateInput }
                    </div>;
        }
        else if (this.state.interval == thisWeek || !this.state.interval) {
            var dInput = _.extend({}, {},  this.props.input);
            dInput.inputKey = "d_" + this.props.input.inputKey;
            dInput.inputName = "d_" + this.props.input.inputKey;
            dInput.inputRef = "d_" + this.props.input.inputKey;
            if (this.props.data.hasOwnProperty(dInput.inputKey)) {
                dInput.inputValue = this.props.data[dInput.inputKey];
            }
            dInput.inputVerboseName = "Desde";
            var objAtts = {
                "input": dInput
            };
            var desdeInput = YBDateInput.generaYBDateInput(objAtts, objFuncs);

            var hInput = _.extend({}, {},  this.props.input);
            hInput.inputKey = "h_" + this.props.input.inputKey;
            hInput.inputName = "h_" + this.props.input.inputKey;
            hInput.inputRef = "h_" + this.props.input.inputKey;
            hInput.inputVerboseName = "Hasta";
            if (this.props.data.hasOwnProperty(hInput.inputKey)) {
                hInput.inputValue = this.props.data[hInput.inputKey];
            }
            var objAtts = {
                "input": hInput
            };
            var hastaInput = YBDateInput.generaYBDateInput(objAtts, objFuncs);
            return  <div>
                        <div
                            className={ className }
                            key={ dInput.inputKey }
                            style={ style }>
                                <label className={ labelClassName } htmlFor={ dInput.inputKey }>
                                    { dInput.inputVerboseName }
                                </label>
                                { desdeInput }
                        </div>
                        <div
                            className={ className }
                            key={ hInput.inputKey }
                            style={ style }>
                                <label className={ labelClassName } htmlFor={ hInput.inputKey }>
                                    { hInput.inputVerboseName }
                                </label>
                                { hastaInput }
                        </div>
                    </div>;
        }

    },

    componentWillUpdate: function(np, ns) {
        if ("i_" + this.props.input.inputKey in this.props.data) {
            if (this.props.data["i_" + this.props.input.inputKey] != this.state.interval) {
                this._onIntervalSelected(null, null, this.props.data["i_" + this.props.input.inputKey]);
            }
        }
    },

    render: function() {
        var d1 = this._generaDateInput();
        var dateInterval = this._renderSelectFilter();
        return  <div className = "YBIntervalDateInput col-sm-8">
                    <div className="YBIntervalDateInputInt col-sm-4">{ dateInterval }</div> 
                    <div className="YBIntervalDateInputComp col-sm-8">{ d1 }</div>
                </div>;
    }
};

var YBIntervalDateInput = React.createClass(YBIntervalDateInputBase);

module.exports.generaYBIntervalDateInput = function(objAtts, objFuncs)
{
    return  <YBIntervalDateInput
                input = { objAtts.input }
                prefix = { objAtts.prefix }
                onKeyDown = { objFuncs.onKeyDown }
                onChange = { objFuncs.onChange }
                onBlur = { objFuncs.onBlur }
                onFocus = { objFuncs.onFocus }
                propsChange = { objFuncs.propsChange }
                data =  { objAtts.data }/>;
};
