import React, { Component } from 'react';


class PoolSelector extends Component{
    constructor(props) {
        super(props);

        this.state = {
            pools: [
                {
                    url:"https://pool.pigeoncoin.org:3663",
                    value: "stratum+tcp://pool.pigeoncoin.org:3663"
                },{
                    url: "https://blah.blahb.alhasdlfjasdf",
                    value: "stratum+tcp://blah.blahb.alsdkfjasdf"
                }],
            activePoolUrl: ""
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({activePoolUrl: event.target.value});
        this.props.onPoolSelect(event.target.value);
    }

    getPoolList() {
        return 
    }

    render() {
        const pools = this.state.pools.map((pool) => {
            return <option key={pool.url} value={pool.value}>{pool.url}</option>
        });
        return (
            <div className="pool-selector">
                <select onChange={this.handleChange} value={this.state.activePoolUrl.value}>
                    {pools}
                </select>
            </div>
        );
    };
}

module.exports = PoolSelector;