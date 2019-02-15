import React from "react";

export default (props, state) => {
	var product = props.item;
    return (
        <div className={ props.name + " col-md-3"}>
        	<a href={"/product?sku=" + product.sku}>
	            <img src={product.image}/>
	            <h3 className="title">{product.name}</h3>
	            <p className="price">{product.price}</p>
	        </a>
        </div>
    )
}
