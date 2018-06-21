import React, { Component } from 'react';
import firebase from 'firebase/app';
require('firebase/database');

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

        this.state = {
            pools: [],
            activePoolUrl: ""
        };
        this.handleChange = this.handleChange.bind(this);
        this.renderPoolList = this.renderPoolList.bind(this);

        //initialize firebase
        firebase.initializeApp(fbconfig);
        
/*
        pools: {
            "blockcruncher":{
                "discord":"https://discord.gg/5g8McbZ",
                "ports":{
                    "3333":3333,"3366":3366,"3636":3636
                },
                "stratum":"blockcruncher.com",
                "website":"https://blockcruncher.com"
            },
            "official":{
                "discord":"https://discord.gg/A7cvb2d",
                "ports":{"3663":3663},
                "stratum":"pool.pigeoncoin.org",
                "website":"https://pool.pigeoncoin.org"
            }
        }
        */

    }

    componentDidMount() {
        let poolsData = [];
        let fbDb = firebase.database();
        fbDb.ref("/pools").once('value')
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
                console.log("Pool: " + JSON.stringify(pool))
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