const electron = require('electron');
const { Tray, app, Menu } = electron;

class AppTray extends Tray {
    constructor(iconPath, mainWindow) {
        super(iconPath);

        this.mainWindow = mainWindow;
        this.setToolTip('ICON TOOLTIP');
        this.on('click', this.onClick);
        this.on('right-click', this.onRightClick.bind(this));
    }

    onClick(event, bounds) {
        const { x, y } = bounds;
        const {height, width} = this.mainWindow.getBounds();

        if(this.mainWindow.isVisible()){
            this.mainWindow.hide();
        } else {
            const yPos = process.platform === 'darwin' ? y : y - height;
            this.mainWindow.setBounds({
                x: x-width/2,
                y: yPos,
                height:height,
                width:height,
            });
            this.mainWindow.show();
        }
    }

    onRightClick(event) {
        const menuConfig = Menu.buildFromTemplate([
            {
                label: 'Quit',
                click: () => app.quit()
            }
        ]);

        this.popUpContextMenu(menuConfig);
    }

}

module.exports = AppTray;