import YBBaseComp from "../YBBaseComp/YBBaseComp.jsx";

class YBBaseHeader extends YBBaseComp {

    constructor(props) {
        super(props);
    }

}

YBBaseHeader.defaultProps = YBBaseHeader.getDefProps(YBBaseComp, {
    "name": "YBBaseHeader",
    "template": "BaseHeaderTemplate"
});

export default YBBaseHeader;
