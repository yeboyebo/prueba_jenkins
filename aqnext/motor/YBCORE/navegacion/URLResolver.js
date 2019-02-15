/*
Este modulo sera responsable de procesar peticiones de accionpermitira a la parte Javascrip resolver URL estandar
de  REST...
No se conecta a servidor, sino que tendra que mantenerse configuracion coherente con los router
Es un singleton
*/

//Atributos internos
//var _directorioRaiz = "{% url 'root' %}";
var _directorioRaiz = "/";

// Constructor
function URLResolver() {};

// class methods
function getBaseREST(modelo, id, tipo) {
    id = id || 0;
    if (id) {
        //id = encodeURIComponent(id)
        if (typeof id === "string") {
            id = id.replace("/", "_$_")
        }
        return _directorioRaiz + "models/REST/" + modelo + "/" + id + "/" + tipo;
    }
    else {
        return _directorioRaiz + "models/REST/" + modelo + "/" + tipo;
    }
};

function getBaseLayOut(aplic, modelo, id, isQuery) {
    id = id || 0;
    if (id) {
        return _directorioRaiz +  aplic + "/" + modelo + "/PK/" + id;
    }
    else {
        if (isQuery) {
            return _directorioRaiz + aplic + "/" + modelo + "/Q";
        }
        else {
            return _directorioRaiz + aplic + "/" + modelo;
        }
    }
};

//Establecer directorio base
URLResolver.prototype.setRaiz = function(raiz) {
    _directorioRaiz = raiz;
};

//Establecer directorio base
URLResolver.prototype.getRaiz = function() {
    return _directorioRaiz;
};

URLResolver.prototype.getRESTAccion = function(modelo, id, accion) {
    return getBaseREST(modelo, id, "accion") + "/" + accion;
};

URLResolver.prototype.getRESTAccionF = function(modelo, id, accion) {
    return getBaseREST(modelo, id, "accionF") + "/" + accion;
};

URLResolver.prototype.getRESTCsv = function(modelo, id, accion) {
    return getBaseREST(modelo, id, "csv") + "/" + accion;
};

URLResolver.prototype.getRESTReport = function(modelo, id, accion) {
    return getBaseREST(modelo, id, "jreport") + "/accion/" + accion;
};

URLResolver.prototype.getRESTfile = function(modelo, id, accion) {
    return getBaseREST(modelo, id, "getfile");
};

URLResolver.prototype.getRESTQuery = function(modelo, busq) {
    busq = busq || "list";
    return getBaseREST(modelo, 0, busq);
};

URLResolver.prototype.getLayOUT = function(aplic, modelo, template, id, modif, isQuery) {
    isQuery = isQuery || false;
    modif = modif || "";
    var aux = getBaseLayOut(aplic, modelo, id, isQuery) + "/" + template;
    if (modif != "") {
        aux += "/" + modif;
    }

    return aux;
};

URLResolver.prototype.getAclAccion = function(modelo, pk, accion) {
    return _directorioRaiz + "system/acl/" + modelo + "/" + pk + "/accion" + "/" + accion;
};

URLResolver.prototype.getTemplate = function (aplic, modelo, pk, template) {
    if (pk && template) {
        return _directorioRaiz + aplic + "/" + modelo + "/" + pk + "/" + template;
    }
    else if (pk && !template) {
        return _directorioRaiz + aplic + "/" + modelo + "/" + pk;
    }
    else if (!pk && template) {
        return _directorioRaiz + aplic + "/" + modelo + "/" + template;
    }
    else if (aplic && !pk && !template) {
        return _directorioRaiz + aplic + "/" + modelo;
    }
    else {
        return _directorioRaiz;
    }
};

module.exports = new URLResolver();
