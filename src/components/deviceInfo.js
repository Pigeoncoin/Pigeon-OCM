import React, { Component } from 'react';
import {Device} from '../utils';

module.exports = class DeviceInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div className="device-info">
                <h3 className="device-name">Device:{this.props.device.deviceName}</h3>
                <h3 className="device-name">Hashrate: {this.props.device.getAverageHashrate}</h3>
            </div>
        );
    };
}