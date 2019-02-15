import React from "react";
import YBBaseLoading from "../YBBaseLoading/YBBaseLoading.jsx";

export default (props, state) => {
    const { error, isLoaded, product } = state;
    if (error) {
        return <div>Error: {error.message}</div>;
    }
    else if (!isLoaded) {
        return <YBBaseLoading />;
    }
    else {
        return (
            <div className={ props.name + " row"}>
                <div className="col-md-2"></div>
                <div className="col-md-5">
                    <img src={product.image}/>
                </div>
                <div className="col-md-3 info">
                    <h3 className="title">{product.name}</h3>
                    <span className="sku">{product.sku}</span>
                    <p className="price">{product.price}</p>
                    <a className="btn btn-primary addToCart">Añadir a la cesta</a>
                </div>
                <div className="col-md-2"></div>
            </div>
        )
    }
}
