import React, { Component } from 'react';

import DeviceInfo from '../components/deviceInfo';

module.exports = class MinerConfig extends Component {
    constructor(props) {
        super(props);

        this.state = {
            address: null
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
                    placeholder="Type miner address here..." />
                </div>
            </div>
        );
    };
}