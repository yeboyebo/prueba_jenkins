import React from "react";

export default (props, state) => {
    return (
        <div className={ props.name }>
   			<ul className={"menu-"+props.menuId}>
          		{state.items.map(item =>
        			<li className="item" key={item.key}>
                        <a href={item.url} key={"a-" + item.key}>{item.name}</a>
                    </li>
        		)}
        	</ul>
        </div>
    )
}
