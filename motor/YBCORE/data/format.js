var nformat;
var cformat;
var dformat;
var cvformat;
var React=require('react');

function formatter() {
    this.props = {};
};

function _formateanumero(valor, cifras, decimales) {
    try {
        var f;
        if (decimales > 0) {
            f = cvformat.format(valor);
        }
        else {
            f = nformat.format(valor);
        }
        return f;
    } catch(ex) {
        return "";
    }
};

function _formateacurrency(valor) {
    return valor ? cformat.format(valor) : "";
};

function _formateacurrencyv(valor) {
    return valor ? cvformat.format(valor) : "";
};

function _formateaboolean(valor) {
    var valor = valor ? "Sí" : "No";
    return valor;
};

function _formateafecha(valor) {
    if (!valor) {
        return "";
    }
    var date = new Date(valor);
    var year = date.getFullYear();
    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    var fecha = day + '/' + month + '/' + year;

    return fecha;
};

function _formateafechahora(valor) {
    if (!valor) {
        return "";
    }

    var date = new Date(valor);

    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    var year = date.getFullYear();

    var hours = date.getHours().toString();
    hours = hours.length > 1 ? hours : '0' + hours;
    var minutes = date.getMinutes().toString();
    minutes = minutes.length > 1 ? minutes : '0' + minutes;
    var seconds = date.getSeconds().toString();
    seconds = seconds.length > 1 ? seconds : '0' + seconds;

    var fechahora = day + '/' + month + '/' + year + " " + hours + ":" + minutes + ":" + seconds;

    return fechahora;
};

formatter.prototype.init = function (props) {
    this.props = props;
    console.log('Estableciendo idioma ' + props.LANGUAGE_CODE);
    nformat =  new Intl.NumberFormat(props.LANGUAGE_CODE, {style: "decimal", maximunFractionDigits: 2});
    cvformat =  new Intl.NumberFormat(props.LANGUAGE_CODE, {style: "decimal", minimumFractionDigits: 2});
    cformat = new Intl.NumberFormat(props.LANGUAGE_CODE, {style: "currency", currency: props.currency, maximumFractionDigits: 2});
    dformat = new Intl.DateTimeFormat(props.LANGUAGE_CODE, {day: "2-digit", month: "2-digit", year: "numeric"});
    //Asi en principio hace la carga dinamica del lenguaje
    /*var obj = require('numeral/languages/'+props.LANGUAGE_CODE);
    numeral.language(this.props.LANGUAGE_CODE, obj).bind(this.props.LANGUAGE_CODE,obj);
    numeral.language(this.props.LANGUAGE_CODE).bind(this.props.LANGUAGE_CODE);
    numeral.defaultFormat();*/
};

formatter.prototype.fromJSON = function (value, tipo) {
    if (tipo == 16) {
    	//Entero
        return  _formateanumero(value, 10, 0);
    }
    else if (tipo == 19) {
    	//Double
        return  _formateanumero(value, 10, 2);
    }
    else if (tipo == 37) {
    	//CURRENCY
        return  _formateacurrency(value);
    }
    else if(tipo == 47) {
    	//CURRENCY sin divisa
        return _formateacurrencyv(value);
    }
    else if (tipo == 18) {
    	//BOOLEAN
        return  _formateaboolean(value);
    }
    else if (tipo == 26) {
    	//DATE
        return  _formateafecha(value);
    }
    else if (tipo == 28) {
    	//DATE/HOUR
        return  _formateafechahora(value);
    }
    return value;
};

formatter.prototype.toJSON = function (value, schemaOpt) {
    return value;
};

formatter.prototype.fromJSONfunc = function (schemaOpt) {
    var mifor = this;
    return function (value) {
    	return mifor.fromJSON(value, schemaOpt);
    };
};

formatter.prototype.onBlur = function (value, schemaOpt) {
    return value
};

formatter.prototype.onBlurOut = function (value, schemaOpt) {
    return value
};

module.exports = new formatter();