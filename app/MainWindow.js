const electron = require('electron');
const {BrowserWindow } = electron;

class MainWindow extends BrowserWindow {
    constructor(config, url) {
        super(config);
        //this.on('blur', this.onBlur.bind(this));
        this.loadURL(`file://${url}`);
    }

    // hide the window when it loses focus
    // really just for a tray app
    onBlur() {
        this.hide();
    }
}

module.exports = MainWindow;