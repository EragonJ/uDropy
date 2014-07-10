gui = require 'nw.gui'

# make sure we can handle oAuth request coming from Dropbox
gui.App.addOriginAccessWhitelistEntry('https://www.dropbox.com', 'app', 'udropy', true)
