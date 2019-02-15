var React = require("react");
var Formatter = require("../data/format.js");

var YBLabelBase = {

    _renderText: function() {
        var newText = this.props.text;

        if (!this.props.params) {
            return newText;
        }

        var find, replace;
        for (var i = 0; i < this.props.params.length; i++) {
            find = new RegExp("%yb" + (i + 1), "g");
            replace = "";

            switch (this.props.params[i].type) {
                case "model": {
                    var formatter = Formatter.fromJSONfunc(this.props.modelSchema[this.props.params[i].key].tipo);
                    replace = formatter(this.props.modelData[this.props.params[i].key]);
                    break;
                }
                case "rel": {
                    if (!this.props.relData.hasOwnProperty(this.props.params[i].relcomp)) {
                        break;
                    }
                    replace = this.props.relData[this.props.params[i].relcomp][this.props.params[i].key];
                    break;
                }
                case "calc": {
                    replace = this.props.labelData[this.props.params[i].key];
                    break;
                }
                default: {
                    replace = false;
                    break;
                }
            }
            newText = newText.replace(find, replace || "");
        }
        return newText;
    },

    render: function() {
        var text = this._renderText();
        var clasname = "YBLabel ";
        if ("className" in this.props.layout) {
            clasname += this.props.layout.className
        }
        return  <div id={ this.props.keyc } className={ clasname } style={ this.props.style }>
                    { text }
                </div>;
    }
};

var YBLabel = React.createClass(YBLabelBase);

module.exports.generaYBLabel = function(objAtts, objFuncs)
{
    var style = objAtts.layout.hasOwnProperty("style") ? objAtts.layout.style : {};
    return  <YBLabel
                key = { objAtts.name }
                keyc = { objAtts.name }
                text = { objAtts.layout.text }
                style = { style }
                params = { objAtts.layout.params }
                layout = { objAtts.layout }
                modelData = { objAtts.modelData }
                modelSchema = { objAtts.modelSchema }
                relData = { objAtts.relData }
                labelData = { objAtts.labelData }/>;
};
