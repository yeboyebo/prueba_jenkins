var React = require("react");
var URLResolver = require("../../navegacion/URLResolver.js");

var YBCalendarDay = React.createClass({

    _getDayCellTaskItem: function(task) {
        // console.log(task);
        var url = URLResolver.getTemplate(this.props.aplic, this.props.prefix, task.pk, null);
        // console.log(url);
        return 	<div className="YBCalendarDayCellTaksitem" onClick={ this._onCellTaskItemClick.bind(this, url) } key={ task.pk }>
        			{ task.title }
        		</div>;
    },

    _onCellTaskItemClick: function(url) {
        window.location.href = url;
    },

    _renderDay: function() {
        var day = {};
        var that = this;
        day["tasks"] = [];
        day["ntasks"] = [];
        day["name"] = "";
        if (this.props.day >= this.props.firstDay && this.props.day <= this.props.totalDays + this.props.firstDay) {
            day["date"] = this.props.day - this.props.firstDay + 1;
            for (var item in this.props.items) {
                day["tasks"].push(that._getDayCellTaskItem(this.props.items[item]));
            }
            var hrefString = "/gesttare/gt_tareas/newRecord?p_fechavencimiento=";
            var thismonth = this.props.month.toString().length == 1 ? "0" + this.props.month : this.props.month;
            var thisday = this.props.day - this.props.firstDay + 1;
            thisday = thisday.toString().length == 1 ? "0" + thisday : thisday;
            hrefString += this.props.year + "-" + thismonth + "-" + thisday;
            day["ntasks"].push(<a key={"a_" + this.props.day} href={ hrefString }>Añadir tarea</a>);
        }
        return day;
    },

    render: function() {
        var calendarDay = this._renderDay();
        var clasname = "YBCalendarDay"
        if ("date" in calendarDay) {
            clasname += " YBCalendarDayColored";
        }
        if (this.props.activeFilter == "Semana"){
            clasname += " YBCalendarDayWeekFormat";
        }
        if (this.props.maxlength >= 3) {
            var height = 200;
            height += 50 * (this.props.maxlength - 2);
        }
        var style = {"height": height + "px"}
        return 	<div className={ clasname } style={ style }>
                    <div className="YBCalendarDayCell">
                        <div className="YBCalendarDayCellDate">
                            { calendarDay["name"] }{ calendarDay["date"] }
                        </div>
                        <div className="YBCalendarDayCellTasks">
                            { calendarDay["tasks"] }
                        </div>
                        <div className="YBCalendarDayCellNewTask">
                            { calendarDay["ntasks"] }
                        </div>
                    </div>
                </div>;
    }
});

module.exports.generaYBCalendarDay = function(objAtts, objFuncs)
{
    return  <YBCalendarDay
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
                month = { objAtts.month + 1 }
                year = { objAtts.year }
                day = { objAtts.day }
                firstWeek = { objAtts.firstWeek }
                activeFilter = { objAtts.activeFilter }
                maxlength = { objAtts.maxlength }/>;
};
