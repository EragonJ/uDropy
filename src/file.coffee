class File
  constructor: (file, dropboxClient) ->
    @file = file
    @fileInfo = @_getFileInfo(file)
    @fileInfoInServer = null
    @fileContent = null
    @client = dropboxClient

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
      if evt.target.readyState is FileReader.DONE
        @fileContent = evt.target.result
        callback()

    reader.readAsArrayBuffer(@file)

  # how to send file
  upload: (callback) ->
    @client.onXhr.addListener(@_uploadingHandler)
    @client.writeFile(@fileInfo.name, @fileContent,
      (error, info) =>
        if error
          console.log error
        else
          console.log info
          @fileInfoInServer = info
          callback()
    )
    @client.onXhr.removeListener(@_uploadingHandler)
