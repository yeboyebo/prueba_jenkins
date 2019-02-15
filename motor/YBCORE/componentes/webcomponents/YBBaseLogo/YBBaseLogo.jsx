import React from "react";

import YBBaseComp from "../YBBaseComp/YBBaseComp.jsx";

class YBBaseLogo extends YBBaseComp {

    constructor(props) {
        super(props);
    }

}

YBBaseLogo.defaultProps = YBBaseLogo.getDefProps(YBBaseComp, {
    "name": "YBBaseLogo",
    "template": "BaseLogoTemplate"
});

export default YBBaseLogo;
