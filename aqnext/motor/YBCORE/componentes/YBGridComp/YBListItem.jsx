var React = require("react");
var _ = require("underscore");
var YBListItemPrimary = require("./YBListItemPrimary.jsx");
var YBListItemSecondary = require("./YBListItemSecondary.jsx");
var YBAvatar = require("../YBAvatar.jsx");

var ListItemBase = {

    getInitialState: function() {
        return {
            "editeds": {}
        };
    },

    _onRowClick: function() {
        if (this.props.rowclick) {
            this.props.lanzarAccion(this.props.name, this.props.PREFIX, this.props.rowclick, this.props.DATA.pk, {});
        }
    },

    _onItemClick: function() {
        this.props.lanzarAccion(this.props.name, this.props.PREFIX, "link", this.props.DATA.pk, {});
    },

    _onActionPress: function(accion) {
    	let pk = undefined;
    	if ("pk" in this.props.DATA) {
    		pk = this.props.DATA.pk;
    	}

        this.props.onActionExec(this.props.ITEMS.secondary.actions[accion], pk);
    },

    _onRowCheck: function() {
        this.props.onRowCheck(this.props.DATA.pk);
    },

    _renderAvatar: function() {
        if (!this.props.ITEMS.hasOwnProperty("avatar")) {
            return "";
        }

        var objAtts = {
            "name": "avatar_" + this.props.name + "_" + this.props.DATA.pk,
            "imgDir": this.props.STATICURL + "dist/img/",
            // "img": "users/javier",
            "altValue": this.props.DATA[this.props.ITEMS.avatar],
            "multiselectable": this.props.multiselectable,
            "checked": this.props.checked,
            "navbar": false
        };
        var objFuncs = {
            "onClick": this._onRowCheck
        };
        return YBAvatar.generaYBAvatar(objAtts, objFuncs);
    },

    _renderPrimary: function() {
        if (!this.props.ITEMS.primary.title && !this.props.ITEMS.primary.subtitle && this.props.ITEMS.primary.body.length == 0) {
            return false;
        }

        var objAtts = {
            "pk": this.props.DATA.pk,
            "item": this.props.ITEMS.primary,
            "drawIf": this.props.drawIf[this.props.name] || {},
            "DATA": this.props.DATA
        };
        var objFuncs = {
            "onRowClick": this._onRowClick,
            "onCellEdit": this._onCellEdit,
            "onCellEnter": this._onCellEnter,
            "formatter": this.props.formatter,
            "getFiles": this.props.getFiles,
            "onItemClick": this._onItemClick
        };
        return YBListItemPrimary.generaYBListItemPrimary(objAtts, objFuncs);
    },

    _renderSecondary: function() {
        if (!this.props.ITEMS.secondary.item && this.props.ITEMS.secondary.actions.length == 0) {
            return false;
        }

        var objAtts = {
            "pk": this.props.DATA.pk,
            "item": this.props.ITEMS.secondary,
            "DATA": this.props.DATA,
            "drawIf": this.props.drawIf[this.props.name] || {},
            "STATICURL": this.props.STATICURL,
            "acciones": this.props.acciones
        };
        var objFuncs = {
            "onActionPress": this._onActionPress,
            "formatter": this.props.formatter
        };
        return YBListItemSecondary.generaYBListItemSecondary(objAtts, objFuncs);
    },

    render: function() {
        var avatar = null;
        if (this.props.LAYOUT.hasOwnProperty("avatar") && !this.props.LAYOUT["avatar"]) {
            avatar = null;
        }
        else {
            avatar = this._renderAvatar();
        }

        var primary = this._renderPrimary();
        var secondary = this._renderSecondary();
        var className = "YBListItem ";

        if (this.props.colorRowField) {
            if (this.props.DATA[this.props.colorRowField] == true) {
                className += "cSuccess";
            }
            else {
                className += this.props.DATA[this.props.colorRowField];
            }
        }

        return  <div className={ className }>
                    <div className = "YBListItemAvatar">
                        { avatar }
                    </div>
                    { primary }
                    { secondary }
                </div>;
    }
};

var ListItem = React.createClass(ListItemBase);

module.exports.generaYBListItem = function(objAtts, objFuncs)
{
    return (
        <ListItem
            key = { objAtts.i }
            name = { objAtts.name }
            tipoTabla = { objAtts.tipoTabla }
            STATICURL = { objAtts.STATICURL }
            ITEMS = { objAtts.items }
            LAYOUT = { objAtts.LAYOUT }
            DATA = { objAtts.itemData }
            PREFIX = { objAtts.prefix }
            drawIf = { objAtts.drawIf }
            checked = { objAtts.checked }
            rowclick = { objAtts.rowclick }
            lanzarAccion = { objFuncs.lanzarAccion }
            listActions = { objAtts.listActions }
            acciones = { objAtts.acciones }
            onActionExec = { objFuncs.onActionExec }
            multiselectable = { objAtts.multiselectable }
            onRowCheck = { objFuncs.onRowCheck }
            colorRowField = { objAtts.colorRowField }
            getFiles = { objFuncs.getFiles }
            formatter = {objFuncs.formatter }/>
    );
};
