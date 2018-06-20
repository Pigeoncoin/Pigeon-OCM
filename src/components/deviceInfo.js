import React, { Component } from 'react';
import {Device} from '../utils';

module.exports = class DeviceInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {
            deviceName: "",
            avgHash: "",
            clockSpeed: "",
            efficiency: "",
            power: "",
            temp: "",
            fan: ""
        };
    }

    componentWillReceiveProps(prevProps){
        this.update();
    }

    update() {
        let device = new Device(this.props.device.deviceId, this.props.device.deviceName);
        device.rates = this.props.device.rates;
        let res = device.getAverageHashrate();
        this.setState({
            deviceName: this.props.device.deviceName, 
            avgHash: res[1],
            clockSpeed: this.props.device.clockSpeed,
            efficiency: this.props.device.efficiency,
            power: this.props.device.power,
            temp: this.props.device.temp,
            fan: this.props.device.fan
        });
    }

    render() {
        return (
            <div className="device-info">
                <h2 className="device-name">Device: {this.state.deviceName}</h2>
                <h3 className="device-hashrate">Hashrate: {this.state.avgHash}</h3>
                <div className="device-clockSpeed">Clock Speed: {this.state.clockSpeed}</div>
                <div className="device-efficiency">Efficiency: {this.state.efficiency}</div>
                <div className="device-power">Power: {this.state.power}</div>
                <div className="device-temp">Temp: {this.state.temp}</div>
                <div className="device-fan">Fan: {this.state.fan}</div>
            </div>
        );
    }
}