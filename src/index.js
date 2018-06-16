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

class App extends Component {
  constructor(props) {
    super(props);

    //devices is an array of Device Objects
    this.state = {
      output: [],
      address: "",
      showConsole: false,
      devices: []
    };

    this.onAddressUpdate = this.onAddressUpdate.bind(this);
    this.onToggleConsole = this.onToggleConsole.bind(this);

    //recieve updates from the miner
    ipcRenderer.on('update-miner-output', (event, data) => {
      console.log(`received message: ${event} with ${data}`);
      this.setState({output: [data, ...this.state.output]});
    });

    ipcRenderer.on('device-update', (event, device) => {
      //do we already have this device in the list?
      //add if not, otherwise update info
      
      //does devices exist
      if(this.state.devices[device]) {
        this.state.devices[device].rates = [...his.state.devices[device].rates, device.hashRate];
      } else {
        this.setState({...this.state.devices,device});
      }
    });
  }

  //receive updates from the address text field
  onAddressUpdate(event) {
    this.setState({address: event.target.value});
    ipcRenderer.send('update-miner-address', event.target.value);
    console.log("Updating address: " + event.target.value);
  }

  //receive "start mining" button press
  onStartMining() {
    ipcRenderer.send('start-mining', true);
  }

  //recieve toggle console button press
  onToggleConsole() {
    this.setState({showConsole: !this.state.showConsole});
  }
  

  render() {
    return (
      <div>
        <MinerConfig onAddressUpdate={this.onAddressUpdate} />
        <div className="buttons">
          <button onClick={this.onStartMining}>Start Mining</button>
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
