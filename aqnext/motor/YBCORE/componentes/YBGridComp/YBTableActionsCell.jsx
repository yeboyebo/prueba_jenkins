var React = require("react");

import IconMenu from "material-ui/IconMenu";
import MenuItem from "material-ui/MenuItem";
import IconButton from "material-ui/IconButton";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";

var YBTableActionsCellBase = {

    _renderMainActions: function() {
        return this.props.rowActions.map((action, ind) => {
            if (this.props.drawIf && this.props.name in this.props.drawIf && action.key in this.props.drawIf[this.props.name] && this.props.drawIf[this.props.name][action.key] == "hidden") {
                return "";
            }

            if (action.tipo != "act") {
                return "";
            }

            return <i key={ action.key } className="material-icons" onClick={ this.props.onActionPress.bind(null, ind, false) }>{ this.props.acciones[action.key].icon }</i>;
        });
    },

    _renderListActions: function() {
        //console.log(this.props.drawIf)
        var indList = 999;
        var listActions = this.props.rowActions.filter((action, ind) => {
            if (action.tipo != "actList") {
                return false;
            }
            if (indList == 999) {
                indList = ind;
            }
            return true;
        });
        if(indList == 999) {
            return "";
        }

        listActions = listActions[0].layout.map((action, ind) => {
            return <MenuItem key={ action.key } value={ ind } primaryText={ action.label }/>;
        });
        return  <IconMenu
                    iconButtonElement={ <IconButton><MoreVertIcon/></IconButton> }
                    onChange={ this.props.onListActionPress.bind(null, indList) }
                    className="iconButtonMaterial">
                        { listActions }
                </IconMenu>;
    },

    render: function() {
        var width = 50;
        if (this.props.rowActions.length >= 2) {
            width = 50 + (this.props.rowActions.length - 1) * 23;
        }
        var style = {
            "width": width,
            "cursor": "pointer"
        };

        var mainActions = this._renderMainActions();
        var listActions = this._renderListActions();

        return  <div className="YBTableCell YBTableActionsCell" style={ style }>
                    { mainActions }
                    { listActions }
                </div>;
    }
};

var YBTableActionsCell = React.createClass(YBTableActionsCellBase);

module.exports.generaYBTableActionsCell = function(objAtts, objFuncs)
{
    return  <YBTableActionsCell
                rowActions = { objAtts.rowActions }
                acciones = { objAtts.acciones }
                onActionPress = { objFuncs.onActionPress }
                drawIf= { objAtts.drawIf }
                name = { objAtts.name }
                onListActionPress = { objFuncs.onListActionPress }/>;
};
