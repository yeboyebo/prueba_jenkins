var React = require("react");
var _ = require("underscore");
var YBListItem = require("./YBListItem.jsx");

var YBListBase = {

    getInitialState: function() {
        return {
            "selecteds": [],
            "selectedsOnly": false
        };
    },

    _getListActions: function(keyPrefix) {
        if (!this.props.listActions) {
            return "";
        }

        var style = {
            "cursor": "pointer"
        };

        keyPrefix = keyPrefix && keyPrefix != "" ? keyPrefix + "__" : "";
        return this.props.listActions.map((action, ind) => {
            return  <div key={ keyPrefix + action.key } className="YBTableListAction">
                        <i
                            className="material-icons"
                            style={ style }
                            onClick={ this.props.onActionExec.bind(this, action, ind, true) }>
                                { this.props.acciones[action.key].icon }
                        </i>
                    </div>;
        });
    },

    _renderListActions: function() {
        return this._getListActions();
    },

    _onRowCheck: function(pk) {
    	this.props.onRowCheck(pk);
    },

    _isSelected: function(pk) {
    	return this.props.isSelected(pk);
    },

    _renderListItems: function() {
        return this.props.DATA.filter((item) => {
            return !this.state.selectedsOnly || this._isSelected(item.pk);
        }).map((item, ind) => {
            let items;

            if (item.hasOwnProperty("metadata")) {
                let colsCopy = $.extend(true, [], this.props.ITEMS);
                items = colsCopy.map((col) => {
                    let metadataCols = item["metadata"].filter((metaCol) => {
                        return col.colKey == metaCol.colKey;
                    });
                    return _.extend(col, metadataCols[0]);
                });
            }
            else {
                items = this.props.ITEMS;
            }

            let checked = this._isSelected(item.pk);

			var objAtts = {
				"i": ind,
				"items": items,
				"itemData": item,
                "LAYOUT": this.props.LAYOUT,
				"STATICURL": this.props.STATICURL,
                "drawIf": this.props.drawIf,
				"name": this.props.name,
				"prefix": this.props.PREFIX,
				"rowclick": this.props.rowclick,
				"listActions": this.props.gridActions,
				"acciones": this.props.acciones,
				"multiselectable": this.props.multiselectable,
				"colorRowField": this.props.colorRowField,
				"tipoTabla": this.props.tipoTabla,
				"checked": checked
			};
			var objFuncs = {
				"lanzarAccion": this.props.lanzarAccion,
				"onActionExec": this.props.onActionExec,
                "onRowCheck": this._onRowCheck,
                "formatter": this.props.formatter,
                "getFiles": this.props.getFiles
			};
			
			return YBListItem.generaYBListItem(objAtts, objFuncs);
        });
    },

    render: function() {
        var listItems = this._renderListItems();
        return  <div className="YBLista">
                    <div className="YBListItems">
                        { listItems }
                    </div>
                </div>;
    }
};

var YBList = React.createClass(YBListBase);

function _getItemsFromSCHEMALayout(SCHEMA, LAYOUT) {
    var items = {
    	"avatar": {},
    	"primary": {
    		"title": false,
    		"subtitle": false,
    		"body": []
    	},
    	"secondary": {
    		"item": false,
    		"actions": false
    	}
   	};
    LAYOUT.filter((item) => {
        return item.tipo == "field" && item.hasOwnProperty("listpos");
    }).map((field) => {
       switch (field.listpos) {
            case "avatar": {
                items["avatar"] = field.field;
                break;
            }
            case "title": {
                items.primary["title"] = field.field;
                break;
            }
            case "subtitle": {
                items.primary["subtitle"] = field.field;
                break;
            }
            case "body": {
                items.primary["body"].push(field.field);
                break;
            }
            case "secondaryitem": {
                items.secondary["item"] = field.field;
                break;
            }
        }
    });

    var actions = LAYOUT.filter((item) => {
        return item.tipo == "act" || item.tipo == "actList";
    });

    return {
        "fields": items,
        "actions": actions
    };
};


module.exports.generaYBList = function(objAtts, objFuncs)
{
    return  <YBList
                key = { objAtts.name }
                titulo = { objAtts.titulo }
                name = { objAtts.name }
                STATICURL = { objAtts.STATICURL }
                LAYOUT = { objAtts.LAYOUT }
                tipoTabla = { objAtts.tipoTabla }
                IDENT = { objAtts.IDENT }
                PREFIX = { objAtts.PREFIX }
                ITEMS = { objAtts.ITEMS.items }
                drawIf = { objAtts.drawIf }
                rowclick = { objAtts.rowclick }
                listActions = { objAtts.accionesList }
                acciones = { objAtts.acciones }
                lanzarAccion = { objFuncs.lanzarAccion }
                DATA = { objAtts.DATA }
                className = { objAtts.className }
                paginacion = { objAtts.paginacion }
                onDataChange = { objFuncs.onDataChange }
                onActionExec = { objFuncs.onActionExec }
                onRowCheck = { objFuncs.onRowCheck }
                onAllCheck = { objFuncs.onAllCheck }
                isSelected = { objFuncs.isSelected }
                multiselectable = { objAtts.multiselectable }
                doubleListActions = { objAtts.doubleListActions }
                loadSelecteds = { objAtts.loadSelecteds }
                getFiles = { objFuncs.getFiles }
                colorRowField = { objAtts.colorRowField }
                formatter = { objAtts.ITEMS.formato }/>;
};
