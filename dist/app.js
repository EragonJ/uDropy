var db, gui;

gui = require('nw.gui');

gui.App.addOriginAccessWhitelistEntry('https://www.dropbox.com', 'app', 'udropy', true);

db = null;

$(function() {
  db = openDatabase('udropydb', '1.0', 'udropydb', 2 * 1024 * 1024);
  db.transaction(function(tx) {
    return tx.executeSql('CREATE TABLE IF NOT EXISTS uploaded_files ' + '(id unique, file, uploaded_time)');
  });
  return FileManager.init();
});

var BRANDING_NAME, DROPBOX_API_KEY, MAX_HISTORY_MENU_ITEM, PRESERVED_MENU_ITEM_COUNT;

DROPBOX_API_KEY = 'roaryzterwxe8dd';

BRANDING_NAME = 'uDropy';

MAX_HISTORY_MENU_ITEM = 5;

PRESERVED_MENU_ITEM_COUNT = 3;

var dropboxClient;

dropboxClient = new Dropbox.Client({
  key: DROPBOX_API_KEY
});

dropboxClient.authDriver(new Dropbox.AuthDriver.Redirect({
  rememberUser: false
}));

var File;

File = (function() {
  function File(file) {
    this.file = file;
    this.fileInfo = this._getFileInfo(file);
    this.fileInfoInServer = null;
    this.fileContent = null;
    this.client = dropboxClient;
    this.db = db;
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

  File.prototype._saveFileIntoDB = function(fileInfoFromServer) {
    var stringifiedInfo, uniqueId;
    uniqueId = fileInfoFromServer.path;
    stringifiedInfo = JSON.stringify(fileInfoFromServer);
    this.db.transaction(function(tx) {
      return tx.executeSql('DELETE FROM uploaded_files WHERE id = ?', [uniqueId]);
    });
    return this.db.transaction(function(tx) {
      return tx.executeSql('INSERT INTO uploaded_files (id, file, uploaded_time) VALUES (?, ?, ?)', [uniqueId, stringifiedInfo, (new Date()).getTime()]);
    });
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
        if (reader.error) {
          alert('Read file error, please try again !');
          console.log('Got error when reading file : ', render.error);
          callback(true);
        }
        if (evt.target.readyState === FileReader.DONE) {
          _this.fileContent = evt.target.result;
          return callback(false);
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
          alert('Upload file to dropbox error, please try again !');
          console.log('Got error when uploading to dropbox : ', error);
        } else {
          _this.fileInfoInServer = info;
          _this._saveFileIntoDB(_this.fileInfoInServer);
          console.log('Upload file to dropbox successfully with info : ', info);
        }
        return callback(error);
      };
    })(this));
    return this.client.onXhr.removeListener(this._uploadingHandler);
  };

  return File;

})();

var FileManager;

FileManager = (function() {
  function FileManager() {}

  FileManager._db = null;

  FileManager._latestFileRequest = null;

  FileManager._fileChooser = null;

  FileManager._fileRequests = [];

  FileManager._fileDialogSel = '#fileDialog';

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
      newFile = new File(file);
      newFile.read((function(_this) {
        return function(readFileError) {
          if (readFileError) {
            return;
          }
          return newFile.upload(function(uploadFileError) {
            if (uploadFileError) {
              return;
            }
            tray.emit('addmenuitem', {
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

  FileManager.getRecentFiles = function() {
    var sql;
    sql = 'SELECT file FROM uploaded_files ORDER BY uploaded_time desc LIMIT ' + MAX_HISTORY_MENU_ITEM;
    return FileManager._db.transaction(function(tx) {
      return tx.executeSql(sql, [], function(tx, results) {
        return console.log(results.rows.item(1).file);
      });
    });
  };

  FileManager.showFileDialog = function() {
    return this._fileChooser.click();
  };

  FileManager.init = function() {
    this._db = db;
    this._fileChooser = $(this._fileDialogSel);
    return this._fileChooser.change(this._fileInfoHandler);
  };

  return FileManager;

})();

var clipboard, menu, tray, win;

win = gui.Window.get();

menu = new gui.Menu();

tray = new gui.Tray({
  title: BRANDING_NAME,
  icon: 'img/icon.png'
});

clipboard = gui.Clipboard.get();

tray.on('uploadingfile', function(e) {
  var done;
  done = e.detail.done;
  if (done < 100) {
    return tray.title = done + '%';
  } else {
    return tray.title = BRANDING_NAME;
  }
});

tray.on('addmenuitem', function(e) {
  if (menu.items.length >= PRESERVED_MENU_ITEM_COUNT + MAX_HISTORY_MENU_ITEM) {
    menu.removeAt(PRESERVED_MENU_ITEM_COUNT + MAX_HISTORY_MENU_ITEM - 1);
  }
  return menu.insert(new gui.MenuItem({
    label: e.detail.name,
    click: function() {
      var file;
      file = e.detail.file;
      return file.getSharedLink(function(publicLink) {
        return clipboard.set(publicLink);
      });
    }
  }), PRESERVED_MENU_ITEM_COUNT);
});

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
