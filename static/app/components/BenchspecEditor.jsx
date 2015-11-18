import React from 'react';
import BenchspecRunner from './BenchspecRunner'
import BenchspecEditorControls from './BenchspecEditorControls';
import BenchspecEditorMetadata from './BenchspecEditorMetadata';
import BenchspecEditorDependencies from './BenchspecEditorDependencies';
import BenchspecEditorTestCases from './BenchspecEditorTestCases';

export default React.createClass({

  getInitialState(){
    return {
      uri: 'https://127.0.0.1:8443',
      benchspec: {
        id: "",
        title: "",
        description_html: "",
        benchmark: {
          cases: [],
          dependencies: []
        }
      }
    }
  },

  runBenchspec(ev){
    var runDOM = ev.currentTarget;

    if (runDOM.running) {
      runDOM.running = false;
      runDOM.innerText = 'Run Benchmark';

      window.benchsuite.abort();
    } else {
      runDOM.running = true;
      runDOM.innerText = 'Abort Benchmark';

      BenchspecRunner.run(this.state.benchspec)
        .then((results) => {
          runDOM.running = false;
          runDOM.innerText = 'Run Benchmark';
          console.log('---- final results ----');
          console.log(JSON.stringify(results, null, 2));
      })
    }
  },

  loadBenchspec(benchSpecId, ev) {
    var loadDOM = ev.currentTarget;

    loadDOM.innerText = 'Loading...';

    const loadUri = `${this.state.uri}/api/benchmark/${benchSpecId}`;
    
    fetch(loadUri)
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

  clearBenchspec(ev){
    this.setState(this.getInitialState())
  },

  saveBenchspec(ev){
    var saveDOM = ev.currentTarget;

    if (saveDOM.saving) return; // do nothing

    saveDOM.saving = true;
    saveDOM.innerText = 'Saving...';

    const saveUri = `${this.state.uri}/api/benchmark/${this.state.benchspec.id || ''}`;

    fetch(saveUri, {
        method: this.state.benchspec.id ? 'PUT' : 'POST',
        headers: (function() {
          var h = new Headers();
          h.append('Content-Type', 'application/json');
          return h;
        })(),
        body: JSON.stringify(this.state.benchspec)
      })
      .then(function(res) {
        saveDOM.saving = false;
        saveDOM.innerText = (res.status < 400) ? 'Saved!' : 'Failed to save!';
        return res.status < 400 && res.json();
      })
      .then(function(json) {
        if (json && typeof json.error == 'undefined') {
          this.setState({benchspec: json})
        }
      })
      .catch(function(err) {
        console.log(err);
        saveDOM.saving = false;
        saveDOM.innerText = 'Failed to save!';
      });
  },

  render() {
    return (
      <div className="layout">
        <div>
          <BenchspecEditorControls 
            benchspec={this.state.benchspec}
            runBenchspec={this.runBenchspec}
            saveBenchspec={this.saveBenchspec}
            clearBenchspec={this.clearBenchspec}
            loadBenchspec={this.loadBenchspec}/>
          <hr />
        </div>
        <div>
          <h2>Edit</h2>
          <BenchspecEditorMetadata benchspec={this.state.benchspec}/>
          <BenchspecEditorDependencies benchmark={this.state.benchspec.benchmark}/>
          <BenchspecEditorTestCases benchmark={this.state.benchspec.benchmark}/>
        </div>
      </div>
    )
  }
})