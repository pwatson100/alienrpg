export function sendDevMessage() {
  if (game.user.isGM) {
    // debugger;
    let jqxhr = $.getJSON('https://raw.githubusercontent.com/pwatson100/alienrpg/master/msgdata/data.json', function (data) {
      let latestVersion = game.settings.get('alienrpg', 'alienrpgDevMessageVersionNumber');
      if (isNaN(latestVersion)) {
        latestVersion = 0;
      }
      if (data.messages === undefined || data.messages === null || data.messages.length === undefined) {
        return;
      }

      for (let i = 0; i < data.messages.length; i++) {
        let msgenvelope = data.messages[i];
        if (msgenvelope.version > latestVersion) {
          ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ alias: 'Alien RPG News' }),
            whisper: [game.user], // ChatMessage.getWhisperRecipients('GM'),
            content: new Handlebars.SafeString(msgenvelope.message),
          });
        }
        latestVersion = Math.max(latestVersion, msgenvelope.version);
      }
      console.log('latestVersion after ' + latestVersion);
      game.settings.set('alienrpg', 'alienrpgDevMessageVersionNumber', latestVersion);
    }).fail(function (data) {
      console.log('Could not retrieve Alien RPG news Message:' + JSON.stringify(data));
    });
  }
}
