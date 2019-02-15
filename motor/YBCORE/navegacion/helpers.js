/*
Funciones rapidas para ejecutar metodos
*/
const appjson = "application/json";
var $ = require("jquery")

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        var cookies = document.cookie.split(";");
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie("csrftoken");

//Inicializacion para que haga stringify
function csrfSafeMethod(method) {
	// these HTTP methods do not require CSRF protection
	return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.ajaxSetup({
	beforeSend: function (jqXHR, options) {
		if (options.contentType && options.contentType.indexOf(appjson) >= 0 && typeof options.data != "string") {
			options.data = JSON.stringify(options.data);
		}
		if (!csrfSafeMethod(options.type) && !this.crossDomain) {
			jqXHR.setRequestHeader("X-CSRFToken", csrftoken);
		}
	}
});

// Carga AJAX (onEnd no requerido)
module.exports.loadAJAX = function (selector, url, onEnd) {
	var $aux = $(selector);
	$aux.load(url,onEnd);
	return $aux;
};

module.exports.getAJAX = function (url) {
	var midata;
	$.ajax({
		"url": url,
		"async": false,
		"dataType": "json",
		"success": function (data) { midata = data },
		"error": function(xhr) { midata = null }
	});
	return midata;
};

var _default_error=function( xhr, textStatus, errorThrown) {
	//alert("Error en peticion: " + textStatus);
	console.log("Peticion error", textStatus, errorThrown);
	//console.log(xhr.status + ": " + xhr.responseText);
};
var _default_success=function(data) {
	// console.log("PETICION CORRECTA")
	// console.log(data);
};

module.exports.requestAccion = function (url, data, method, misuccess, mierror) {
	method = method || "PUT";
	misuccess = misuccess || _default_success;
	mierror = mierror || _default_error;
	return $.ajax({
		"url": url,
		"data": data,
		"dataType": "json",
		"error": mierror,
		"success": misuccess,
		"contentType": appjson,
		"method": method,
		"processData": false,
		"async": false
	});
};

module.exports.requestAccionDelete = function (url, data, method, misuccess, mierror) {
	method = method || "PUT";
	misuccess = misuccess || _default_success;
	mierror = mierror || _default_error;
	$.ajax({
		"url": url,
		"data": data,
		"dataType": "json",
		"error": mierror,
		"contentType": appjson,
		"success": misuccess,
		"method": method,
		"processData": false
	});
};

module.exports.requestGET = function (url, QueryParam, misuccess, mierror) {
	var method = "GET";
	QueryParam = QueryParam || {};
	var aux = $.param(QueryParam);
	var miurl = url + "?" + aux;
	// console.log("URL GET : " + miurl);
	misuccess = misuccess || _default_success;
	mierror = mierror || _default_error;
	$.ajax({
		"url": miurl,
		"dataType": "json",
		"error": mierror,
		"success": misuccess,
		"method": method
	});
};

module.exports.requestGETre = function (url, QueryParam, misuccess, mierror) {
	var method = "GET";
	QueryParam = QueryParam || {};
	var aux = $.param(QueryParam);
	var miurl = url + "?" + aux;
	//console.log("URL GET : " + miurl);
	misuccess = misuccess || _default_success;
	mierror = mierror || _default_error;
	return $.ajax({
		"url": miurl,
		"async": false,
		"dataType": "json",
		"error": mierror,
		"success": misuccess,
		"method": method
	});
};

module.exports.requestAccionF = function(url, formData, misuccess, mierror) {
    misuccess = misuccess || _default_success;
    mierror = mierror || _default_error;
    $.ajax({
        url: url,
        data: formData,
        processData: false,
        contentType: false,
        type: 'POST',
        success: misuccess,
        error: mierror
    });
};

module.exports.emptyf = function () { return null; };