import YBBaseComp from "../YBBaseComp/YBBaseComp.jsx";

class YBBaseHome extends YBBaseComp {

    constructor(props) {
        super(props);
    }

}

YBBaseHome.defaultProps = YBBaseHome.getDefProps(YBBaseComp, {
    "name": "YBBaseHome",
    "template": "BaseHomeTemplate"
});

export default YBBaseHome;
