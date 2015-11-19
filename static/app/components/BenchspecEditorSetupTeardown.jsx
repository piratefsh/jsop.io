import React from 'react';
import JavascriptCodeEditor from './JavascriptCodeEditor';

export default React.createClass({

  handleOnChange(e) {
    const values = {};

    for (let ref in this.refs) {
      const elem = this.refs[ref];
      let val = '';
      if ('getEditor' in elem) {
        val = elem.getEditor().getValue();
      } else {
        val = elem.value.trim();
      }
      values[ref] = val;
    }

    this.props.onChange(values);
  },

  render() {
    return (
      <section>
        <h3>Setup and Teardown</h3>
        <fieldset className='form-group'>
         <label className='control-label'>HTML</label>
         <div>
          <textarea onChange={this.handleOnChange}
            className='form-control'
            name='html_code' ref='html_code'
            value={this.props.benchmark.html_code}></textarea>
         </div>
        </fieldset>
        <fieldset className='form-group'>
          <label className='control-label'>JS Setup</label>
          <div>
            <JavascriptCodeEditor
              className='js-editor'
              ref='js_setup'
              name='js_setup'
              value={this.props.benchmark.js_setup}
              onChange={this.handleOnChange} 
              />
          </div>
        </fieldset>
        <fieldset className='form-group'>
         <label className='control-label'>JS Teardown</label>
         <div>
            <JavascriptCodeEditor
              className='js-editor'
              ref='js_teardown'
              name='js_teardown'
              value={this.props.benchmark.js_teardown}
              onChange={this.handleOnChange} />
         </div>
        </fieldset>
      </section>
    );
  }
});
