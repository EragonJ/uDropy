gui = require 'nw.gui'

# create tray
tray = new gui.Tray({ title: 'uDropy', icon: 'img/icon.png' })

# create menu
menu = new gui.Menu()

menu.append new gui.MenuItem(
  type: 'normal'
  label: 'Upload'
  click: () ->
    $('#fileDialog').click()
)

menu.append new gui.MenuItem(
  type: 'separator'
)

# append menu onto tray
tray.menu = menu
