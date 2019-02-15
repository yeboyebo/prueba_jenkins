var React = require("react");
var YBCalendarDay = require("./YBCalendarDay.jsx");

var YBCalendarWeek = React.createClass({

    getInitialState: function() {
        return {
            "maxlength": 0
        };
    },

    _renderCalendarDays: function() {
        var day = [];
        // console.log(this.props.firstWeekDay)
        var firstWeek = true;
        for (var i = this.props.firstWeekDay, l = this.props.firstWeekDay + 7; i < l; i++) {
            var dayData = {};
            if (i in this.props.items) {
                dayData = this.props.items[i];
            }
            var objAtts = {
                "name": "day" + i,
                "YB": this.props.YB,
                "LAYOUT": this.props.LAYOUT,
                "items": dayData,
                "aplic": this.props.aplic,
                "prefix": this.props.prefix,
                "urlStatic": this.props.urlStatic,
                "month": this.props.month,
                "year": this.props.year,
                "totalDays": this.props.totalDays,
                "day": i,
                "firstDay": this.props.firstDay,
                "firstWeek": firstWeek,
                "activeFilter": this.props.activeFilter,
                "maxlength": this.state.maxlength
            };
            var objFuncs = {};
            day.push(YBCalendarDay.generaYBCalendarDay(objAtts, objFuncs));
            firstWeek = false;
        }
        return day;
    },

    componentWillMount: function() {
        var maxlength = 0;
        for (var i = this.props.firstWeekDay, l = this.props.firstWeekDay + 7; i < l; i++) {
            if (i in this.props.items) {
                if (this.props.items[i].length > maxlength) {
                    maxlength = this.props.items[i].length;
                }
            }
        }
        this.setState({"maxlength": maxlength});
    },

    render: function() {
        var calendarDays = this._renderCalendarDays();
        return 	<div id="YBCalendarWeek">
                    { calendarDays }
                </div>;
    }
});

module.exports.generaYBCalendarWeek = function(objAtts, objFuncs)
{
    var firstWeekDay = objAtts.week == 0 ? 0 : objAtts.week * 7;
    return  <YBCalendarWeek
                name = { objAtts.name }
                key = { objAtts.name }
                YB = { objAtts.YB }
                LAYOUT = { objAtts.LAYOUT }
                items = { objAtts.items }
                aplic = { objAtts.aplic }
                prefix = { objAtts.prefix }
                urlStatic = { objAtts.staticurl }
                firstDay = { objAtts.firstDay }
                totalDays = { objAtts.totalDays }
                month = { objAtts.month }
                year = { objAtts.year }
                firstWeekDay = { firstWeekDay }
                activeFilter = { objAtts.activeFilter }/>;
};
