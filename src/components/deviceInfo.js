import React, { Component } from 'react';

module.exports = class DeviceInfo extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div className="device-info">
                <h3 className="device-name">{this.props.device.deviceName}</h3>
                <h3 className="device-name">{this.props.device.getAverageHashRate}</h3>
            </div>
        );
    };
}