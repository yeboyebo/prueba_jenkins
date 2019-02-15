var React = require("react");

import IconMenu from "material-ui/IconMenu";
import MenuItem from "material-ui/MenuItem";
import IconButton from "material-ui/IconButton";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";

var YBTableActionCellBase = {

    _renderAction: function() {
        let action = this.props.accion;
        if (this.props.drawIf && this.props.name in this.props.drawIf && action.key in this.props.drawIf[this.props.name] && this.props.drawIf[this.props.name][action.key] == "hidden") {
            return "";
        }

        if (action.tipo != "act") {
            return "";
        }
        return <i key={ action.key } className="material-icons" onClick={ this.props.onActionPress.bind(null, action, false) }>{ this.props.acciones[action.key].icon }</i>;
    },

    render: function() {
        var width = 50;
        var style = {
            "width": width,
            "cursor": "pointer"
        };

        var action = this._renderAction();

        return  <div className="YBTableCell YBTableActionsCell" style={ style }>
                    { action }
                </div>;
    }
};

var YBTableActionCell = React.createClass(YBTableActionCellBase);

module.exports.generaYBTableActionCell = function(objAtts, objFuncs)
{
    return  <YBTableActionCell
                key = { objAtts.accion.key }
                rowActions = { objAtts.rowActions }
                accion = { objAtts.accion }
                acciones = { objAtts.acciones }
                onActionPress = { objFuncs.onActionPress }
                drawIf= { objAtts.drawIf }
                name = { objAtts.name }
                onListActionPress = { objFuncs.onListActionPress }/>;
};
