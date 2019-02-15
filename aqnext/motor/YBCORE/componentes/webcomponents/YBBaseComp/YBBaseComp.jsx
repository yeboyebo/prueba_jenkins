import React from "react";
import _ from "underscore";

import ReactLoader from "../../../navegacion/ReactLoader.js"

class YBBaseComp extends React.Component {

    constructor(props) {
        super(props);
    }

    name() {
        return this.props.name;
    }

    template() {
        return this.props.template;
    }

    render() {
        return ReactLoader.getTemplate(this);
    }
}

YBBaseComp.getDefProps = (parent, props) => {
    return _.extend(_.extend({}, parent.defaultProps), props);
}

YBBaseComp.defaultProps = YBBaseComp.getDefProps(React.Component, {
    "name": "YBBaseComp",
    "template": "DefaultTemplate"
});

export default YBBaseComp;
