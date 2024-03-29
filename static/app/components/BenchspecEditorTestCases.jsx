import React from 'react';
import classNames from 'classnames';
import JavascriptCodeEditor from './JavascriptCodeEditor';

export default React.createClass({
  getInitialState() {
    return {
      hideForm: true
    };
  },

  toggleFormState() {
    this.setState({hideForm: !this.state.hideForm});
  },

  // get testcase to be added
  handleOnAdd() {
    const values = {
      id: Date.now() //temp id before sent to server
    };

    for (let ref in this.refs) {
      const elem = this.refs[ref];

      let val = '';

      if (elem.type == 'checkbox') {
        val = elem.checked;
      } else if ('getEditor' in elem) {
        val = elem.getEditor().getValue();
      } else {
        val = elem.value.trim();
      }
      values[ref] = val;

      // clear field
      elem.value = '';
    }

    this.props.onAdd(values);
  },

  handleOnDelete(ev) {
    const id = ev.target.getAttribute('data-idx');
    this.props.onDelete(id);
  },

  // generate list of test cases
  testCases(cases) {
    let nodes = cases.map((c, i) => {
      return (
        <li className='case' key={c.id}> <strong>{ c.label } : </strong>
          { c.note_md }
          <pre>{ c.js_code }</pre>
          <div>
            { c.is_async ? 'async' : '' }
            { c.is_default ? 'default' : '' }
            { c.is_archived ? 'archived' : '' }
            <button
              data-idx={i}
              onClick={this.handleOnDelete}
              className='rmv-case btn btn-default pull-right'><i className="fa fa-trash-o"></i></button>
          </div>
        </li>
        );
    });
    return nodes;
  },

  render() {
    const formClassNames = classNames({
      'hidden': this.state.hideForm,
      'form-new': true
    });

    return (
      <section>
        <h3>Test Cases</h3>
        <ul className='case-list'>{this.testCases(this.props.benchmark.cases)}</ul>
        <div className={formClassNames}>
          <div className='form-horizontal'>
          <h4>New Test Case</h4>
            <fieldset className='form-group'>
              <label className='control-label'>Label</label>
              <div>
                <input className='form-control' name='case-label' ref='label'/>
              </div>
            </fieldset>
            <fieldset className='form-group'>
              <label className='control-label'>Notes</label>
              <div>
                <input className='form-control' name='case-note_md' ref='note_md'/>
              </div>
            </fieldset>
            <fieldset className='form-group'>
              <label className='control-label'>JS</label>
              <div>
               <JavascriptCodeEditor
                  className='js-editor'
                  name='case-js_code'
                  ref='js_code'
                  refName='js_code'
                />
              </div>
            </fieldset>
          </div>

          <div className='form-inline pull-right'>
            <fieldset className='form-group'>
              <div className='checkbox'>
                <label>
                  <input type='checkbox' name='case-is_async' ref='is_async'/>
                  async
                </label>
              </div>
            </fieldset>
            <fieldset className='form-group'>
              <div className='checkbox'>
                <label>
                  <input type='checkbox' name='case-is_default' ref='is_default'/>
                  default
                </label>
              </div>
            </fieldset>
            <fieldset className='form-group'>
              <div className='checkbox'>
                <label>
                  <input type='checkbox' name='case-is_archived' ref='is_archived'/>
                  archived
                </label>
              </div>
            </fieldset>
            <fieldset className='form-group'>
            <button className='add-case btn btn-primary' onClick={this.handleOnAdd}>Add</button>
            </fieldset>
          </div>
        </div>
        <button className="btn btn-default" onClick={this.toggleFormState}>{this.state.hideForm ? 'Add Test Case' : 'Hide'}</button>

      </section>
    );
  }
});
