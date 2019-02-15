var React = require("react");
var URLResolver = require("../../navegacion/URLResolver.js");
var YBButton = require("../YBButton.jsx");

var styles = {
    "button": {
        "marginTop": "10px",
        "position": "relative",
        "float": "left"
    },
    "date": {
        "margin": "17px",
        "position": "relative"
    }
};

var YBMonthFilter = React.createClass({

    _getDayCellTaskItem: function(task) {
        return "";
    },

    _onclick: function(val) {
        this.props.changeCurrentMoth(val);
    },

    _renderMothFilter: function() {
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        var monthName = monthNames[this.props.month] + " " + this.props.year;
        return 	<div className="YBMonthFilterDate" style={ styles.date }>
        			{ monthName }
        		</div>
    },

    _renderButton: function(val) {
        var icon = val == 1 ? "navigate_next" : "navigate_before";
        var objAtts = {
            "name": "monthButtonFilter" + val,
            "layout": {
                "actionType": "button",
                "label": "",
                "icon": icon,
                "buttonType": 'raised',
                "primary": false,
                "secondary": true,
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
        var monthFilterFormat = this._renderMothFilter();
        var filterNextButton = this._renderButton(1);
        var filterPreviousButton = this._renderButton(-1);
        var style = {
            "marginRight": "0px",
            "marginLeft": "0px",
        };
        return 	<div id="YBMonthFilter">
                    <div className="YBMonthFilterButtons">
                        { filterPreviousButton }
                        { filterNextButton }
                    </div>
                    <div className="YBMonthFilterButtons">
                        { monthFilterFormat }
                    </div>
                </div>;
    }
});

module.exports.generaYBMonthFilter = function(objAtts, objFuncs)
{
    return  <YBMonthFilter
                name = { objAtts.name }
                key = { objAtts.name }
                LAYOUT = { objAtts.LAYOUT }
                month = { objAtts.month }
                year = { objAtts.year }
                onFilterChange = { objFuncs.onFilterChange }
                execFilter = { objFuncs.execFilter }
                changeCurrentMoth = { objFuncs.changeCurrentFilter }/>;
};
