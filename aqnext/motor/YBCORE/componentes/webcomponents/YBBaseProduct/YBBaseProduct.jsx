import React from "react";

import YBBaseComp from "../YBBaseComp/YBBaseComp.jsx";

class YBBaseProduct extends YBBaseComp {

    constructor(props) {
        super(props);
        this.sku = this.getSku();
        this.state = {
            "error": null,
            "isLoaded": false,
            "product": {}
	    };
    }

    getSku() {
        var url = new URL(window.location.href);
		return url.searchParams.get("sku");
    }

   	componentDidMount() {
	    fetch("http://local2.elganso.com/syncapi/index.php/category/" + this.sku, {"mode": "cors"})
        .then(res => res.json())
        .then(
            (result) => {
                this.setState({
                    "isLoaded": true,
                    "product": result[0]
                });
            },

            (error) => {
                this.setState({
                    "isLoaded": true,
                    error
                });
            }
        )
    }
}

YBBaseProduct.defaultProps = YBBaseProduct.getDefProps(YBBaseComp, {
    "name": "YBBaseProduct",
    "template": "BaseProductTemplate"
});

export default YBBaseProduct;
