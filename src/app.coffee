gui = require 'nw.gui'

# make sure we can handle oAuth request coming from Dropbox
gui.App.addOriginAccessWhitelistEntry('https://www.dropbox.com', 'app', 'udropy', true)

db = null

# we would make sure to create stuffs after the contentloaded
$(->
  db = openDatabase 'udropydb', '1.0', 'udropydb', 2 * 1024 * 1024
  db.transaction (tx) ->
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS uploaded_files ' +
      '(id unique, file, uploaded_time)'
    )

  FileManager.init()
)
