var React = require("react");

var YBTableEditableCellBase = {

    getInitialState: function() {
        return {
            listenBlur: false
        };
    },

    _onCellEdit: function(event) {
        event.persist();
        let value = event.target.value;
/*        while (value.toString().startsWith("0") && value != "0") {
            value = value.substr(1);
        }*/
        this.props.onCellEdit(this.props.COLUMN, value);
        //this.setState({val: value});
    },

    _onKeyDown: function(event) {
        event.persist();
        if(event.which != 13 &&  event.which != 9) {
            return;
        }

        event.preventDefault();
        this.setState({
          listenBlur: true
        });
        //this.refs.editableInput.blur();
        this.props.onCellEnter(this.props.COLUMN.colKey);
        // this.props.onBufferChange(this.props.index, this.props.COLUMN.colKey, event.target.value);
    },

    _onKeyPress: function(event) {
        const re = /[0-9,\-]+/g;
        if (!re.test(event.key)) {
          event.preventDefault();
        }
    },

    _onBlur: function(event) {
        console.log(this.state.listenBlur)
        event.preventDefault();
        if(!this.state.listenBlur) {
            this.props.onCellEnter(this.props.COLUMN.colKey);
            this.setState({
              listenBlur: false
            });
        }
    },

    _onEditableInputFocus: function(event) {
        event.preventDefault();
        //this.props.onCellEdit(this.props.COLUMN, event.target.value);
        console.log("setSelectionRange")
        this.refs.editableInput.setSelectionRange(0, 9999);
        this.setState({
          listenBlur: false
        });
    },

    _onTouch: function(event) {
        event.preventDefault();
        var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if(iOS) {
            console.log("IOS");
            this.refs.editableInput.setSelectionRange(0, 9999);
        }
        console.log("alert");
        //alert("touch");
    },

    _renderInput: function() {
        var style = {
            input: {
                textAlign: this.props.COLUMN.colAlign
            }
        };

        if(this.props.COLUMN.colType == "string") {
            return (<input ref="editableInput" type="string" style={ style.input } onFocus={ this._onEditableInputFocus } onTouchStart={ this._onTouch } value={ this.props.DATA || "" } required={ true } onChange={ this._onCellEdit } onKeyDown={ this._onKeyDown } onBlur={ this._onBlur }/>);
        }
        else {
            return (<input ref="editableInput" type="tel" style={ style.input } onFocus={ this._onEditableInputFocus } onTouchStart={ this._onTouch } value={ this.props.DATA } required={ true } onChange={ this._onCellEdit } onKeyDown={ this._onKeyDown } onKeyPress={ this._onKeyPress } onBlur={ this._onBlur }/>);
        }
    },

    render: function() {

        var className = "YBTableEditableCell";
        className += this.props.isChanged ? " changed" : "";

        var style = {
            div: {
                width: this.props.COLUMN.colWidth,
                flexGrow: this.props.COLUMN.colFlex
            }
        };

        var input = this._renderInput();

        return  <div className={ className } style={ style.div } onClick={ this.props.onRowClick }>
                    { input }
                </div>;
    }
};

var YBTableEditableCell = React.createClass(YBTableEditableCellBase);

module.exports.generaYBTableEditableCell = function(objAtts, objFuncs)
{
    var data = objAtts.data;
    if (objAtts.col.colType == "number"){
        if(data)
            data = data.toString().replace(".", ",");
        else
            data = 0;
    }
    return  <YBTableEditableCell
                key = { objAtts.col.colKey + "__" + objAtts.rowPk }
                index = { objAtts.index }
                COLUMN = { objAtts.col }
                DATA = { data }
                isChanged = { objAtts.isChanged }
                onCellEdit = { objFuncs.onCellEdit }
                onCellEnter = { objFuncs.onCellEnter }
                onBufferChange = { objFuncs.onBufferChange }/>;
};
