var React = require("react");

var YBTpvDashBoardItemBase = {

    _renderImg: function() {
        let src = this.props.staticurl + "dist/img/tpv/";
        let aName = this.props.name.split("_");
        let name = aName[aName.length - 1];

        if (name.startsWith("table")) {
            name = "table";
        }
        else if (name.startsWith("zone")) {
        	// tmp
            name = "table";
        }
        name = name.replace("/", "");
        name = name.replace("(", "");
        name = name.replace(")", "");
        src += name + ".png";

        let bgpos = "center center";
        let bgsize = "auto";
        if (this.props.name.startsWith("tpv_newpayment_bill")) {
            bgpos = "80% 45%";
            bgsize = "200%";
        }
        else if (this.props.name.startsWith("tpv_newpayment_coin")) {
            bgpos = "center center";
            bgsize = "102%";
        }

        return {
            "backgroundImage": "url(" + src + ")",
            "backgroundColor": "rgb(242, 242, 242)",
            "backgroundRepeat": "no-repeat, no-repeat",
            "backgroundSize": bgsize,
            "backgroundPosition": bgpos
        };
    },

    _renderQty: function() {
        if (!this.props.qty) {
            return "";
        }

        return  <div className="YBTpvDashBoardItemQty">
                    <div>
                        { this.props.qty }
                    </div>
                </div>;
    },

    _onClick: function() {
        this.props.onClick(this.props.item.uri, {
            "menu": this.props.menu,
            "confmenu": this.props.confmenu
        });
    },

    _getClassName: function() {
        let className = "YBTpvDashBoardItem";

        if (this.props.checked == "True") {
            className += " checked";
        }

        return className;
    },

    render: function() {
        let className = this._getClassName();
        let style = this._renderImg();
        let qty = this._renderQty();

        return  <div className={ className } onClick={ this._onClick }>
                    <div className="YBTpvDashBoardItemInner" style={ style }>
                        { qty }
                    </div>
                    { this.props.item.desc.toUpperCase() }
                </div>;
    }
};

var YBTpvDashBoardItem = React.createClass(YBTpvDashBoardItemBase);

module.exports.generate = function(objAtts)
{
    return  <YBTpvDashBoardItem
                key = { objAtts.name }
                name = { objAtts.name }
                item = { objAtts.item }
                qty = { objAtts.qty }
                menu = { objAtts.menu }
                staticurl = { objAtts.staticurl }
                confmenu = { objAtts.confmenu }
                checked = { objAtts.checked }
                onClick = { objAtts.onClick }/>;
};
