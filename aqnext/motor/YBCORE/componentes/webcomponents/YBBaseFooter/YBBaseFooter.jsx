import YBBaseComp from "../YBBaseComp/YBBaseComp.jsx";

class YBBaseFooter extends YBBaseComp {

    constructor(props) {
        super(props);
    }

}

YBBaseFooter.defaultProps = YBBaseFooter.getDefProps(YBBaseComp, {
    "name": "YBBaseFooter",
    "template": "BaseFooterTemplate"
});

export default YBBaseFooter;
