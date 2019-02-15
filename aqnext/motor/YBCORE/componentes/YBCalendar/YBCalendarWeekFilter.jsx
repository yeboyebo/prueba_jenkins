var React = require("react");
var URLResolver = require("../../navegacion/URLResolver.js");
var YBButton = require("../YBButton.jsx");
var YBSelectFieldDB = require("../YBFieldDBComp/YBSelectFieldDB.jsx");

var styles = {
    "button": {
        "marginTop": "10px",
        "position": "relative",
        "float": "left"
    },
    "date": {
        "margin": "17px",
        "position": "relative",
        "float": "left"
    },
    "select": {
        "width": "30px"
    }
};

var YBCalendarWeekFilter = React.createClass({

    _onclick: function(val) {
        this.props.changeCurrentWeek(val);
    },

    _renderSelectNumberWeeks: function() {
        var filtros = {"1": 1, "2": 2, "6": 6};
        var layout = {};
        var data = [];

        layout["clientoptionslist"] = filtros;
        data["numberWeeks"] = this.props.numberWeeks;
        var objAtts = {
            "layoutName": "YBSelectNumberWeeks",
            "fieldName": "numberWeeks",
            "modelfield": "numberWeeks",
            "SCHEMA": {},
            "DATA": data,
            "LAYOUT": layout,
        };
        var objFuncs = {
            "onChange": this.props.onNumberWeeksChange
        };
        return YBSelectFieldDB.generaYBSelectFieldDB(objAtts, objFuncs);
    },

    _renderButton: function(val) {
        var icon = val == 1 ? "navigate_next" : "navigate_before";
        var objAtts = {
            "name": "weekButtonFilter" + val,
            "layout": {
                "actionType": "button",
                "label": "",
                "icon": icon,
                "buttonType": "raised",
                "primary": true,
                "secondary": false,
                "style": styles.button,
                "action": null,
                "prefix": null
            }
        };
        var objFuncs = {
            "lanzarAccion": null,
            "onClick": this._onclick.bind(this, val)
        };
        return YBButton.generaYBButton(objAtts, objFuncs);
    },

    render: function() {
        var selectFilterWeek = this._renderSelectNumberWeeks();
        var filterNextButton = this._renderButton(1);
        var filterPreviousButton = this._renderButton(-1);
        var style = {
            "marginRight": "0px",
            "marginLeft": "0px",
        };
        return  <div id="YBCalendarWeekFilter">
                    <div className="YBCalendarWeekSelect">{ selectFilterWeek }</div>
                    <div className="YBCalendarWeekPreButton">{ filterPreviousButton }</div>
                    <div className="YBCalendarWeekInfo">{ this.props.currentWeek + 1 } - 6</div>
                    <div className="YBCalendarWeekNextButton">{ filterNextButton }</div>
                </div>;
    }
});

module.exports.generaYBCalendarWeekFilter = function(objAtts, objFuncs)
{
    return  <YBCalendarWeekFilter
                name = { objAtts.name }
                key = { objAtts.name }
                LAYOUT = { objAtts.LAYOUT }
                month = { objAtts.month }
                numberWeeks = { objAtts.numberWeeks }
                currentWeek = { objAtts.currentWeek }
                changeCurrentWeek = { objFuncs.changeCurrentMoth }
                onNumberWeeksChange = { objFuncs.onNumberWeeksChange }/>;
};
