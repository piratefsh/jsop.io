import React from 'react';

export default React.createClass({
  displayName: 'BenchspecEditorMetadata',

  handleLoadBenchspec(ev){
    ev.preventDefault();
    const benchspecId = this.refs.benchSpecId.value.trim();
    this.props.loadBenchspec(benchspecId, ev)
  },

  render() {
    return (
      <header>
        <h1>Benchspec</h1>
        <div className="control">
          <div className="btn-group">
            <button className="btn btn-primary" onClick={this.props.runBenchspec}>Run</button>
            <button className="btn btn-default" onClick={this.props.clearBenchspec}>Clear</button>
            <button className="btn btn-default" onClick={this.props.saveBenchspec}>Save</button>
          </div>
        </div>

        <div className="control">
          <form >
            <fieldset className="form-group">
              <label className="control-label">Load Benchmark:</label>
              <input className="form-control" name="benchspecid" placeholder="example" ref="benchSpecId" defaultValue="example"/>
            </fieldset>
            <fieldset className="form-group">
              <button id="load" className="btn btn-default" onClick={this.handleLoadBenchspec} >Load</button>
            </fieldset>
          </form>
        </div>
        <pre><code>{JSON.stringify(this.props.benchspec, null, 2)}</code></pre>
      </header>
      )
  }
})