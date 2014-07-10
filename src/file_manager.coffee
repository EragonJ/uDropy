class FileManager
  # static properties
  @_fileDialogSel = '#fileDialog'
  @_latestFileRequest = null
  @_fileRequests = []
  @_fileChooser = null

  @fileInfoHandler: (evt) =>
    path = $(this).val()
    file = new File(path)
    file.send()

    # Keep the file requests
    @_fileRequests.push(file)
    @_latestFileRequest = file

  # static method
  @showFileDialog: ->
    @_fileChooser.click()

  @init: ->
    $(document).ready =>
      @_fileChooser = $(@_fileDialogSel)
      @_fileChooser.change(@fileInfoHandler)

# Make sure to init at first
FileManager.init()
