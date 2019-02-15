import YBBaseComp from "../YBBaseComp/YBBaseComp.jsx";

class YBBaseAside extends YBBaseComp {

    constructor(props) {
        super(props);
    }

}

YBBaseAside.defaultProps = YBBaseAside.getDefProps(YBBaseComp, {
    "name": "YBBaseAside",
    "template": "BaseAsideTemplate"
});

export default YBBaseAside;
