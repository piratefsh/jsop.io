import React from 'react';

export default React.createClass({
    libraryList(libraries){
        let nodes = libraries.map((dep, i) => {
            return (<li className="dep" key={dep.var}>
                {dep.name} ({dep.version}) <a href={dep.src}>src</a> ==>
                <strong>var {dep.var}</strong>
                <button data-idx={i} className="rmv-dep btn btn-danger pull-right">-</button>
            </li>)
        });
        return nodes
    },

    render() {
        console.log('render deps')
        return (
            <section>
              <h3>Libraries</h3>
              <fieldset>
                <ul className="dep-list">
                    {this.libraryList(this.props.benchmark.dependencies)}
                </ul>
              </fieldset>

              <h4>Add Library</h4>
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
                  <div className="control-label">
                  </div>
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