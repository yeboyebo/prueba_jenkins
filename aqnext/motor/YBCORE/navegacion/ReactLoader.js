import React from "react";
import ReactDOM from "react-dom";

const sep = "/";
const portalFolder = sep + "apps/portal" + sep;
const componentsFolder = sep + "components" + sep;
const extension = ".jsx";
const defaultFile = sep + "Default" + extension;

let cache = {};

var ReactLoader = {

    loadContext(ctx) {
        try {
            ctx.keys().forEach(key => cache[key] = ctx(key));
        }
        catch(e) {
            return false;
        }
    },

    importComponents() {
        let aCtx = [
            require.context("../../../clientes/", true, /\.jsx$/),
            // require.context("../../../extensiones/", true, /\.jsx$/),
            require.context("../componentes/webcomponents/", true, /\.jsx$/)
        ];

        for (let i in aCtx) {
            this.loadContext(aCtx[i]);
        }
    },

    find(comp, tmp, cust, theme, ext) {
        let aPaths = [
            "./" + cust + portalFolder + theme + componentsFolder + comp + sep + tmp + extension,
            "./" + ext + componentsFolder + comp + sep + tmp + extension,
            "./" + comp + sep + tmp + extension,
            "./" + cust + portalFolder + theme + componentsFolder + comp + defaultFile,
            "./" + ext + componentsFolder + comp + defaultFile,
            "./" + comp + defaultFile,
        ];

        for (let i in aPaths) {
            if (aPaths[i] in cache) {
                return cache[aPaths[i]];
            }
        }
        return false;
    },

    init() {
        if (Object.keys(cache).length == 0) {
            this.importComponents();
        }
    },

    getTemplate(comp) {
        // Tmp. Cliente y Tema de configuración
        // Tmp. Ultima extension de configuración, o de donde se pueda
        let cust = "defaultcust";
        let theme = "defaulttheme";
        let ext = "ultextension";

        this.init();

        let name = comp.name();
        let tmpl = comp.template();

        let template = this.find(name, tmpl, cust, theme, ext);
        if (!template) {
            console.error("No se pudo cargar el template " + tmpl + " para " + name);
            return false;
        }
        return template.default(comp.props, comp.state);
    },

    getComponent(comp, domObj, props) {
        // Tmp. Cliente y Tema de configuración
        // Tmp. Ultima extension de configuración, o de donde se pueda
        let cust = "defaultcust";
        let theme = "defaulttheme";
        let ext = "ultextension";

        this.init();

        let component = this.find(comp, comp, cust, theme, ext);
        if (!component) {
            console.error("No se pudo cargar el componente " + comp);
            return false;
        }
        return ReactDOM.render(<component.default {...props}/>, domObj);
    }
};

export default ReactLoader


/*

-----Loader-----

- Defs:
    - Nivel personalizacion:
        - core -> Por defecto en todas las webs (motor)
        - community -> Extensiones que pueden estar instaladas o no (Extensiones intermedias)
        - local -> Personalizacion de core o community para un cliente concreto (cliente)
    - Parametros:
        - Componente -> Nombre del jsx del componente
        - Template -> Nombre del template especifico para ese componente
        - Cliente -> Nombre del proyecto
        - Tema -> Personalizacion de la web
- Orden:
    - Cliente/Tema/Componente/Template.jsx
    - Community/Componente/Template.jsx // Damos por hecho que solo habrá una, hasta que implantemos herecia tipo arbol (y saquemos la más cercana al cliente)
    - Core/Componente/Template.jsx
    - Cliente/Tema/Componente/Default.jsx
    - Community/Componente/Default.jsx
    - Core/Componente/Default.jsx
*/
