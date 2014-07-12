win = gui.Window.get()

# create menu
menu = new gui.Menu()

# create tray
tray = new gui.Tray({ title: BRANDING_NAME, icon: 'img/icon.png' })

# create clipboard
clipboard = gui.Clipboard.get()

tray.on 'uploadingfile', (e) ->
  done = e.detail.done
  if done < 100
    tray.title = done + '%'
  else
    tray.title = BRANDING_NAME
    
tray.on 'addmenuitem', (e) ->
  # We only keep recent histories
  if menu.items.length >= PRESERVED_MENU_ITEM_COUNT + MAX_HISTORY_MENU_ITEM
    menu.removeAt PRESERVED_MENU_ITEM_COUNT + MAX_HISTORY_MENU_ITEM - 1

  # Make sure we would append menuItem at the right position
  menu.insert new gui.MenuItem(
    label: e.detail.name
    click: ->
      # File type
      file = e.detail.file
      file.getSharedLink (publicLink) ->
        clipboard.set publicLink
  ), PRESERVED_MENU_ITEM_COUNT

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
