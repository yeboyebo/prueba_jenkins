var React = require("react");
var _ = require("underscore");

import FontIcon from "material-ui/FontIcon";
import RaisedButton from "material-ui/RaisedButton";
import FlatButton from "material-ui/FlatButton";

var YBButtonBase = {

    getInitialState: function() {
        return {
            "val_auto": ""
        };
    },

    _onclick: function() {
        setTimeout(() => {
            this.props.lanzarAccion(this.props.name, this.props.layout.prefix, this.props.layout.action, null, this.props.data);
        }, 300);
    },

    _rendercomp: function() {
        var style = {
            "marginRight": this.props.className && this.props.className.includes("floatRight") ? "0px" : "10px",
            "marginLeft": this.props.className && this.props.className.includes("floatRight") ? "10px" : "0px",
        };
        style = "style" in this.props.layout ? _.extend(style, this.props.layout.style) : style;
        var classname = "YBButtonElement";
        var label = "label" in this.props.layout ? this.props.layout.label : null;
        //var icon = "icon" in this.props.layout ? <FontIcon className="material-icons">{ this.props.layout.icon }</FontIcon> : null;
        var icon = "icon" in this.props.layout ? <i className="material-icons">{ this.props.layout.icon }</i> : null;
        var disabled = "disabled" in this.props.layout ? this.props.layout.disabled : false;
        if ("secondary" in this.props.layout && this.props.layout.secondary) {
            classname += " YBButtonSecondary";
        } else {
            classname += " YBButtonPrimary";
        }
        var primary = "primary" in this.props.layout ? this.props.layout.primary : true;
        var secondary = "secondary" in this.props.layout ? this.props.layout.secondary : false;
        var actionType = "actionType" in this.props.layout ? this.props.layout.actionType : "button";

        if (this.props.layout.buttonType == "flat") {
            classname += " YBButtonFlat";
            return <button 
                        className = { classname }
                        style = { style }
                        disabled = { disabled }
                        onClick = { this.props.onClick || this._onclick }> 
                            { icon } { label } 
                    </button>
            // return  <FlatButton
            //             type = { actionType }
            //             label = { label }
            //             primary = { primary }
            //             secondary = { secondary }
            //             icon = { icon }
            //             style = { style }
            //             disabled = { disabled }
            //             onClick = { this.props.onClick || this._onclick }/>;
        }
        else if (this.props.layout.buttonType == "raised") {
            classname += " YBButtonRaised";
            return <button 
                        className = { classname }
                        style = { style }
                        disabled = { disabled }
                        onClick = { this.props.onClick || this._onclick }> 
                            { icon } { label } 
                    </button>
            // return  <RaisedButton
            //             type = { actionType }
            //             label = { label }
            //             primary = { primary }
            //             secondary = { secondary }
            //             icon = { icon }
            //             style = { style }
            //             disabled = { disabled }
            //             onClick = { this.props.onClick || this._onclick }/>;
        }
        else if (this.props.layout.buttonType == "float") {
            return  <div
                        className="floatButton"
                        key = { this.props.name }>
                            <a
                                href = "javascript:void(0)"
                                className = "btn btn-fab btn-info"
                                onClick = { this.props.onClick || this._onclick }>
                                    <i className="material-icons">{ this.props.layout.icon }</i>
                            </a>
                    </div>;
        }
    },

    render: function() {
        var rendercomp = this._rendercomp();
        var style = "style" in this.props.layout ? _.extend({}, this.props.layout.style.div) : {};

        var className = "YBButton";
        if (this.props.className) {
            className += " " + this.props.className;
        }

        return  <div className={ className } style={ style }>
                    { rendercomp }
                </div>;
    }
};

var YBButton = React.createClass(YBButtonBase);

module.exports.generaYBButton = function(objAtts, objFuncs)
{
    return  <YBButton
                key = { objAtts.name }
                name = { objAtts.name }
                layout = { objAtts.layout }
                className = { objAtts.layout.className }
                lanzarAccion = { objFuncs.lanzarAccion }
                onClick = { objFuncs.onClick }
                data = { objAtts.data  || {} }/>;
};
