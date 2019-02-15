var React = require("react");
import MenuItem from "material-ui/MenuItem";
import IconMenu from "material-ui/IconMenu";
import IconButton from "material-ui/IconButton";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";

var ListItemSecondaryBase = {

    _renderMainActions: function() {
        return this.props.ITEM.actions.map((action, ind) => {
            if (action.tipo != "act") {
                return "";
            }

            if (action.key in this.props.drawIf && this.props.drawIf[action.key] == "hidden") {
                return "";
            }
            return <i key={ action.key } className="material-icons" onClick={ this.props.onActionPress.bind(null, ind, false) }>{ this.props.acciones[action.key].icon }</i>;
        });
    },

    _renderListActions: function() {
        var indList = 999;
        var listActions = this.props.ITEM.actions.filter((action, ind) => {
            if (action.tipo != "actList") {
                return false;
            }
            if (indList == 999) {
                indList = ind;
            }
            if (action.key in this.props.drawIf && this.props.drawIf[action.key] == "hidden") {
                return false;
            }
            return true;
        });
        if (indList == 999) {
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

    _renderSecondaryData: function() {
        if (!this.props.ITEM.item.key) {
            return "";
        }

        if (this.props.ITEM.item.key in this.props.drawIf && this.props.drawIf[this.props.ITEM.item.key] == "hidden") {
            return "";
        }

        return this.props.formatter[this.props.ITEM.item.key](this.props.DATA[this.props.ITEM.item.key]);
    },

    render: function() {
        var mainActions = this._renderMainActions();
        var listActions = this._renderListActions();
        var style = {
            "action": {
                "width": 50,
                "cursor": "pointer"
            }

        };
        var secondaryData = this._renderSecondaryData();
        return  <div className="YBListItemSecondary" style={ style }>
                    <div className="YBListItemSecondaryItem">
                        { secondaryData }
                    </div>
                    <div className="YBListItemSecondaryAction" style={ style.action }>
                        { mainActions }
                    </div>
                </div>;
    }
};

var ListItemSecondary = React.createClass(ListItemSecondaryBase);

module.exports.generaYBListItemSecondary = function(objAtts, objFuncs)
{
    return (
        <ListItemSecondary
            key = { "Secondary__" + objAtts.pk }
            ITEM = { objAtts.item }
            DATA = { objAtts.DATA }
            drawIf = { objAtts.drawIf }
            acciones = { objAtts.acciones }
            onActionPress = { objFuncs.onActionPress }
            formatter = { objFuncs.formatter }/>
    );
};
