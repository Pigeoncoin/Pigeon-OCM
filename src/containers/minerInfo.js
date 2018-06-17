import React, { Component } from 'react';

import DeviceInfo from '../components/deviceInfo';

module.exports = class MinerInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    renderDevices() {
        if(this.props.devices.length === 0) {
            return <h3>No device information to display yet...</h3>
        } else {
            return this.props.devices.map(dev => {
                return <DeviceInfo key={dev.deviceId} device={dev} />
            });
        }
    }

    render() {
        return (
            <div className="miner-info">
                {this.renderDevices()}
            </div>
        );
    };
}