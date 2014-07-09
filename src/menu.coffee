gui = require 'nw.gui'

# create tray
tray = new gui.Tray({ title: 'uDropy', icon: 'img/icon.png' })

# create menu
menu = new gui.Menu()
menu.append(new gui.MenuItem({ type: 'checkbox', label: 'box1' }))

# append menu onto tray
tray.menu = menu
