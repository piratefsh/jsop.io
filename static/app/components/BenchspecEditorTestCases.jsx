import React from 'react';

export default React.createClass({
  // get testcase to be added
  handleOnAdd(){
    const values = {
      id: Date.now() //temp id before sent to server
    }

    for (let ref in this.refs){
      const elem = this.refs[ref]
      const val = elem.type == 'checkbox' ? elem.checked : elem.value.trim()
      values[ref] = val
    }

    this.props.onAdd(values)
  },

  // generate list of test cases
  testCases(cases){
    let nodes = cases.map(function(c, i){
      return (
        <li className="case" key={c.id}> <strong>{ c.label } : </strong>
          { c.note_md }
          <pre>{ c.js_code }</pre>
          <div>
            { c.is_async ? "async":"" }
                { c.is_default ? "default":"" }
                { c.is_archived ? "archived":"" }
            <button data-idx="{ idx }" className="rmv-case btn btn-danger pull-right">-</button>
          </div>
        </li>
        )
    })
    return nodes
  },

  render() {
    return (<section>
      <h3>Test Cases</h3>
      <ul className="case-list">{this.testCases(this.props.benchmark.cases)}</ul>

      <h4>Add Test Case</h4>
      <div className="form-horizontal">
        <fieldset className="form-group">
          <label className="control-label">Label:</label>
          <div>
            <input className="form-control" name="case-label" ref="label"/>
          </div>
        </fieldset>
        <fieldset className="form-group">
          <label className="control-label">Notes:</label>
          <div>
            <input className="form-control" name="case-note_md" ref="note_md"/>
          </div>
        </fieldset>
        <fieldset className="form-group">
          <label className="control-label">JS:</label>
          <div>
            <textarea className="form-control" name="case-js_code" ref="js_code"></textarea>
          </div>
        </fieldset>
      </div>

      <div className="form-inline pull-right">
        <fieldset className="form-group">
          <div className="checkbox">
            <label>
              <input type="checkbox" name="case-is_async" ref="is_async"/>
              async
            </label>
          </div>
        </fieldset>
        <fieldset className="form-group">
          <div className="checkbox">
            <label>
              <input type="checkbox" name="case-is_default" ref="is_default"/>
              default
            </label>
          </div>
        </fieldset>
        <fieldset className="form-group">
          <div className="checkbox">
            <label>
              <input type="checkbox" name="case-is_archived" ref="is_archived"/>
              archived
            </label>
          </div>
        </fieldset>
        <fieldset className="form-group">
          <button className="add-case btn btn-primary" onClick={this.handleOnAdd}>+</button>
        </fieldset>
      </div>
      </section>
    )
  }
})