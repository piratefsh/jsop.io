import React from 'react';
import AceEditor from 'react-ace';
import brace from 'brace'
import javascipt from 'brace/mode/javascript';
import theme from 'brace/theme/github';

export default React.createClass({

  handleOnChange(e){
    const values = {}

    for (let ref in this.refs){
      const elem = this.refs[ref]
      let val = ""
      if('editor' in elem){
        val = elem.editor.getValue()
      }
      else{
        val = elem.value.trim()
      }
      values[ref] = val
    }
    
    this.props.onChange(values)
  },
  
  render() {
    return (
      <section>
        <h3>Setup and Teardown</h3>
        <fieldset className="form-group">
         <label className="control-label">HTML</label>
         <div>
          <textarea onChange={this.handleOnChange} 
            className="attr form-control" 
            name="html_code" ref="html_code" 
            value={this.props.benchmark.html_code}></textarea>
         </div>
        </fieldset>
        <fieldset className="form-group">
          <label className="control-label">JS Setup</label>
          <div>
            <AceEditor
              className="ace-editor attr form-control" 
              mode="javascript"
              theme="github"
              ref="js_setup" 
              name="js_setup" 
              editorProps={{$blockScrolling: true}}
              onChange={this.handleOnChange} 
              value={this.props.benchmark.js_setup}/>
          </div>
        </fieldset>
        <fieldset className="form-group">
         <label className="control-label">JS Teardown</label>
         <div>
            <AceEditor
              className="ace-editor attr form-control" 
              mode="javascript"
              theme="github"
              editorProps={{$blockScrolling: true}}
              name="js_teardown" 
              ref="js_teardown" 
              value={this.props.benchmark.js_teardown}
              onChange={this.handleOnChange} />
         </div>
        </fieldset>
      </section>
    )
  }
})