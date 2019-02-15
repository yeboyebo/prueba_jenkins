var React = require("react");
var YBCalendarWeek = require("./YBCalendarWeek.jsx");
var YBFilterForm = require("../YBFormComp/YBFilterForm.jsx");
var YBMonthFilter = require("./YBMonthFilter.jsx");
var YBCalendarWeekFilter = require("./YBCalendarWeekFilter.jsx");
var YBCalendarComboFilter = require("./YBCalendarComboFilter.jsx");
var YBSelectFieldDB = require("../YBFieldDBComp/YBSelectFieldDB.jsx");

var YBCalendar = React.createClass({

    getInitialState: function() {
        return {
            "totalDays": null,
            "firstday": null,
            "month": new Date().getMonth(),
            "year": new Date().getFullYear(),
            "numberWeeks": null,
            "currentWeek": 0,
            "activeFilter": "Mes",
            "filterData": []
        };
    },

    _changeCurrentFilter: function(newFilter) {
        if (this.state.activeFilter == "Mes") {
            var currentMonth = this.state.month + newFilter;
            this._changeCurrentMonth(currentMonth, 0, "Mes");
        }
        else if (this.state.activeFilter == "Semana") {
            var firstday = new Date(this.state.year, this.state.month, 1).getDay() -1;
            var totalDays = new Date(this.state.year, this.state.month, 0).getDate() -1;
            var limit = 5;
            if (firstday < 5 || (firstday == 5 && totalDays == 30)) {
                limit = 4;
            }
            if (this.state.currentWeek + newFilter > limit) {
                var currentMonth = this.state.month + newFilter;
                this._changeCurrentMonth(currentMonth, 0, "Semana");
            } 
            else if (this.state.currentWeek + newFilter < 0) {
                var firstday = new Date(this.state.year, this.state.month - 1, 1).getDay() -1;
                var totalDays = new Date(this.state.year, this.state.month - 1, 0).getDate() -1;
                if (firstday < 5 || (firstday == 5 && totalDays == 30)) {
                    limit = 4;
                }
                var currentMonth = this.state.month + newFilter;
                this._changeCurrentMonth(currentMonth, limit, "Semana");
            } 
            else {
                this.setState({"currentWeek": this.state.currentWeek + newFilter});
            }
/*            if (this.state.currentWeek + newFilter <= 5 && this.state.currentWeek + newFilter >= 0) {
                this.setState({"currentWeek": this.state.currentWeek + newFilter});
            }
            else {
                this._changeCurrentMonth(newFilter, newWeek);
            }*/
        }
    },

    _changeCurrentMonth: function(currentMonth, newWeek, newFilter) {
        //var currentMonth = this.state.month + newMonth;
        //TODO cambiar de año
        // if (currentMonth >= 0 && currentMonth <= 11) {

        //var year = this.state.year;
        let d = new Date();
        //let month = d.getMonth();
        let year = d.getFullYear();
        if (currentMonth < 0) {
            year = year - 1;
            currentMonth = 11;
        }
        if (currentMonth > 11) {
            year = year + 1;
            currentMonth = 0;
        }

        var totalDays = new Date(year, currentMonth + 1, 0).getDate() -1;
        var firstday = new Date(year, currentMonth, 1).getDay() -1;
        var numberWeeks = 6;

        if (firstday < 0) {
            firstday = 6;
        }
/*        if (firstday == 1) {
            firstday = 0;
        }*/
        if (firstday < 5 || (firstday == 5 && totalDays + 1 == 30)) {
            numberWeeks = 5;
        }
        this.setState({"month": currentMonth, "year": year, "totalDays": totalDays, "firstday": firstday, "numberWeeks": numberWeeks, "currentWeek": newWeek, "activeFilter": newFilter});
        var filter = this.props.YB.IDENT.FILTER;
        for (var f in this.props.LAYOUT.monthFilter) {
            filter["s_" + f + "__exact"] = currentMonth + 1;
        }
        this._execFilter(filter);
        // }
    },

    _renderFilterForm: function() {
    	// tmp
        //return "";

        if (!("filter" in this.props.LAYOUT) || typeof(this.props.LAYOUT.filter) != typeof({})) {
            return "";
        }

        var objAtts = {
            "name": "filterForm__" + this.props.name,
            "SCHEMA": this.props.YB.SCHEMA,
            "PREFIX": this.props.LAYOUT.prefix,
            "LAYOUT": this.props.LAYOUT,
            "bufferChange": false,
            "labels": this.props.YB.labels,
            "IDENT": this.props.YB.IDENT,
            "customfilter": this.props.YB.customfilter
        };
        var objFuncs = {
            "execFilter": this._execFilter,
            "lanzarAccion": this.props.lanzarAccion,
            "onBufferChange": () => {},
            "addPersistentData": false
        };
        return YBFilterForm.generaYBFilterForm(objAtts, objFuncs);
    },

    _renderCalendarWeeks: function() {
        var weeks = [];
        var until = this.state.numberWeeks
        if (this.state.activeFilter == "Semana") {
            var until = this.state.currentWeek + 1;
        }
        for (var i = this.state.currentWeek, l = until; i < l; i++) {
            var objAtts = {
                "name": "week" + i,
                "YB": this.props.YB,
                "LAYOUT": this.props.LAYOUT,
                "items": this.props.items,
                "aplic": this.props.APLIC,
                "prefix": this.props.PREFIX,
                "urlStatic": this.props.urlStatic,
                "month": this.state.month,
                "year": this.state.year,
                "totalDays": this.state.totalDays,
                "week": i,
                "firstDay": this.state.firstday,
                "activeFilter": this.state.activeFilter
            };
            var objFuncs = {};
            weeks.push(YBCalendarWeek.generaYBCalendarWeek(objAtts, objFuncs));
        }
        return weeks;
    },

    _renderMonthFilter: function() {
        var objAtts = {
            "name": "monthFilter",
            "LAYOUT": this.props.LAYOUT,
            "urlStatic": this.props.urlStatic,
            "month": this.state.month,
            "year": this.state.year
        };
        var objFuncs = {
            "onFilterChange": this._onFilterChange,
            "execFilter": this._execFilter,
            "changeCurrentFilter": this._changeCurrentFilter
        };
        return YBMonthFilter.generaYBMonthFilter(objAtts, objFuncs);
    },

    _renderWeekFilter: function() {
        var objAtts = {
            "name": "monthFilter",
            "LAYOUT": this.props.LAYOUT,
            "urlStatic": this.props.urlStatic,
            "month": this.state.month,
            "numberWeeks": this.state.numberWeeks,
            "currentWeek": this.state.currentWeek
        };
        var objFuncs = {
            "changeCurrentMoth": this._changeCurrentFilter,
            "onNumberWeeksChange": this._onNumberWeeksChange
        };
        return YBCalendarWeekFilter.generaYBCalendarWeekFilter(objAtts, objFuncs);
    },

    _renderComboFilter: function() {
        var objAtts = {
            "name": "monthFilter",
            "LAYOUT": this.props.LAYOUT,
            "urlStatic": this.props.urlStatic,
            "month": this.state.month,
            "activeFilter": this.state.activeFilter
        };
        var objFuncs = {
            "changeActiveFilter": this._changeActiveFilter
        };
        return YBCalendarComboFilter.generaYBCalendarComboFilter(objAtts, objFuncs);        
    },

    _onNumberWeeksChange: function(key, prefix, val) {
        this.setState({"numberWeeks": val, "currentWeek": 0});
    },

/*    _changeCurrentWeek: function(newWeek) {
        if (this.state.numberWeeks != 5) {
            var currentWeek = this.state.currentWeek + this.state.numberWeeks * newWeek;
            //TODO cambiar de año
            if (currentWeek >= 0 && currentWeek <= 5) {
                this.setState({"currentWeek": currentWeek});
            }
        }
    },*/
    getWeeksNum: function(date) {
        var d = new Date(+date);
        d.setHours(0,0,0);
        d.setDate(d.getDate()+4-(d.getDay()||7));
        return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
    },

    _changeActiveFilter: function(name, prefix, newFilter) {
        let d = new Date();
        let month = d.getMonth();
        let year = d.getFullYear();
        let currentWeek = 0;
        if (newFilter == "Semana") {
            currentWeek = this.getWeeksNum(d) - 1;
        }
        this._changeCurrentMonth(month, currentWeek, newFilter);
       /* let currentWeek = 0;
        let d = new Date();
        let month = d.getMonth();
        let year = d.getFullYear();
        if (newFilter == "Semana") {
            currentWeek = this.getWeeksNum(d) - 1;
        }
        this.setState({"month": month, "year": year,"activeFilter": newFilter, "currentWeek": currentWeek});*/
    },

    _onFilterChange: function(name, prefix, inputKey, inputVal, pk) {
        var fD = this.state.filterData;
        fD[inputKey] = inputVal;

        this.setState({"filterData": fD});
    },

    _onFilterReset: function(fD) {
        this.setState({"filterData": fD});
    },

    _execFilter: function(filtro) {
        var that = this;
        var filter = null;
        delete filtro["p_o"];
        this.props.lanzarAccion(this.props.LAYOUT, this.props.LAYOUT.prefix, "onsearch", null, filtro);
    },

    _renderWeekNames: function() {
        var names = ["Lun. ", "Mar. ", "Mié. ", "Jue. ", "Vie. ", "Sáb. ", "Dom. "];
        var weekNames = [];
        for (var i=0; i<=6; i++) {
            weekNames.push(<div key={ names[i] } className="YBWeekName">{ names[i] }</div>);
        }
        return weekNames;
    },

    componentWillMount: function() {
        var numberWeeks = 6;
        var currentWeek = 0;
        //if (this.props.YB.DATA.length > 0) {
        var d = new Date();
        var month = d.getMonth();
        var year = d.getFullYear();
        var totalDays = new Date(year, month , 0).getDate();
        var firstday = new Date(year, month, 1).getDay();

        if (firstday == 1) {
            firstday = 0;
        } else {
            firstday = firstday - 1;
        }
        if (firstday <= 0) {
            firstday = 6;
        }
        if (firstday <= 5) {
            numberWeeks = 5;
        }
        //}
        //else {
        //    var totalDays = 0;
        //    var firstday = 0;
        //    var month = 0;
        //    var year = 0;
        //}
        this.setState({
        	"totalDays": totalDays,
        	"firstday": firstday,
        	"month": month,
        	"year": year,
        	"numberWeeks": numberWeeks,
            "currentWeek": currentWeek
        });
    },

    componentWillUpdate: function(np, ns) {
        //console.log("component will update");
    },

    render: function() {
        var filterForm = this._renderFilterForm();
        var monthFilter = this._renderMonthFilter();
        var calendarWeeks = this._renderCalendarWeeks();
        var weekNames = this._renderWeekNames();
        var comboFilter = this._renderComboFilter();
        // var weekFilter = this._renderWeekFilter();

        return <div id="YBCalendar">
                    <div className="YBCalendarFilters"> 
                        <div className="YBCalendarFiltersMonth">{ monthFilter}</div>
                        <div className="YBCalendarFiltersWeeks">{ comboFilter }</div>
                    </div>
                    <div className="YBCalendarFilterForm"> { filterForm } </div>
                    <div className="YBCalendarFiltersWeekNames">{ weekNames }</div>
                    { calendarWeeks }
                </div>;
    }
});

function _getItemsFromDataLayout(DATA, LAYOUT) {
    var title = LAYOUT.format.title;
    var date = LAYOUT.format.date;
    var firstday = DATA[0].firstday;
    if (DATA[0].firstday == 0) {
        firstday = 6;
    }

    var items = {};
    DATA.map((item) => {
        var day = item["day"] + firstday;
        if (DATA[0].firstday == 0) {
            day = day - 1;
        }
        else {
            day = day -2;
        }
        if (!items[day]) {
            items[day] = [];
        }
        items[day].push({"pk": item["pk"], "day": item["day"], "title": item[title], "date": item[date]});
    });
    return items;
};

module.exports.generaYBCalendar = function(objAtts, objFuncs)
{
/*    if(this.props.YB.DATA.length > 0) {
        var totalDays = new Date(this.props.YB.DATA[0].year, this.props.YB.DATA[0].month , 0).getDate() - 1;
        var firstday = new Date(this.props.YB.DATA[0].year, this.props.YB.DATA[0].month -1, 1).getDay() - 1;
        if(firstday <= 0) {
            firstday = 6;
        }
        var month = this.props.YB.DATA[0].month;
        var year = this.props.YB.DATA[0].year;
        var numberWeeks = 6;
        var items = _getItemsFromDataLayout(this.props.YB.DATA, objAtts.LAYOUT);
    }
    else {
        //return <div>No hay tareas disponibles</div>;
        var totalDays = 0;
        var firstday = 0;
        var month = 0;
        var year = 0;
    }*/
    var items = [];
    if (objAtts.YB.DATA.length > 0) {
        items = _getItemsFromDataLayout(objAtts.YB.DATA, objAtts.LAYOUT);
    }
    return  <YBCalendar
                name = { objAtts.name }
                key = { objAtts.name }
                YB = { objAtts.YB }
                LAYOUT = { objAtts.LAYOUT }
                items = { items }
                APLIC = { objAtts.aplic }
                PREFIX = { objAtts.prefix }
                urlStatic = { objAtts.staticurl }
                lanzarAccion = { objFuncs.lanzarAccion }/>;
};
