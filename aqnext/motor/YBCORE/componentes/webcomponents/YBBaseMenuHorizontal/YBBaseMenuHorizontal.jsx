import React from "react";

import YBBaseComp from "../YBBaseComp/YBBaseComp.jsx";

class YBBaseMenuHorizontal extends YBBaseComp {

    constructor(props) {
        super(props);
        this.state = {"items": this.getItems(props)};
    }

    getItems(props) {
    	//Aqui haría peticion a server, pero para pruebas
    	if (props.menuId == "principal") {
    		var menuItems = [
                {"name": "Inicio", "url": "/", "icon": "", "key": "0"},
                {"name": "Hombre", "url": "/catalogue?cat=4", "icon": "", "key": "1"},
                {"name": "Mujer", "url": "/catalogue?cat=5", "icon": "", "key": "6"}
            ];
    	}
        else {
    		var menuItems = [
                {"name": "Iniciar Sesion", "url": "/", "icon": "", "key": "2"},
                {"name": "Bag", "url": "/login", "icon": "", "key": "3"}
            ];
    	}
    	return menuItems;
    }
}

YBBaseMenuHorizontal.defaultProps = YBBaseMenuHorizontal.getDefProps(YBBaseComp, {
    "name": "YBBaseMenuHorizontal",
    "template": "BaseMenuHorizontalTemplate",
    "menuId": "default"
});

export default YBBaseMenuHorizontal;
