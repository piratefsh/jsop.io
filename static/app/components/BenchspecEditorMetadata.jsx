import React from 'react';

export default React.createClass({

  render() {
    return (
      <section>
        <div className='form-horizontal'>
          <fieldset className='form-group'>
            <label className='control-label'>Title</label>
            <div>
              <input className='attr form-control'
                name='title'
                onChange={this.props.updateTitle}
                value={this.props.benchspec.title}/>
            </div>
          </fieldset>

          <fieldset className='form-group'>
            <label className='control-label'>Description</label>
            <div>
              <textarea className='attr form-control'
                name='description_md'
                onChange={this.props.updateDescription}
                value={this.props.benchspec.description_md}></textarea>
            </div>
          </fieldset>
        </div>
      </section>
      );
  }
});
