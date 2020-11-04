export default function () {
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
    scope: 'world',
    type: Boolean,
    default: false,
    config: true,
    onChange: () => {
      location.reload();
    },
  });
}
