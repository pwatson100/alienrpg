import { AlienConfig } from './alienRPGConfig.js';

export default function () {
  // Register system settings
  game.settings.register('alienrpg', 'macroShorthand', {
    name: 'ALIENRPG.DefMacro',
    hint: 'ALIENRPG.DefMacroHint',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true,
  });

  game.settings.registerMenu('alienrpg', 'alienrpgSettings', {
    name: 'ALIENRPG.MenuName',
    label: 'ALIENRPG.MenuLabel',
    hint: 'ALIENRPG.MenuHint',
    icon: 'fas fa-palette',
    type: AlienConfig,
    restricted: false,
  });

  // register setting for add/remove menu button
  game.settings.register('alienrpg', 'addMenuButton', {
    name: 'ALIENRPG.AddMenuName',
    hint: 'ALIENRPG.AddMenuHint',
    scope: 'world',
    config: true,
    default: AlienConfig.getDefaults.addMenuButton,
    type: Boolean,
    onChange: (enabled) => {
      AlienConfig.toggleConfigButton(enabled);
    },
  });

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

  game.settings.register('alienrpg', 'alienitemselect', {
    name: 'ALIENRPG.FontStyle',
    restricted: false,
    scope: 'client',
    type: String,
    config: false,
    default: '#e0f287',
  });

  game.settings.register('alienrpg', 'aliendarkergreen', {
    name: 'ALIENRPG.FontStyle',
    restricted: false,
    scope: 'client',
    type: String,
    config: false,
    default: '#29a253',
  });
  game.settings.register('alienrpg', 'alienoddtab', {
    name: 'ALIENRPG.FontStyle',
    restricted: false,
    scope: 'client',
    type: String,
    config: false,
    default: '#14160c',
  });
  game.settings.register('alienrpg', 'aliencrt', {
    name: 'ALIENRPG.FontStyle',
    restricted: false,
    scope: 'client',
    type: Boolean,
    config: false,
    default: false,
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
  
  game.settings.register('alienrpg', 'dollar', {
    name: 'ALIENRPG.Dollar',
    hint: 'ALIENRPG.DollarNote',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true,
  });

  game.settings.register('alienrpg', 'ARPGSemaphore', {
    name: 'Semaphore Flag',
    hint: 'Flag for running sequential actions/scripts',
    scope: 'world',
    type: String,
    config: false,
    default: '',
  });

}


