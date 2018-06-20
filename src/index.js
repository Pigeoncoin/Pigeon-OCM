import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route, Switch, Redirect, Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import {ipcRenderer } from 'electron';

import store from './reducers';

import MinerConfig from './containers/minerConfig';
import MinerInfo from './containers/minerInfo';
import Console from './components/console';
import PoolSelector from './components/poolSelector';
import Utils from './utils';


class App extends Component {
  constructor(props) {
    super(props);

    //devices is an array of Device Objects
    this.state = {
      output: [],
      address: "",
      showConsole: false,
      devices: [],
      pools: [],
      isMining: false
    };

    this.onAddressUpdate = this.onAddressUpdate.bind(this);
    this.onToggleConsole = this.onToggleConsole.bind(this);
    this.onStartMining = this.onStartMining.bind(this);
    this.getDeviceIndexFromList = this.getDeviceIndexFromList.bind(this);
    //returns the index of the device
    
    //recieve updates from the miner
    ipcRenderer.on('update-miner-output', (event, data) => {
      this.setState({output: [data, ...this.state.output]});
    });

    ipcRenderer.on('device-update', (event, device) => {
      //do we already have this device in the list?
      //add if not, otherwise update info

      //does devices exist
      let allDevs = this.state.devices;
      let idx = this.getDeviceIndexFromList(device.deviceId);
      if(idx >= 0) {
        let updatedDevice = allDevs[idx];
        updatedDevice.rates = [...updatedDevice.rates, ...device.rates];
        //reassign to list
        allDevs[idx] = updatedDevice;
        this.setState({devicecs: allDevs});
      }else {
          this.setState({devices: [...this.state.devices, device]});
      }
    });

    //we have new device information
    ipcRenderer.on('device-info-update', (event, deviceInfo) => {
      //does devices exist
      let allDevs = this.state.devices;
      let idx = this.getDeviceIndexFromList(deviceInfo.deviceId);
      if(idx >= 0) {
        let updatedDevice = allDevs[idx];
        updatedDevice.clockSpeed = deviceInfo.clockSpeed;
        updatedDevice.efficiency = deviceInfo.efficiency;
        updatedDevice.power = deviceInfo.power;
        updatedDevice.temp = deviceInfo.temp;
        updatedDevice.fan = deviceInfo.fan;
        //reassign to list
        allDevs[idx] = updatedDevice;
        this.setState({devicecs: allDevs});
      }
    });
  }

  //get the index of the device from state.devices
  getDeviceIndexFromList(deviceId) {
    for(let i =0; i<this.state.devices.length; i++){
      if(this.state.devices[i].deviceId === deviceId) {
         return i;
        }
    }
    return -1;
  }

  //receive updates from the address text field
  onAddressUpdate(event) {
    this.setState({address: event.target.value});
    ipcRenderer.send('update-miner-address', event.target.value);
  }

  //receive "start mining" button press
  onStartMining() {
    //toggle mining state
    let start = !this.state.isMining;
    this.setState({isMining: start})
    ipcRenderer.send('start-mining', start);
  }

  //recieve toggle console button press
  onToggleConsole() {
    this.setState({showConsole: !this.state.showConsole});
  }
  
  onPoolSelect(url) {
    ipcRenderer.send('update-pool-selection', url);
  }

  render() {
    return (
      <div>
        <MinerConfig onAddressUpdate={this.onAddressUpdate} />
        <PoolSelector onPoolSelect={this.onPoolSelect} />
        <div className="buttons">
          <button onClick={this.onStartMining}>{this.state.isMining ? "Stop" : "Start"} Mining</button>
          <button onClick={this.onToggleConsole}>Toggle Console</button>
        </div>
        <MinerInfo devices={this.state.devices} />
        {this.state.showConsole ? <Console output={this.state.output} /> : "" }
      </div>
    );
  }
}

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <div className="app">
        <Switch>
          <Route path="/" component={App} />
        </Switch>
      </div>
    </Router>
  </Provider>,
  document.getElementById('root')
);
