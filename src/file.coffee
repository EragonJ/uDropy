class File
  constructor: (file) ->
    @file = file
    @fileInfo = @_getFileInfo(file)
    @fileInfoInServer = null
    @fileContent = null

    # global variables
    @client = dropboxClient
    @db = db

  _getRandomFileName: (length = 5) ->
    name = ''
    possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    name += possible.charAt(
      Math.floor(Math.random() * possible.length)) for i in [0..length]
    return name

  _getFileInfo: (file) ->
    return {
      path: file.path
      name: file.name or @_getRandomFileName(10)
      size: file.size
    }

  _uploadingHandler: (dbXhr) ->
    console.log dbXhr
    dbXhr.xhr.upload.onprogress = (event) ->
      # TODO remove tray reference here
      tray.emit('uploadingfile', {
        detail: {
          done: Math.floor((event.loaded / event.total) * 100)
        }
      })

    # otherwise, the XMLHttpRequest is canceled
    return true

  _saveFileIntoDB: (fileInfoFromServer) ->
    uniqueId = fileInfoFromServer.path
    stringifiedInfo = JSON.stringify(fileInfoFromServer)

    @db.transaction (tx) ->
      tx.executeSql 'DELETE FROM uploaded_files WHERE id = ?', [uniqueId]

    # keep the new one
    @db.transaction (tx) ->
      tx.executeSql(
        'INSERT INTO uploaded_files (id, file, uploaded_time) VALUES (?, ?, ?)',
        [uniqueId, stringifiedInfo, (new Date()).getTime()]
      )

  getSharedLink: (callback) ->
    path = @fileInfoInServer.path
    if path
      @client.makeUrl path, {}, (err, sharedUrl) ->
        if err
          console.error err
        else
          callback sharedUrl.url
    
  read: (callback) ->
    reader = new FileReader()
    reader.onloadend = (evt) =>
      if reader.error
        alert 'Read file error, please try again !'
        console.log 'Got error when reading file : ', render.error
        callback(true)

      if evt.target.readyState is FileReader.DONE
        @fileContent = evt.target.result
        callback(false)

    reader.readAsArrayBuffer(@file)

  # how to send file
  upload: (callback) ->
    @client.onXhr.addListener(@_uploadingHandler)
    @client.writeFile(@fileInfo.name, @fileContent, (error, info) =>
      if error
        alert 'Upload file to dropbox error, please try again !'
        console.log 'Got error when uploading to dropbox : ', error
      else
        @fileInfoInServer = info
        @_saveFileIntoDB @fileInfoInServer
        console.log 'Upload file to dropbox successfully with info : ', info

      callback(error)
    )
    @client.onXhr.removeListener(@_uploadingHandler)
