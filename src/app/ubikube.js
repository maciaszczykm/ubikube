import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import Selector from './components/selector/selector'

import SubmitButton from './components/submitbutton/submitbutton';
import Toolbar from './components/toolbar/toolbar';
import InputField from './components/inputfield/inputfield';

import {theme} from './themes/fjtheme';
import styles from './ubikube.scss';

export default class Ubikube extends React.Component {
  constructor(props) {
    super(props);
    this._switchAdvancedSectionVisibility = this._switchAdvancedSectionVisibility.bind(this);
    this.state = {showAdvanced: false, advancedLabel: 'Show more options'};
  }

  _switchAdvancedSectionVisibility() {
    this.setState({
      showAdvanced: !this.state.showAdvanced,
      advancedLabel: this.state.advancedLabel === 'Show more options' ? 'Show less options' : 'Show more options',
    });
  }

  _handleSubmit(e) {
    e.preventDefault();
    alert("Submit!")
  }

  _getAvailableSystems() {
    return ["Raspbian", "Hypriot"];
  }

  _getAvailableCards() {
    return ["/dev/usb1", "/dev/usb2"];
  }

  render() {
    const showAdvanced = this.state.showAdvanced;
    let advancedSection;

    if (showAdvanced) {
      advancedSection = <Paper zDepth={0}>
        <h3>Wireless network setup</h3>
        <InputField hintText="SSID" tipText="Name of the wireless network."/>
        <InputField hintText="Password" tipText="Password of the wireless network."/>
      </Paper>
    }

    return <MuiThemeProvider muiTheme={theme}>
      <div className={styles.ukRoot}>
        <Toolbar title="Ubikube"/>
        <Paper className={styles.ukCard} zDepth={0} children={this.props.children}>
          <h1>Image setup</h1>
          <form onSubmit={this._handleSubmit} className={styles.ukFlexContainer}>
            <Selector label="Memory card"
                             tipText="Memory card to be flashed."
                             items={this._getAvailableCards()}/>
            <Selector label="Operating system"
                           tipText="Operating system to be flashed on memory card."
                           items={this._getAvailableSystems()}/>
            <InputField hintText="Token" tipText="Cluster's API server token."/>
            <InputField hintText="Hostname"
                        tipText="Hostname of the device which will use flashed memory card."/>
            {advancedSection}
            <RaisedButton label={this.state.advancedLabel}
                          onClick={this._switchAdvancedSectionVisibility}
                          className={styles.ukAdvancedButton}/>
            <SubmitButton label="Flash"/>
          </form>
        </Paper>
      </div>
    </MuiThemeProvider>
  }
}
