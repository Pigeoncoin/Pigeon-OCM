import React, { Component } from 'react';

import Store from '../store';
import DeviceInfo from '../components/deviceInfo';

module.exports = class MinerConfig extends Component {
    constructor(props) {
        super(props);

        const store = new Store({
            configName: 'user-preferences'
        });

        this.state = {
            address: store.data.minerAddress ? store.data.minerAddress : ""
        };

        this.onAddressUpdate = this.onAddressUpdate.bind(this);
    }

    onAddressUpdate(event) {
        this.setState({address: event.target.value});
        this.props.onAddressUpdate(event);
    }

    render() {
        return (
            <div className="miner-config">
                <div><label>Miner Address: </label></div>
                <div>
                    <input 
                    className="miner-address" 
                    onChange={this.onAddressUpdate} 
                    type="text"
                    placeholder="Type miner address here..." 
                    value={this.state.address}/>
                </div>
            </div>
        );
    };
}