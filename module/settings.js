export default function () {
  game.settings.register('alienrpg', 'defaultTokenSettings', {
    name: 'Default Prototype Token Settings',
    hint: 'Automatically set advised prototype token settings to newly created Actors.',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean,
  });
}
