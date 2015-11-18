import React from 'react';
import BenchspecEditorLibraries from './BenchspecEditorLibraries';
import BenchspecEditorTestCases from './BenchspecEditorTestCases';

export default React.createClass({
    getInitialState(){
      return {
        benchspec: {
          title: "",
          description: "",
          benchmark: {
            cases: [],
            dependencies: []
          }
        }
      }
    },

    loadBenchspec(ev) {
      ev.preventDefault()
      var loadDOM = ev.currentTarget;

      loadDOM.innerText = 'Fetching...';

      const uri = 'https://127.0.0.1:8443/api/benchmark/' + this.refs.benchSpecId.value.trim();
      fetch(uri)
        .then((res) => {
          if (res.status >= 400) throw 'Failed to Load';
          return res.json();
        })
        .then((json) => {
          if (json) {
            loadDOM.innerText = 'Load';
            this.setState({benchspec: json})
          }
        })
        .catch((err) => {
          console.errorx(err)
          loadDOM.innerText = 'Failed!';
        });
    },

    render() {
        return (
          <div className="layout">
            <div>
              <header>
                <h1>Benchspec</h1>
                <div className="control">
                  <div className="btn-group">
                    <button id="run" className="btn btn-primary">Run</button>
                    <button id="clear" className="btn btn-default">Clear</button>
                    <button id="save" className="btn btn-default">Save</button>
                  </div>
                </div>

                <div className="control">
                  <form >
                    <fieldset className="form-group">
                      <label className="control-label">Load Benchmark:</label>
                      <input className="form-control" name="benchspecid" placeholder="example" ref="benchSpecId" defaultValue="example"/>
                    </fieldset>
                    <fieldset className="form-group">
                      <button id="load" className="btn btn-default" onClick={this.loadBenchspec} >Load</button>
                    </fieldset>
                  </form>
                </div>
                <pre><code>{JSON.stringify(this.state.benchspec, null, 2)}</code></pre>
              </header>
              <hr />
            </div>
            <div>
              <h2>Edit</h2>
              <section>
                <div className="form-horizontal">
                <fieldset className="form-group">
                  <label className="control-label">Title:</label>
                  <div>
                    <input className="attr form-control" name="title" value={this.state.benchspec.title}/>
                  </div>
                  </fieldset>

                <fieldset className="form-group">
                  <label className="control-label">Description:</label>
                  <div>
                    <textarea className="attr form-control" name="description_md" value={this.state.benchspec.description_html}></textarea>
                  </div>
                </fieldset>
                </div>
              </section>

              <BenchspecEditorLibraries benchmark={this.state.benchspec.benchmark}/>
              <BenchspecEditorTestCases benchmark={this.state.benchspec.benchmark}/>
            </div>
          </div>
        )
    }
})