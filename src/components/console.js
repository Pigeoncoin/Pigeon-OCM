import React, { Component } from 'react';

module.exports = class Console extends Component {
    constructor(props) {
        super(props);

        this.state = {output: null};
    }

    renderLines(){
        return this.props.output.map((line, i) => {
          console.log("line: "+line);
          return <li key={i} className="minerOutputLine">{line}</li>;
        });
      }

    render() {
        return (
            <div className="console">
                Console
                <div className="outputDiv">
                    <ul className="minerOutputList">
                        {this.renderLines()}
                    </ul>  
                </div>
            </div>
        );
    };
}