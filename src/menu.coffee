gui = require 'nw.gui'

win = gui.Window.get()

# create menu
menu = new gui.Menu()

# create tray
tray = new gui.Tray({ title: 'uDropy', icon: 'img/icon.png' })

# create clipboard
clipboard = gui.Clipboard.get()

tray.on 'uploadingfile', (e) ->
  done = e.detail.done
  if done < 100
    tray.title = done + '%'
  else
    tray.title = 'uDropy'
    
tray.on 'appendmenuitem', (e) ->
  menu.append new gui.MenuItem(
    label: e.detail.name
    click: ->
      # File type
      file = e.detail.file
      file.getSharedLink (publicLink) ->
        clipboard.set publicLink
  )

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
