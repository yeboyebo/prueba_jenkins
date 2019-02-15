import React from "react";

import YBBaseComp from "../YBBaseComp/YBBaseComp.jsx";

class YBBaseLoading extends YBBaseComp {

    constructor(props) {
        super(props);
    }

}

YBBaseLoading.defaultProps = YBBaseLoading.getDefProps(YBBaseComp, {
    "name": "YBBaseLoading",
    "template": "BaseLoadingTemplate"
});

export default YBBaseLoading;
