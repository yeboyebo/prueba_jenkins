var React = require("react");
var YBGroupBox = require('./YBGroupBox.jsx');
var YBButton = require('./YBButton.jsx');

import {
    Step,
    Stepper,
    StepButton,
} from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

var YBWizardBase = {

    getInitialState: function() {
        return {
            "finished": false,
            "stepIndex": 0
        };
    },

    handleNext: function() {
        const { stepIndex } = this.state;
        if (this.state.stepIndex == this.props.LAYOUT.length -1) {
            this.props.lanzarAccion(this.props.name, this.props.PREFIX, this.props.action, null, {});
        }
        else {
            this.setState({
                "stepIndex": stepIndex + 1,
                "finished": stepIndex == this.props.LAYOUT.length - 2,
            });
        }
    },

    handlePrev: function() {
        let {stepIndex} = this.state;
        if (stepIndex > 0) {
            this.setState({"stepIndex": stepIndex - 1});
        }
    },

    getStepContent: function(stepIndex) {
        var objAtts = {
            "name": 'step' + stepIndex,
            "clases": 'step' + stepIndex,
            "data": this.props.YB,
            "layout": this.props.LAYOUT[stepIndex].layout,
            "aplic": this.props.APLIC,
            "prefix": this.props.PREFIX,
            "acciones": null,
            "focus": this.props.FOCUS
        };
        var objFuncs = {
            "lanzarAccion": this.props.lanzarAccion,
            "onBufferChange": this.props.onBufferChange,
            "onChange": this.props.onChange,
            "onFieldChange": this.props.onFieldChange,
            "newRecord": this.props._newRecord,
            "onDataChange": this.props.onDataChange,
            "addPersistentData": null
        };
        return YBGroupBox.generaYBGroupBox(objAtts, objFuncs);
    },

    _renderStepper: function() {
        var stepIndex = this.state.stepIndex;

        var steps = this.props.LAYOUT.map((step, i) => {
            var title = step.title || "Paso " + (i + 1);
            return  <Step key={ this.props.name + i }>
                        <StepButton onClick={() => this.setState({"stepIndex": i})}>
                            { title }
                        </StepButton>
                    </Step>;
        });

        return  <Stepper linear={ false } activeStep={ stepIndex }>
                    { steps }
                </Stepper>;
    },

    _renderNextButton: function() {
        var layout = {
            "buttonType": "raised",
            "label": "Siguiente",
            "prefix": this.props.PREFIX,
            "disabled": this.state.stepIndex == this.props.LAYOUT.length,
            "style": {
                "button": {},
                "div": {
                    "display": "inline"
                }
            }
        };
        var objAtts = {
            "name": "nextButton",
            "layout": layout
        };
        var objFuncs = {
            "lanzarAccion": this.props.lanzarAccion,
            "onClick": this.handleNext
        };
        return YBButton.generaYBButton(objAtts, objFuncs);
    },

    _renderBackButton: function() {
        var layout = {
            "buttonType": "flat",
            "label": "Atrás",
            "prefix": this.props.PREFIX,
            "primary": false,
            "disabled": this.state.stepIndex === 0,
            "style": {
                "button": {},
                "div": {
                    "display": "inline"
                }
            }
        };
        var objAtts = {
            "name": "backButton",
            "layout": layout
        };
        var objFuncs = {
            "lanzarAccion": this.props.lanzarAccion,
            "onClick": this.handlePrev
        };
        return YBButton.generaYBButton(objAtts, objFuncs);
    },

    render: function() {
        var stepper = this._renderStepper();
        var backButton = this._renderBackButton();
        var nextButton = this._renderNextButton();

        var stepIndex = this.state.stepIndex;
        var style = {
            "wizardStyle": {
                "width": '100%',
                "maxWidth": 700,
                "margin": '0px auto 20px'
            },
            "contentStyle": {
                "margin": 'auto'
            },
            "buttonSetStyle": {
                "marginTop": 12
            }
        };

        return  <div className = "YBWizard">
                    <div style = { style.wizardStyle }>
                        { stepper }
                        <div className = "YBWizardContent">
                            { this.getStepContent(stepIndex) }
                        </div>
                        <div className = "YBWizardButtonSet" style = { style.buttonSetStyle }>
                            { backButton }
                            { nextButton }
                        </div>
                    </div>
                </div>;
    }
};

var YBWizard = React.createClass(YBWizardBase);

module.exports.generaYBWizard = function(objAtts, objFuncs)
{
    var wlayout = objAtts.layout.layout;
    var arrLayout = Object.keys(wlayout).map((key) => {
        return wlayout[key];
    });
    var action = null;
    if (objAtts.layout.hasOwnProperty('action')) {
        action = objAtts.layout.action;
    }

    return  <YBWizard
                key = { objAtts.name || "YBWizard" }
                action = { action }
                name = { objAtts.name }
                clases = { objAtts.clases }
                YB = { objAtts.data }
                APLIC = { objAtts.aplic }
                LAYOUT = { arrLayout }
                ACCIONES = { objAtts.acciones }
                PREFIX = { objAtts.prefix }
                FOCUS = { objAtts.focus }
                lanzarAccion = { objFuncs.lanzarAccion }
                onBufferChange = { objFuncs.onBufferChange }
                onChange = { objFuncs.onChange }
                onFieldChange = { objFuncs.onFieldChange }
                newRecord = { objFuncs.newRecord }
                onDataChange = { objFuncs.onDataChange }/>;
};
