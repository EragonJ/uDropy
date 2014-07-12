gui = require 'nw.gui'

win = gui.Window.get()

# create tray
tray = new gui.Tray({ title: 'uDropy', icon: 'img/icon.png' })
tray.on 'uploadingfile', (e) ->
  done = e.detail.done
  if done < 100
    tray.title = done + '%'
  else
    tray.title = 'uDropy'

# create menu
menu = new gui.Menu()

menu.append new gui.MenuItem(
  label: 'Developer Tools'
  click: ->
    win.showDevTools()
)

menu.append new gui.MenuItem(
  type: 'normal'
  label: 'Upload'
  click: ->
    FileManager.showFileDialog()
)

menu.append new gui.MenuItem(
  type: 'normal'
  label: 'Authenticate'
  click: ->
    dropboxClient.authenticate (err, client) ->
      if err or !client.isAuthenticated()
        console.error err
        return
      else
        alert 'You already pass the authentication'
)

menu.append new gui.MenuItem(
  type: 'separator'
)

# append menu onto tray
tray.menu = menu
