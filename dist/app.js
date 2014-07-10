var gui, menu, tray;

gui = require('nw.gui');

tray = new gui.Tray({
  title: 'uDropy',
  icon: 'img/icon.png'
});

menu = new gui.Menu();

menu.append(new gui.MenuItem({
  type: 'normal',
  label: 'Upload',
  click: function() {
    return $('#fileDialog').click();
  }
}));

menu.append(new gui.MenuItem({
  type: 'separator'
}));

tray.menu = menu;
