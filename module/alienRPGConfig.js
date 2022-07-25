export class AlienConfig extends FormApplication {
  static get getDefaults() {
    return {
      addMenuButton: true,
    };
  }
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      title: game.i18n.localize('ALIENRPG.MenuLabel'),
      id: 'alienprgSettings',
      icon: 'fas fa-cogs',
      template: 'systems/alienrpg/module/alienprgSettings.html',
      width: 400,
      closeOnSubmit: true,
    });
  }

  getData(options) {
    return mergeObject({
      fontStyle: game.settings.get('alienrpg', 'fontStyle'),
      fontColour: game.settings.get('alienrpg', 'fontColour'),
      journalFontColour: game.settings.get('alienrpg', 'JournalFontColour'),
    });
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find('button[name="reset"]').click(this.onReset.bind(this));
    document.getElementById('fontStyle').value = game.settings.get('alienrpg', 'fontStyle');

    html.find('button[name="addcrt"]').click(this.onCRT.bind(this));
  }

  async onReset() {
    // this.reset = true;
    await game.settings.set('alienrpg', 'fontStyle', 'OCR-A');
    await game.settings.set('alienrpg', 'fontColour', '#adff2f');
    await game.settings.set('alienrpg', 'JournalFontColour', '#b1e0e7');
    await game.settings.set('alienrpg', 'aliencrt', false);

    location.reload();
  }

  async onCRT() {
    await game.settings.set('alienrpg', 'aliencrt', true);
    await game.settings.set('alienrpg', 'fontStyle', 'Kosugi');
    await game.settings.set('alienrpg', 'fontColour', '#88f2ad');
    location.reload();
  }

  async _updateObject(event, formData) {
    // console.log('_updateObject -> formData', formData);
    await game.settings.set('alienrpg', 'fontColour', formData.fontColour);
    await game.settings.set('alienrpg', 'fontStyle', formData.fontStyle);
    await game.settings.set('alienrpg', 'JournalFontColour', formData.journalFontColour);
    ui.notifications.info(game.i18n.localize('ALIENRPG.Consumables'));
    location.reload();
  }

  close() {
    super.close();
  }

  // * Creates or removes the quick access config button
  // * @param  {Boolean} shown true to add, false to remove

  static toggleConfigButton(shown) {
    const button = $('#AlienRPGButton');
    const menu = game.settings.menus.get('alienrpg.alienrpgSettings');

   if (button) button.remove();

    if (shown) {
      const title = game.i18n.localize('ALIENRPG.MenuLabel');

      $(`<button id="AlienRPGButton" data-action="AlienConfig" title="${title}">
       <i class="fas fa-palette"></i> ${title}
     </button>`)
        .insertAfter('button[data-action="configure"]')
        .on('click', (event) => {
          if (!menu) return ui.notifications.error('No submenu found for the provided key');
          const app = new menu.type();
          // game.settings.set('alienrpg', 'addMenuButton', true);

          return app.render(true);
        });
    }
  }
}
