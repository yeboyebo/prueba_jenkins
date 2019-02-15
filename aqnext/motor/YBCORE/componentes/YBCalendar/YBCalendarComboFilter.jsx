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

var YBCalendarComboFilter = React.createClass({

    _renderSelectCompo: function() {
        var filtros = {"Mes": "Mes", "Semana": "Semana"};
        var layout = {};
        var data = [];

        layout["clientoptionslist"] = filtros;
        data["comboValue"] = this.props.activeFilter;
        var objAtts = {
            "layoutName": "YBSelectNumberWeeks",
            "fieldName": "comboValue",
            "modelfield": "comboValue",
            "SCHEMA": {},
            "DATA": data,
            "LAYOUT": layout,
        };
        var objFuncs = {
            "onChange": this.props.changeActiveFilter
        };
        return YBSelectFieldDB.generaYBSelectFieldDB(objAtts, objFuncs);
    },

    _renderFilterButtons: function() {
        var filters = [];
        var monthButton = this._renderButtonFilter("Mes", null);
        var weekButton = this._renderButtonFilter("Semana", null);
        filters.push(monthButton);
        filters.push(weekButton);
        return filters;
    },

    _onclickFilter: function(filter) {
        this.props.changeActiveFilter(null, null, filter);
    },

    _renderButtonFilter: function(text, icon) {
        var objAtts = {
            "name": "ButtonFilter" + text,
            "layout": {
                "actionType": "button",
                "label": text,
                "icon": icon,
                "buttonType": 'flat',
                "primary": false,
                "secondary": true,
                "style": styles.button,
                "action": null,
                "prefix": null
            }
        };
        var objFuncs = {
            "lanzarAccion": null,
            "onClick": this._onclickFilter.bind(this, text)
        };
        return YBButton.generaYBButton(objAtts, objFuncs);
    },

    render: function() {
        var selectFilterWeek = this._renderFilterButtons();
        var style = {
            "marginRight": "0px",
            "marginLeft": "0px",
        };
        return  <div id="YBCalendarWeekFilter">
                    <div className="YBCalendarWeekSelect">{ selectFilterWeek }</div>
                </div>;
    }
});

module.exports.generaYBCalendarComboFilter = function(objAtts, objFuncs)
{
    return  <YBCalendarComboFilter
                name = { objAtts.name }
                key = { objAtts.name }
                LAYOUT = { objAtts.LAYOUT }
                month = { objAtts.month }
                numberWeeks = { objAtts.numberWeeks }
                activeFilter = { objAtts.activeFilter }
                changeCurrentWeek = { objFuncs.changeCurrentMoth }
                changeActiveFilter = { objFuncs.changeActiveFilter }/>;
};
