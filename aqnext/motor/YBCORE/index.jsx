//Carga inicial para extensiones
var miReact = require("react");
var mijquery = require("jquery");
var miund = require("underscore/underscore");
var bmd = require("bootstrap-material-design");
var firebase;

try {
	firebase = require("firebase");
}
catch(err) {
	firebase = null;
}

//Extensiones---------------------------------------------------------------------
//Mimui.YBExt=require("extensiones/material-ui/index");
//Solo se incluye
require("extensiones/jquery/index");

//Otras inicializaciones----------------------------------------------------------
var injectTapEventPlugin = require("react-tap-event-plugin");

mijquery.material.init();

//Needed for onTouchTap
injectTapEventPlugin();

//Exportaciones--------------------------------------------------------------------
module.exports = {
    "React": miReact,
    "navegacion": require("navegacion/index"),
    "dataProcessing": require("data/index"),
    "componentes": require("componentes/index"),
    "jquery": mijquery,
    "$": mijquery,
    "underscore": miund,
    "_": miund,
    "firebase": firebase
};
