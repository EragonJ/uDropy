var gui;

gui = require('nw.gui');

gui.App.addOriginAccessWhitelistEntry('https://www.dropbox.com', 'app', 'udropy', true);

var DROPBOX_API_KEY;

DROPBOX_API_KEY = '9e7gwnpmvu4e38r';

var dropboxClient;

dropboxClient = new Dropbox.Client({
  key: DROPBOX_API_KEY
});

var File;

File = (function() {
  function File(path) {}

  File.prototype.send = function() {};

  return File;

})();

var FileManager;

FileManager = (function() {
  function FileManager() {}

  FileManager._fileDialogSel = '#fileDialog';

  FileManager._latestFileRequest = null;

  FileManager._fileRequests = [];

  FileManager._fileChooser = null;

  FileManager.fileInfoHandler = function(evt) {
    var file, path;
    path = $(FileManager).val();
    file = new File(path);
    file.send();
    FileManager._fileRequests.push(file);
    return FileManager._latestFileRequest = file;
  };

  FileManager.showFileDialog = function() {
    return this._fileChooser.click();
  };

  FileManager.init = function() {
    return $(document).ready((function(_this) {
      return function() {
        _this._fileChooser = $(_this._fileDialogSel);
        return _this._fileChooser.change(_this.fileInfoHandler);
      };
    })(this));
  };

  return FileManager;

})();

FileManager.init();

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
    return FileManager.showFileDialog();
  }
}));

menu.append(new gui.MenuItem({
  type: 'normal',
  label: 'Authenticate',
  click: function() {
    return dropboxClient.authenticate(function(err, client) {
      if (err || !client.isAuthenticated()) {
        console.error(err);
      } else {
        return alert('You already pass the authentication');
      }
    });
  }
}));

menu.append(new gui.MenuItem({
  type: 'separator'
}));

tray.menu = menu;
