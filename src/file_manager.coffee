class FileManager
  # static properties
  @_fileDialogSel = '#fileDialog'
  @_latestFileRequest = null
  @_fileRequests = []
  @_fileChooser = null

  @_fileInfoHandler: (evt) =>
    files = evt.target.files
    @_processFile file for file in files

  @_processFile: (file) ->
    if @_isSupportedFile(file)
      newFile = new File(file, dropboxClient)
      newFile.read =>
        newFile.upload =>
          # tell the tray to add one more item
          tray.emit 'appendmenuitem', {
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

  # static method
  @showFileDialog: ->
    @_fileChooser.click()

  @init: ->
    $(document).ready =>
      @_fileChooser = $(@_fileDialogSel)
      @_fileChooser.change(@_fileInfoHandler)

# Make sure to init at first
FileManager.init()
