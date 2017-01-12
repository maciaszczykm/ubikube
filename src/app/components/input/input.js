import React from 'react';
import TextField from 'material-ui/TextField';
import Tip from '../tip/tip'

export default class Input extends React.Component {
  render() {
    return <div className='uk-input'>
             <TextField className='uk-text-field'
                        hintText={this.props.hintText}
                        fullWidth={true}
                        ref={this.props.inputRef}/>
             <Tip text={this.props.tipText}/>
           </div>
  }
}
