var gui, menu, tray;

gui = require('nw.gui');

tray = new gui.Tray({
  title: 'uDropy',
  icon: 'img/icon.png'
});

menu = new gui.Menu();

menu.append(new gui.MenuItem({
  type: 'checkbox',
  label: 'box1'
}));

tray.menu = menu;
