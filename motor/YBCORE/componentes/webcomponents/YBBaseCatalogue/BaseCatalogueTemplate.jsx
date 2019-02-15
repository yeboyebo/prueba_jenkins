import React from "react";
import YBBaseCatalogItem from "../YBBaseCatalogItem/CatalogItemTemplate.jsx";
import YBBaseLoading from "../YBBaseLoading/YBBaseLoading.jsx";

export default (props, state) => {
	const { error, isLoaded, items } = state;
	if (error) {
      return <div>Error: {error.message}</div>;
    }
    else if (!isLoaded) {
      return <YBBaseLoading />;
    }
    else {
	    return (
	        <div className={ props.name + " row row-eq-height"}>
	            {items.map(item =>
			        <YBBaseCatalogItem
			        	item={ item }
			        	key={ item.sku }
			        />
	        	)}
	        </div>
	    )
	}
}
