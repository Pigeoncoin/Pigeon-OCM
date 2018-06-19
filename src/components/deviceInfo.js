import React, { Component } from 'react';
import {Device} from '../utils';

module.exports = class DeviceInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            deviceName: "",
            avgHash: ""
        };
    }

    componentWillReceiveProps(prevProps){
        this.update();
    }

    update() {
        let device = new Device(this.props.device.deviceId, this.props.device.deviceName);
        device.rates = this.props.device.rates;
        let res = device.getAverageHashrate();
        this.setState({deviceName: device.deviceName, avgHash: res[1]});
    }

    render() {
        return (
            <div className="device-info">
                <h3 className="device-name">Device: {this.state.deviceName}</h3>
                <h3 className="device-hashrate">Hashrate: {this.state.avgHash}</h3>
            </div>
        );
    }
}