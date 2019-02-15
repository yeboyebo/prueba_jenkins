var React = require("react");

var YBSeparatorItemBase = {

    render: function() {

        return  <div className="YBSeparator"><hr className="YBSeparatorItem"/></div>;
    }
};

var YBSeparatorItem = React.createClass(YBSeparatorItemBase);

module.exports.generaYBSeparator = function(objAtts, objFuncs)
{

    return  <YBSeparatorItem
                key = { objAtts.name }
                name = { objAtts.name }
                LAYOUT = { objAtts.LAYOUT }/>;
};
