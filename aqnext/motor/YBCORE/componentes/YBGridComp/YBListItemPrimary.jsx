var React = require("react");

var ListItemPrimaryBase = {

    _renderPrimaryTitle: function() {
        if (!this.props.ITEM.title) {
            return "";
        }

        if (this.props.ITEM.title in this.props.drawIf && this.props.drawIf[this.props.ITEM.title.key] == "hidden") {
            return "";
        }

        return <h3 className="YBListItemPrimaryTitle"> { this.props.formatter[this.props.ITEM.title.key](this.props.DATA[this.props.ITEM.title.key]) } </h3>;
    },

    _renderPrimarySubtitle: function() {
        if (!this.props.ITEM.subtitle) {
            return "";
        }

        if (this.props.ITEM.subtitle in this.props.drawIf && this.props.drawIf[this.props.ITEM.subtitle.key] == "hidden") {
            return "";
        }

        return <h4 className="YBListItemPrimarySubtitle"> { this.props.formatter[this.props.ITEM.subtitle.key](this.props.DATA[this.props.ITEM.subtitle.key]) }</h4>;
    },

    _renderPrimaryBody: function(item) {
        if (!item) {
            return "";
        }

        if (item in this.props.drawIf && this.props.drawIf[item.key] == "hidden") {
            return "";
        }

        if (item.hasOwnProperty("file") && item.file) {
            return <a style={ {"cursor": "pointer", "fontWeight": "bold"} } onClick={ this._onGetFile.bind(this, item) }>{ this.props.formatter[item.key](this.props.DATA[item.key]) }</a>
        }
        return this.props.formatter[item.key](this.props.DATA[item.key]);
    },

    _onGetFile: function(item) {
        this.props.getFiles(this.props.DATA.pk, item);
    },

    render: function() {
		var body = this.props.ITEM.body.map((item, i) => {
            var bodyData = this._renderPrimaryBody(item);
        	return	<div key={i}>
        				{ bodyData }
        				<br/>
        			</div>;
        });
        var style = {};

        var title = this._renderPrimaryTitle();
        var subtitle = this._renderPrimarySubtitle();

        return  <div className="YBListItemPrimary" style={ style } onClick={ this.props.onRowClick }>
                    { title }
                    { subtitle }
                    <div className="YBListItemPrimaryBody">{ body }</div>
                </div>;
    }
};

var ListItemPrimary = React.createClass(ListItemPrimaryBase);

module.exports.generaYBListItemPrimary = function(objAtts, objFuncs)
{
    return (
        <ListItemPrimary
            key = { "Primary__" + objAtts.pk }
            ITEM = { objAtts.item }
            DATA = { objAtts.DATA }
            drawIf = { objAtts.drawIf }
            onRowClick = { objFuncs.onRowClick }
            formatter = {objFuncs.formatter }
            getFiles = { objFuncs.getFiles }
            onItemClick = {objFuncs.onItemClick }/>
    );
};
