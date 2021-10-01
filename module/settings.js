export default function () {
  // Register system settings
  game.settings.register('alienrpg', 'fontColour', {
    name: 'ALIENRPG.Fontpick',
    label: 'ALIENRPG.Colpick',
    hint: 'ALIENRPG.ColpickHint',
    icon: 'fas fa-dice-d20',
    restricted: false,
    type: String,
    config: false,
    scope: 'client',
    default: '#adff2f',
  });

  game.settings.register('alienrpg', 'fontStyle', {
    name: 'ALIENRPG.FontStyle',
    label: 'ALIENRPG.StylePicker',
    hint: 'ALIENRPG.StylePickerHint',
    icon: 'fas fa-cogs',
    restricted: false,
    scope: 'client',
    type: String,
    config: false,
    default: 'OCR-A',
  });

  game.settings.register('alienrpg', 'defaultTokenSettings', {
    name: 'ALIENRPG.DefProto',
    hint: 'ALIENRPG.DefProtoHint',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean,
  });
  game.settings.register('alienrpg', 'systemMigrationVersion', {
    name: 'System Migration Version',
    scope: 'world',
    config: false,
    type: String,
    default: 0,
  });

  game.settings.register('alienrpg', 'switchMouseKeys', {
    name: 'ALIENRPG.SwitchKeys',
    hint: 'ALIENRPG.SwitchKeysHint',
    scope: 'client',
    type: Boolean,
    default: false,
    config: true,
    onChange: () => {
      location.reload();
    },
  });

  game.settings.register('alienrpg', 'alienrpgDevMessageVersionNumber', {
    name: 'Message from the devs',
    hint: 'Used to track last message id from the Alien RPG devs',
    scope: 'world',
    config: false,
    default: 0,
    type: Number,
  });

  game.settings.register('alienrpg', 'alienrpgHideInitChat', {
    name: 'ALIENRPG.hideInitChat',
    hint: 'ALIENRPG.hideInitChatHint',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });

  game.settings.register('alienrpg', 'switchJournalColour', {
    name: 'ALIENRPG.hideJournalBGImage',
    hint: 'ALIENRPG.hideJournalBGImageNote',
    scope: 'client',
    type: Boolean,
    default: false,
    config: true,
    onChange: () => {
      location.reload();
    },
  });
  game.settings.register('alienrpg', 'JournalFontColour', {
    name: 'ALIENRPG.Fontpick',
    label: 'ALIENRPG.Colpick',
    hint: 'ALIENRPG.ColpickHint',
    icon: 'fas fa-dice-d20',
    restricted: false,
    type: String,
    config: false,
    scope: 'client',
    default: '#b1e0e7',
  });
  game.settings.register('alienrpg', 'switchchatbackground', {
    name: 'ALIENRPG.hideChatBGImage',
    hint: 'ALIENRPG.hideChatBGImageNote',
    scope: 'client',
    type: Boolean,
    default: false,
    config: true,
    onChange: () => {
      location.reload();
    },
  });
}
