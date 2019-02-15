var React = require("react");
var YBTpvListItem = require("./YBTpvListItem.jsx");

var YBTpvListBase = {

    _renderListItems: function() {
        return this.props.data.map((idata, ind) => {
            return YBTpvListItem.generate({
                "i": ind,
                "item": this.props.items,
                "data": idata,
                "name": this.props.name,
                "staticurl": this.props.staticurl,
                "acciones": this.props.acciones,
                "drawIf": {},
                "rowclick": this.props.rowclick,
                "onActionExec": this.props.onActionExec,
                "formatter": this.props.formatter
            });
        });
    },

    render: function() {
        let listItems = this._renderListItems();
        return  <div className="YBLista">
                    <br/>
                    <b>{ this.props.title ? this.props.title : "" }</b>
                    <div className="YBListItems">
                        { listItems }
                    </div>

                </div>;
    }
};

var YBTpvList = React.createClass(YBTpvListBase);

module.exports.generate = function(objAtts)
{
    return  <YBTpvList
                key = { objAtts.name }
                name = { objAtts.name }
                title = { objAtts.title }
                staticurl = { objAtts.staticurl }
                items = { objAtts.items }
                data = { objAtts.data }
                acciones = { objAtts.acciones }
                rowclick = { objAtts.rowclick }
                formatter = { objAtts.formatter }
                onActionExec = { objAtts.onActionExec }
            />;
};
