var React = require("react");
var YBListItemPrimary = require("../../YBGridComp/YBListItemPrimary.jsx");
var YBListItemSecondary = require("../../YBGridComp/YBListItemSecondary.jsx");
var YBAvatar = require("../../YBAvatar.jsx");

var YBTpvListItemBase = {

    _onRowClick: function() {
        this.props.rowclick(this.props.data.pk, this.props.data.config);
    },

    _onActionExec: function(accion) {
        this.props.onActionExec(this.props.item.secondary.actions[accion], this.props.data.pk, this.props.data);
    },

    _renderAvatar: function() {
        if (!this.props.item.hasOwnProperty("avatar")) {
            return "";
        }

        let img = this.props.data.pk;
        img = img.replace("/", "");
        img = img.replace("(", "");
        img = img.replace(")", "");

        return YBAvatar.generaYBAvatar({
            "name": "avatar_" + this.props.name + "_" + this.props.data.pk,
            "imgDir": this.props.staticurl + "dist/img/tpv/",
            "altValue": this.props.data[this.props.item.avatar],
            "img": img + ".png",
            "navbar": false
        }, {
            "onClick": this._onRowClick
        });
    },

    _renderPrimary: function() {
        if(!this.props.item.primary.title && !this.props.item.primary.subtitle && this.props.item.primary.body.length == 0) {
            return false;
        }

        return YBListItemPrimary.generaYBListItemPrimary({
            "pk": this.props.data.pk,
            "item": this.props.item.primary,
            "DATA": this.props.data,
            "drawIf": this.props.drawIf
        }, {
            "onRowClick": this._onRowClick,
            "formatter": this.props.formatter
        });
    },

    _renderSecondary: function() {
        if(!this.props.item.secondary.item && this.props.item.secondary.actions.length == 0) {
            return false;
        }

        return YBListItemSecondary.generaYBListItemSecondary({
            "pk": this.props.data.pk,
            "item": this.props.item.secondary,
            "DATA": this.props.data,
            "staticurl": this.props.staticurl,
            "acciones": this.props.acciones,
            "drawIf": this.props.drawIf
        }, {
            "onActionPress": this._onActionExec,
            "formatter": this.props.formatter
        });
    },

    render: function() {
        let avatar = null;
        if (this.props.item.hasOwnProperty("avatar") && !this.props.item["avatar"]) {
            avatar = null;
        }
        else {
            avatar = this._renderAvatar();
        }
        let primary = this._renderPrimary();
        let secondary = this._renderSecondary();
        let className = "YBListItem";

        return  <div className={ className }>
                    <div className="YBListItemAvatar">
                        { avatar }
                    </div>
                    { primary }
                    { secondary }
                </div>;
    }
};

var YBTpvListItem = React.createClass(YBTpvListItemBase);

module.exports.generate = function(objAtts)
{
    return (
        <YBTpvListItem
            key = { objAtts.i }
            name = { objAtts.name }
            staticurl = { objAtts.staticurl }
            item = { objAtts.item }
            data = { objAtts.data }
            drawIf = { objAtts.drawIf }
            acciones = { objAtts.acciones }
            rowclick = { objAtts.rowclick }
            onActionExec = { objAtts.onActionExec }
            formatter = { objAtts.formatter }
        />
    );
};
