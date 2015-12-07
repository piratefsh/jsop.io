import React from 'react';
import BenchspecRunner from './BenchspecRunner';
import BenchspecEditorControls from './BenchspecEditorControls';
import BenchspecEditorMetadata from './BenchspecEditorMetadata';
import BenchspecEditorSetupTeardown from './BenchspecEditorSetupTeardown';
import BenchspecEditorDependencies from './BenchspecEditorDependencies';
import BenchspecEditorTestCases from './BenchspecEditorTestCases';

export default React.createClass({

  getInitialState() {
    return {
      uri: 'https://127.0.0.1:8443',
      benchspec: {
        id: '',
        title: '',
        description_md: '',
        benchmark: {
          cases: [],
          dependencies: []
        }
      }
    };
  },

  runBenchspec(ev) {
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
        });
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
          this.setState({benchspec: json});
        }
      })
      .catch((err) => {
        console.error(err);
        loadDOM.innerText = 'Failed!';
      });
  },

  clearBenchspec(ev) {
    this.replaceState(this.getInitialState());
  },

  saveBenchspec(ev) {
    var saveDOM = ev.currentTarget;

    if (saveDOM.saving) return; // do nothing

    saveDOM.saving = true;
    saveDOM.innerText = 'Saving...';

    const saveUri = `${this.state.uri}/api/benchmark/${this.state.benchspec.id || ''}`;

    fetch(saveUri, {
        method: this.state.benchspec.id ? 'PUT' : 'POST',
        headers: (() => {
          var h = new Headers();
          h.append('Content-Type', 'application/json');
          return h;
        })(),
        body: JSON.stringify(this.state.benchspec)
      })
      .then((res) => {
        saveDOM.saving = false;
        saveDOM.innerText = (res.status < 400) ? 'Saved!' : 'Failed to save!';
        return res.status < 400 && res.json();
      })
      .then((json) => {
        if (json && typeof json.error == 'undefined') {
          this.setState({benchspec: json});
        }
      })
      .catch((err) => {
        console.log(err);
        saveDOM.saving = false;
        saveDOM.innerText = 'Failed to save!';
      });
  },

  // handle any input change from user
  updateTitle: function(event) {
    this.setState((state) => {
      state.benchspec.title = event.target.value.trim();
      return state;
    });
  },

  updateDescription: function() {
    this.setState((state) => {
      state.benchspec.description_md = event.target.value;
      return state;
    });
  },

  // add new test case
  addTestCase(testCase) {
    this.setState((state) => {
      const cases = state.benchspec.benchmark.cases;
      state.benchspec.benchmark.cases = cases.concat(testCase);
      return state;
    });
  },

  // delete test case at index
  deleteTestCase(i) {
    this.setState((state) => {
      const cases = state.benchspec.benchmark.cases;
      cases.splice(i, 1);
      return state;
    });
  },

  // add new dependency
  addDependency(dependency) {
    this.setState((state) => {
      const dependencies = state.benchspec.benchmark.dependencies;
      state.benchspec.benchmark.dependencies = dependencies.concat(dependency);
      return state;
    });
  },

  // delete dependency at index
  deleteDependency(i) {
    this.setState((state) => {
      const deps = state.benchspec.benchmark.dependencies;
      deps.splice(i, 1);
      return state;
    });
  },

  updateSetupTeardown(updated) {
    this.setState((state) => {
      Object.assign(state.benchspec.benchmark, updated);
      return state;
    });
  },

  render() {
    return (
      <div className='layout'>
        <div>
          <BenchspecEditorControls
            benchspec={this.state.benchspec}
            runBenchspec={this.runBenchspec}
            saveBenchspec={this.saveBenchspec}
            clearBenchspec={this.clearBenchspec}
            loadBenchspec={this.loadBenchspec}/>
        </div>
        <div>
          <h2>Edit</h2>
          <BenchspecEditorMetadata
            benchspec={this.state.benchspec}
            updateTitle={this.updateTitle}
            updateDescription={this.updateDescription}/><hr/>

          <BenchspecEditorDependencies
            onAdd={this.addDependency}
            onDelete={this.deleteDependency}
            benchmark={this.state.benchspec.benchmark}/><hr/>

          <BenchspecEditorTestCases
            onAdd={this.addTestCase}
            onDelete={this.deleteTestCase}
            benchmark={this.state.benchspec.benchmark}/><hr/>

          <BenchspecEditorSetupTeardown
            onChange={this.updateSetupTeardown}
            benchmark={this.state.benchspec.benchmark}/>
        </div>
      </div>
    );
  }
});
