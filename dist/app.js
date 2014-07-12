var gui;

gui = require('nw.gui');

gui.App.addOriginAccessWhitelistEntry('https://www.dropbox.com', 'app', 'udropy', true);

var DROPBOX_API_KEY;

DROPBOX_API_KEY = 'roaryzterwxe8dd';

var dropboxClient;

dropboxClient = new Dropbox.Client({
  key: DROPBOX_API_KEY
});

dropboxClient.authDriver(new Dropbox.AuthDriver.Redirect({
  rememberUser: false
}));

var File;

File = (function() {
  function File(file, dropboxClient) {
    this.file = file;
    this.fileInfo = this._getFileInfo(file);
    this.fileInfoInServer = null;
    this.fileContent = null;
    this.client = dropboxClient;
  }

  File.prototype._getRandomFileName = function(length) {
    var i, name, possible, _i;
    if (length == null) {
      length = 5;
    }
    name = '';
    possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (i = _i = 0; 0 <= length ? _i <= length : _i >= length; i = 0 <= length ? ++_i : --_i) {
      name += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return name;
  };

  File.prototype._getFileInfo = function(file) {
    return {
      path: file.path,
      name: file.name || this._getRandomFileName(10),
      size: file.size
    };
  };

  File.prototype._uploadingHandler = function(dbXhr) {
    console.log(dbXhr);
    dbXhr.xhr.upload.onprogress = function(event) {
      return tray.emit('uploadingfile', {
        detail: {
          done: Math.floor((event.loaded / event.total) * 100)
        }
      });
    };
    return true;
  };

  File.prototype.getSharedLink = function(callback) {
    var path;
    path = this.fileInfoInServer.path;
    if (path) {
      return this.client.makeUrl(path, {}, function(err, sharedUrl) {
        if (err) {
          return console.error(err);
        } else {
          return callback(sharedUrl.url);
        }
      });
    }
  };

  File.prototype.read = function(callback) {
    var reader;
    reader = new FileReader();
    reader.onloadend = (function(_this) {
      return function(evt) {
        if (evt.target.readyState === FileReader.DONE) {
          _this.fileContent = evt.target.result;
          return callback();
        }
      };
    })(this);
    return reader.readAsArrayBuffer(this.file);
  };

  File.prototype.upload = function(callback) {
    this.client.onXhr.addListener(this._uploadingHandler);
    this.client.writeFile(this.fileInfo.name, this.fileContent, (function(_this) {
      return function(error, info) {
        if (error) {
          return console.log(error);
        } else {
          console.log(info);
          _this.fileInfoInServer = info;
          return callback();
        }
      };
    })(this));
    return this.client.onXhr.removeListener(this._uploadingHandler);
  };

  return File;

})();

var FileManager;

FileManager = (function() {
  function FileManager() {}

  FileManager._fileDialogSel = '#fileDialog';

  FileManager._latestFileRequest = null;

  FileManager._fileRequests = [];

  FileManager._fileChooser = null;

  FileManager._fileInfoHandler = function(evt) {
    var file, files, _i, _len, _results;
    files = evt.target.files;
    _results = [];
    for (_i = 0, _len = files.length; _i < _len; _i++) {
      file = files[_i];
      _results.push(FileManager._processFile(file));
    }
    return _results;
  };

  FileManager._processFile = function(file) {
    var newFile;
    if (this._isSupportedFile(file)) {
      newFile = new File(file, dropboxClient);
      newFile.read((function(_this) {
        return function() {
          return newFile.upload(function() {
            tray.emit('appendmenuitem', {
              detail: {
                name: newFile.fileInfo.name,
                file: newFile
              }
            });
            _this._fileRequests.push(newFile);
            return _this._latestFileRequest = newFile;
          });
        };
      })(this));
    }
    return this._cleanField();
  };

  FileManager._isSupportedFile = function(file) {
    return file.type.match('image.*');
  };

  FileManager._cleanField = function() {
    return this._fileChooser.val('');
  };

  FileManager.showFileDialog = function() {
    return this._fileChooser.click();
  };

  FileManager.init = function() {
    return $(document).ready((function(_this) {
      return function() {
        _this._fileChooser = $(_this._fileDialogSel);
        return _this._fileChooser.change(_this._fileInfoHandler);
      };
    })(this));
  };

  return FileManager;

})();

FileManager.init();

var clipboard, gui, menu, tray, win;

gui = require('nw.gui');

win = gui.Window.get();

menu = new gui.Menu();

tray = new gui.Tray({
  title: 'uDropy',
  icon: 'img/icon.png'
});

clipboard = gui.Clipboard.get();

tray.on('uploadingfile', function(e) {
  var done;
  done = e.detail.done;
  if (done < 100) {
    return tray.title = done + '%';
  } else {
    return tray.title = 'uDropy';
  }
});

tray.on('appendmenuitem', function(e) {
  return menu.append(new gui.MenuItem({
    label: e.detail.name,
    click: function() {
      var file;
      file = e.detail.file;
      return file.getSharedLink(function(publicLink) {
        return clipboard.set(publicLink);
      });
    }
  }));
});

menu.append(new gui.MenuItem({
  label: 'Developer Tools',
  click: function() {
    return win.showDevTools();
  }
}));

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
