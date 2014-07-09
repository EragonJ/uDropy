var gui = require('nw.gui');

var tray = new gui.Tray({ title: 'uDropy', icon: 'img/icon.png' });

var menu = new gui.Menu();
menu.append(new gui.MenuItem({ type: 'checkbox', label: 'box1' }));

tray.menu = menu;
