class FileManager
  # static properties
  @_db = null
  @_latestFileRequest = null
  @_fileChooser = null
  @_fileRequests = []
  @_fileDialogSel = '#fileDialog'

  @_fileInfoHandler: (evt) =>
    files = evt.target.files
    @_processFile file for file in files

  @_processFile: (file) ->
    if @_isSupportedFile(file)
      newFile = new File(file)
      newFile.read (readFileError) =>
        if readFileError
          return

        newFile.upload (uploadFileError) =>
          if uploadFileError
            return

          # tell the tray to add one more item
          tray.emit 'addmenuitem', {
            detail: {
              name: newFile.fileInfo.name,
              file: newFile
            }
          }

          @_fileRequests.push(newFile)
          @_latestFileRequest = newFile

    @_cleanField()

  @_isSupportedFile: (file) ->
    return file.type.match 'image.*'

  @_cleanField: ->
    # Because we observe the change event, we have to
    # make sure thsi value will be changed after uploading
    # files. Otherwise, we are not able to upload the same
    # file.
    @_fileChooser.val('')

  @getRecentFiles: =>
    sql = 'SELECT file FROM uploaded_files ORDER BY uploaded_time desc LIMIT ' +
      MAX_HISTORY_MENU_ITEM

    # TODO
    # we have to create File instance from this data
    @_db.transaction (tx) ->
      tx.executeSql sql, [], (tx, results) ->
        console.log results.rows.item(1).file

  # static method
  @showFileDialog: ->
    @_fileChooser.click()

  @init: ->
    @_db = db
    @_fileChooser = $(@_fileDialogSel)
    @_fileChooser.change(@_fileInfoHandler)
