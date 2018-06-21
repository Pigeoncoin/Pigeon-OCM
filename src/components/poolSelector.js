import React, { Component } from 'react';
import firebase from 'firebase/app';
require('firebase/database');
import Store from '../store';

//firebase config
const fbconfig = {
    apiKey: "AIzaSyDSb7CJlXlzJjQPE9IRVRTZpCjeJwAgk54",
    authDomain: "pigeoncoin-api.firebaseapp.com",
    databaseURL: "https://pigeoncoin-api.firebaseio.com",
    projectId: "pigeoncoin-api",
    storageBucket: "pigeoncoin-api.appspot.com",
    messagingSenderId: "16957585674"
  };
  


class PoolSelector extends Component{
    constructor(props) {
        super(props);
        const store = new Store({
            configName: 'user-preferences'
        });

        this.state = {
            pools: [],
            activePoolUrl: ""
        };

        let selectedPool = store.data.selectedPool;
        if(selectedPool) {
            this.setState({activePoolUrl: selectedPool})
        }

        this.handleChange = this.handleChange.bind(this);
        this.renderPoolList = this.renderPoolList.bind(this);

        //initialize firebase
        firebase.initializeApp(fbconfig);
    }

    componentDidMount() {
        let poolsData = [];
        let fbDb = firebase.database();
        fbDb.ref("/ocm/pools").once('value')
        .then(snapshot => {

            for(let key in snapshot.val()){
                let ports = Object.keys(snapshot.val()[key]["ports"]);
                poolsData.push({
                    discord: snapshot.val()[key]["discord"],
                    website: snapshot.val()[key]["website"],
                    stratum: `stratum+tcp://${snapshot.val()[key]["stratum"]}`,
                    ports: ports
                });
            }
            this.setState({pools: poolsData});
        });
    }

    handleChange(event) {
        this.setState({activePoolUrl: event.target.value});
        this.props.onPoolSelect(event.target.value);
    }

    renderPoolList() {
        if(this.state.pools.length > 0) {
            return this.state.pools.map(pool => {
                //need to create 1 entry per port
                return pool.ports.map(port => {
                    return <option key={`${pool.website}:${port}`} value={`${pool.stratum}:${port}`}>{pool.website}:{port}</option>
                })
                
            })
        } else {
            return <option key={"nullvalue"} value="nullvalue">Gathering list of pools...</option>
        }
        
    }

    render() {
        return (
            <div className="pool-selector">
                <select onChange={this.handleChange} value={this.state.activePoolUrl}>
                    {this.renderPoolList()}
                </select>
            </div>
        );
    };
}

module.exports = PoolSelector;