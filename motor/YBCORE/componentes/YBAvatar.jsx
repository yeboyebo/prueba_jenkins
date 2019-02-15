var React = require("react");

import IconMenu from "material-ui/IconMenu";
import MenuItem from "material-ui/MenuItem";
import IconButton from "material-ui/IconButton";
import Divider from "material-ui/Divider";

var YBAvatarBase = {

    _onClick: function() {
        if (this.props.onClick) {
            this.props.onClick();
        }
    },

    _onMenuClick: function(e, act) {
        var action = this.props.menuItems.filter((x) => {
            return x.value == act;
        });
        window.location.href = action[0].href;
    },

    // TODO: generateLetter o como sea cuando vengan de bd
    _generaLogo: function() {
        // Para tpv
        if (this.props.img) {
            return this.props.imgDir + this.props.img;
        }
        return this._generateLetter();
    },

    _generateLetter: function() {
        var alt = this.props.altValue;
        let letter = this._getLetter(alt);

        return this.props.imgDir + "avatars/" + letter + ".png";
    },

    _getLetter: function(alt) {
        if (!alt || alt == "") {
            return "X";
        }

        alt = alt.toString();
        if (alt.startsWith("Éxito")) {
            return "check";
        }

        alt = alt[0].toUpperCase();

        let forbidden = "!@#$^&%*()+=-[]\/{}|:<>?,.";
        if (forbidden.indexOf(alt) != -1) {
            return "X";
        }

        let badsubs = "ÁÉÍÓÚÑ";
        let goodsubs = "AEIOUN";
        let ind = badsubs.indexOf(alt);
        if (ind != -1) {
            return goodsubs[ind];
        }

        return alt;
    },

    _renderMenuItems: function() {
        var items = [];
        var dividerCont = 0;
        for (var i in this.props.menuItems) {
            var item = this.props.menuItems[i];
            if (items.length) {
                items.push(<Divider key={ "divider_" + dividerCont++ }/>);
            }

            items.push(
                <MenuItem key={ item.key } value={ item.value } primaryText={ item.text }/>
            );
        }
        return items;
    },

    _renderMenu: function(avatar) {
        if (!this.props.navbar) {
            return avatar;
        }

        var items = this._renderMenuItems();

        return <div className="YBNavBarAvatar">
            <IconMenu
                iconButtonElement={ <IconButton> { avatar } </IconButton> }
                onChange={ this._onMenuClick }
                className="iconButtonMaterial">
                    { items }
            </IconMenu>
       </div>;
    },

    // TODO: Si me viene img desde bd, la saco, si no, genero letra
    _renderAvatar: function() {
        var logo = this._generaLogo();
        if (this.props.multiselectable && this.props.checked) {
            logo = this.props.imgDir + "avatars/check.png";
        }

        return  <img src={ logo } className="YBAvatar" onClick={ this._onClick }>
                </img>;
    },

    render: function() {
        var avatar = this._renderAvatar();
        var comp = this._renderMenu(avatar);

        var className = "YBAvatar";
        if (this.props.classname) {
            className += " " + this.props.classname;
        }

        return  <div className={ className }>
                        { comp }
                </div>;
    }
};

var YBAvatar = React.createClass(YBAvatarBase);

module.exports.generaYBAvatar = function(objAtts, objFuncs)
{
    return  <YBAvatar
                name = { objAtts.name }
                key = { objAtts.name }
                classname = { objAtts.classname }
                imgDir = { objAtts.imgDir }
                img = { objAtts.img }
                altValue = { objAtts.altValue }
                navbar = { objAtts.navbar }
                menuItems = { objAtts.menuItems }
                multiselectable = { objAtts.multiselectable }
                checked = { objAtts.checked }
                onClick = { objFuncs.onClick }/>;
};
