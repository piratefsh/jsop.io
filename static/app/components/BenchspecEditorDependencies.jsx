import React from 'react';

export default React.createClass({

  // generate list of dependencies
  dependencyList(dependencies){
    let nodes = dependencies.map((dep, i) => {
      return (
        <li className="dep" key={dep.var}>
          {dep.name} ({dep.version}) <a href={dep.src}>src</a> ==>
          <strong>var {dep.var}</strong>
          <button data-idx={i} className="rmv-dep btn btn-danger pull-right">-</button>
        </li>
        )
    });
    return nodes
  },

  render() {
    return (
      <section>
        <h3>Dependencies</h3>
        <fieldset>
          <ul className="dep-list">{this.dependencyList(this.props.benchmark.dependencies)}</ul>
        </fieldset>

        <h4>Add Dependency</h4>
        <div className="form-horizontal">
          <fieldset className="form-group">
            <label className="control-label ">Name:</label>
            <div>
              <input className="form-control" name="dep-name" />
            </div>
          </fieldset>
          <fieldset className="form-group">
            <label className="control-label ">Version:</label>
            <div>
              <input className="form-control" name="dep-version" />
            </div>
          </fieldset>
          <fieldset className="form-group">
            <label className="control-label ">URL:</label>
            <div>
              <input className="form-control" name="dep-src" />
            </div>
          </fieldset>
          <fieldset className="form-group">
            <label className="control-label ">Var:</label>
            <div>
              <input className="form-control" name="dep-var" />
            </div>
          </fieldset>
          <fieldset className="form-group">
            <div className="control-label"></div>
            <div>
              <button className="add-dep btn btn-primary pull-right">+</button>
            </div>
          </fieldset>
          <fieldset className="form-group">
            <label className="control-label">HTML:</label>
            <div>
              <textarea className="attr form-control" name="html_code" defaultValue={this.props.benchmark.html_code}></textarea>
            </div>
          </fieldset>
          <fieldset className="form-group">
            <label className="control-label">JS Setup:</label>
            <div>
              <textarea className="attr form-control" name="js_setup" defaultValue={this.props.benchmark.js_setup}></textarea>
            </div>
          </fieldset>
          <fieldset className="form-group">
            <label className="control-label">JS Teardown:</label>
            <div>
              <textarea className="attr form-control" name="js_teardown" defaultValue={this.props.benchmark.js_teardown}></textarea>
            </div>
          </fieldset>
        </div>
      </section>
    )
  }
})