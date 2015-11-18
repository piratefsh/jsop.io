import React from 'react';
import classNames from 'classnames';

export default React.createClass({

  getInitialState() {
    return {
      hideForm: true
    }
  },

  // get dependency to be added
  handleOnAdd(){
    const values = {
      //temp id before sent to server
      id: Date.now() 
    }

    for (let ref in this.refs){
      const elem = this.refs[ref]
      const val = elem.value.trim()
      values[ref] = val

      // clear value
      elem.value = ""
    }
    
    this.props.onAdd(values)
  },

  toggleFormState(){
    this.setState({hideForm: !this.state.hideForm})
  },

  // generate list of dependencies
  dependencyList(dependencies){
    let nodes = dependencies.map((dep, i) => {
      return (
        <li className="dep" key={dep.var}>
          <div>
            <strong>var {dep.var}</strong> = {dep.name} ({dep.version}) <a href={dep.src}>src</a>
          </div>
          <button data-idx={i} className="rmv-dep btn btn-danger pull-right">-</button>
        </li>
        )
    });
    return nodes
  },

  render() {
    const formClassNames = classNames({
      'hidden': this.state.hideForm,
      'form-horizontal': true
    })

    return (
      <section>
        <h3>Dependencies</h3>
        <ul className="dep-list">{this.dependencyList(this.props.benchmark.dependencies)}</ul>

        <div className={formClassNames}>
          <fieldset className="form-group">
            <label className="control-label">Name</label>
            <div>
              <input className="form-control" name="dep-name" ref="name"/>
            </div>
          </fieldset>
          <fieldset className="form-group">
            <label className="control-label">Version</label>
            <div>
              <input className="form-control" name="dep-version" ref="version"/>
            </div>
          </fieldset>
          <fieldset className="form-group">
            <label className="control-label">URL</label>
            <div>
              <input className="form-control" name="dep-src" ref="src"/>
            </div>
          </fieldset>
          <fieldset className="form-group">
            <label className="control-label">Var</label>
            <div>
              <input className="form-control" name="dep-var" ref="var"/>
            </div>
          </fieldset>
          <fieldset className="form-group">
            <div className="control-label"></div>
            <div>
              <button className="add-dep btn btn-primary pull-right" onClick={this.handleOnAdd}>Add</button>
            </div>
          </fieldset>
        </div>

        <button className="btn btn-default" onClick={this.toggleFormState}>
          {this.state.hideForm ? 'Add Dependency' : 'Hide'}
        </button>
      </section>
    )
  }
})