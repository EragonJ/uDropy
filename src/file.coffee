class File
  constructor: (file, dropboxClient) ->
    @file = file
    @fileInfo = @_getFileInfo(file)
    @fileContent = null
    @client = dropboxClient

  _getRandomFileName: (length = 5) ->
    name = ''
    possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    name += possible.charAt(
      Math.floor(Math.random() * possible.length)) for i in [0..5]
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

  read: (callback) ->
    reader = new FileReader()
    reader.onloadend = (evt) =>
      if evt.target.readyState is FileReader.DONE
        @fileContent = evt.target.result
        callback()

    reader.readAsArrayBuffer(@file)

  # how to send file
  upload: ->
    @client.onXhr.addListener(@_uploadingHandler)
    @client.writeFile(@fileInfo.name, @fileContent,
      (error, stat) ->
        if error
          console.log error
        else
          console.log stat
    )
    @client.onXhr.removeListener(@_uploadingHandler)
