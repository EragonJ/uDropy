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
    for (i = _i = 0; _i <= 5; i = ++_i) {
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

  File.prototype.upload = function() {
    this.client.onXhr.addListener(this._uploadingHandler);
    this.client.writeFile(this.fileInfo.name, this.fileContent, function(error, stat) {
      if (error) {
        return console.log(error);
      } else {
        return console.log(stat);
      }
    });
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

  FileManager.fileInfoHandler = function(evt) {
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
      return newFile.read((function(_this) {
        return function() {
          newFile.upload();
          _this._fileRequests.push(newFile);
          return _this._latestFileRequest = newFile;
        };
      })(this));
    }
  };

  FileManager._isSupportedFile = function(file) {
    return file.type.match('image.*');
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

var gui, menu, tray, win;

gui = require('nw.gui');

win = gui.Window.get();

tray = new gui.Tray({
  title: 'uDropy',
  icon: 'img/icon.png'
});

tray.on('uploadingfile', function(e) {
  var done;
  done = e.detail.done;
  if (done < 100) {
    return tray.title = done + '%';
  } else {
    return tray.title = 'uDropy';
  }
});

menu = new gui.Menu();

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
