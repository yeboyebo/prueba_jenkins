import YBBaseComp from "../YBBaseComp/YBBaseComp.jsx";

class YBBaseCatalogue extends YBBaseComp {

    constructor(props) {
        super(props);
        this.category = this.getCategory(props);
        this.state = {
            "error": null,
            "isLoaded": false,
            "items": []
        };
    }

    getCategory(props) {
        if (props.category > 0) {
            return props.category;
        }
        else {
            var url = new URL(window.location.href);
            var cat = url.searchParams.get("cat");
            return cat;
        }
    }

    componentDidMount() {
        fetch("http://local2.elganso.com/syncapi/index.php/category/" + this.category, {"mode": "cors"})
        .then(res => res.json())
        .then(
            (result) => {
                this.setState({
                    "isLoaded": true,
                    "items": result
                });
            },

            (error) => {
                this.setState({
                    "isLoaded": true,
                    error
                });
            }
        )
    }
}

YBBaseCatalogue.defaultProps = YBBaseCatalogue.getDefProps(YBBaseComp, {
    "name": "YBBaseCatalogue",
    "template": "BaseCatalogueTemplate",
    "category": 0
});

export default YBBaseCatalogue;
