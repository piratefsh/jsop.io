import React from 'react';

export default React.createClass({

  handleOnChange(e){
    const values = {}

    for (let ref in this.refs){
      const elem = this.refs[ref]
      const val = elem.value.trim()
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
           <textarea onChange={this.handleOnChange} 
            className="attr form-control" 
            name="js_setup" ref="js_setup" 
            value={this.props.benchmark.js_setup}></textarea>
         </div>
        </fieldset>
        <fieldset className="form-group">
         <label className="control-label">JS Teardown</label>
         <div>
           <textarea onChange={this.handleOnChange} 
            className="attr form-control" 
            name="js_teardown" 
            ref="js_teardown" 
            value={this.props.benchmark.js_teardown}></textarea>
         </div>
        </fieldset>
      </section>
    )
  }
})