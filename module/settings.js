export default function () {
  game.settings.register('alienrpg', 'defaultTokenSettings', {
    name: 'Default Prototype Token Settings',
    hint: 'Automatically set advised prototype token settings to newly created Actors.',
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
}
