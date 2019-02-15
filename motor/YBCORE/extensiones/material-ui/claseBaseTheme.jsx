var React = require("react");
var mui = require("material-ui/lib/index");
var ThemeManager = new mui.Styles.ThemeManager();

var OuterMostParentComponent = React.createClass ({

	"childContextTypes": {
		"muiTheme": React.PropTypes.object
	},

	getChildContext: function() {
		return {
			"muiTheme": ThemeManager.getCurrentTheme()
		};
	},

	render: function() {
		return "";
	}
});

module.exports = OuterMostParentComponent;

var _Wrapper = React.createClass({

	"childContextTypes" : {
		"muiTheme": React.PropTypes.object
	},

	getChildContext: function() {
		return {
			"muiTheme": ThemeManager.getCurrentTheme()
		}
	},

	render: function() {
		return 	<div>
					{ this.props.children }
				</div>;
	}
});

var _themeMixin = {
	"childContextTypes": {
		"muiTheme": React.PropTypes.object
	},

	getChildContext: function() {
		return {
			"muiTheme": ThemeManager.getCurrentTheme()
		}
	}
};

function _addmixinclass(miclase)
{
	if (miclase.mixins) {
		miclase.mixins.push(_ThemeMixin);
	}
	else {
		miclase.mixins = [_ThemeMixin];	
	}	
	return miclase;
};

function _render(objReactElement, oDOM)
{
	var MiAppBar = React.createClass({
		"displayName": "MiAppBar",

		"childContextTypes": {
			"muiTheme": React.PropTypes.object
		},

		getChildContext: function() {
			return {
				"muiTheme": ThemeManager.getCurrentTheme()
			};
		},

		render: function() {
			return objReactElement;
		}
	});

	React.render(React.createElement(MiAppBar, null), oDOM);
};

function _render2(clsReact, props, oDOM)
{
	var MiAppBar = React.createClass({
		
		"displayName": "MiAppBar",
		"childContextTypes": {
			"muiTheme": React.PropTypes.object
		},

		getChildContext: function() {
			return {
				"muiTheme": ThemeManager.getCurrentTheme()
			};
		},

		render: function() {
			return React.createElement(clsReact, props);
		}
	});

	React.render(React.createElement(MiAppBar, null), oDOM);
};

module.exports ={
	"Wrapper": _Wrapper,
	"addMixinClass": _addmixinclass,
	"render": _render,
	"render2": _render2,
	"themeMixin": _themeMixin,
}
