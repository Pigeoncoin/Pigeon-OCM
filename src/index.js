import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route, Switch, Redirect, Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import {ipcRenderer } from 'electron';

import store from './reducers';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      output: [],
      address: ""
    };

  this.onAddressUpdate = this.onAddressUpdate.bind(this);

    ipcRenderer.on('update-miner-output', (event, data) => {
      console.log(`received message: ${event} with ${data}`);
      this.setState({output: [data, ...this.state.output]});
    });
  }

  onAddressUpdate(event) {
    this.setState({address: event.target.value});
    console.log("Updating address: " + event.target.value);
    if(event.key == 'Enter'){
      ipcRenderer.send('update-miner-address', event.target.value);
    }
  }

  onStartMining() {
    console.log("mining button pressed");
    ipcRenderer.send('start-mining', true);
  }

  renderLines(){
    return this.state.output.map((line, i) => {
      console.log("line: "+line);
      return <li key={i} className="minerOutputLine">{line}</li>;
    });
  }

  render() {
    return (
      <div>
        <div>Hello MINERS!</div>
        <div>
          <input 
            className="miner-address" 
            onKeyPress={this.onAddressUpdate} 
            type="text"
            placeholder="Type miner address here..." />
        </div>
        <div>
          <button onClick={this.onStartMining}>Start Mining</button>
        </div>
        <div className="outputDiv">
          <ul className="minerOutputList">
            {this.renderLines()}
          </ul>  
      </div>
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
