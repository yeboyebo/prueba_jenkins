import React from "react";
import YBBaseLogo from "../YBBaseLogo/YBBaseLogo.jsx";
import YBBaseMenuHorizontal from "../YBBaseMenuHorizontal/YBBaseMenuHorizontal.jsx";

export default (props, state) => {
    return (
        <div className={ props.name +" row row-eq-height" }>
            <div className="col-md-4">
            	<YBBaseMenuHorizontal
            		menuId={"principal"}
        		/>
            </div>
            <div className="col-md-4">
            	<YBBaseLogo
				    key={ "logo" }
				/>
            </div>
            <div className="col-md-4">
            	<YBBaseMenuHorizontal
            		menuId={"secundario"}
        		/>
            </div>
        </div>
    )
}
