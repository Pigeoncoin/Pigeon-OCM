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
      output: []
    };

    ipcRenderer.on('update-miner-output', (event, data) => {
      console.log(`received message: ${event} with ${data}`);
      this.setState({output: [data, ...this.state.output]});
    });
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
        <button onClick={this.onStartMining}>Start Mining</button>
        <div>
          MINER OUTPUT:
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
