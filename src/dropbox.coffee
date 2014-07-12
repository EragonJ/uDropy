dropboxClient = new Dropbox.Client(
  key: DROPBOX_API_KEY
)

# Not sure whether we should keep this or not
dropboxClient.authDriver(
  new Dropbox.AuthDriver.Redirect({ rememberUser: false }))
