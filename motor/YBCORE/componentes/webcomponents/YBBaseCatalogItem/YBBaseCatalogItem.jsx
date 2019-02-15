import React from "react";

import YBBaseComp from "../YBBaseComp/YBBaseComp.jsx";

class YBBaseCatalogItem extends YBBaseComp {

    constructor(props) {
        super(props);
    }

}

YBBaseCatalogItem.defaultProps = YBBaseCatalogItem.getDefProps(YBBaseComp, {
    "name": "YBBaseCatalogItem",
    "template": "CatalogItemTemplate"
});

export default YBBaseCatalogItem;
