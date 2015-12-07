import React from 'react';
import AceEditor from 'react-ace';
import brace from 'brace';
import javascipt from 'brace/mode/javascript';
import theme from 'brace/theme/github';

export default React.createClass({
  getEditor(){
    return this.refs.ace.editor;
  },
  render(){
    return (
      <AceEditor
        mode='javascript'
        theme='github'
        name={this.props.name}
        ref='ace'
        className={this.props.className}
        value={this.props.value}
        onChange={this.props.onChange}
        editorProps={{$blockScrolling: true}}
      />)
  }
})