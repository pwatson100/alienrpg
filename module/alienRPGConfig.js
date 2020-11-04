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
    return mergeObject(
      {
        fontStyle: game.settings.get('alienrpg', 'fontStyle'),
        fontColour: game.settings.get('alienrpg', 'fontColour'),
      }
      // this.reset ? AlienConfig.ARPG_OPTIONS() : AlienConfig.ARPG_OPTIONS()
    );
  }

  activateListeners(html) {
    super.activateListeners(html);

    // html.find('select').change(this.onApply.bind(this));
    html.find('button[name="reset"]').click(this.onReset.bind(this));

    document.getElementById('fontStyle').value = game.settings.get('alienrpg', 'fontStyle');
    // this.reset = false;
  }

  // onApply(formData) {
  //   var r = document.querySelector(':root');
  //   r.style.setProperty('--aliengreen', formData.fontColour);
  //   r.style.setProperty('--alienfont', formData.fontStyle);

  //   this.render();
  // }

  onReset() {
    // this.reset = true;
    game.settings.set('alienrpg', 'fontStyle', 'Wallpoet');
    game.settings.set('alienrpg', 'fontColour', '#adff2f');
    this.render();
  }

  async _updateObject(event, formData) {
    // console.log('_updateObject -> formData', formData);
    await game.settings.set('alienrpg', 'fontColour', formData.fontColour);
    await game.settings.set('alienrpg', 'fontStyle', formData.fontStyle);
    ui.notifications.info(game.i18n.localize('ALIENRPG.Consumables'));
  }
  close() {
    super.close();
  }

  // * Creates or removes the quick access config button
  // * @param  {Boolean} shown true to add, false to remove

  static toggleConfigButton(shown) {
    const button = $('#AlienRPGButton');
    if (button) button.remove();

    if (shown) {
      const title = game.i18n.localize('ALIENRPG.MenuLabel');

      $(`<button id="AlienRPGButton" data-action="AlienConfig" title="${title}">
       <i class="fas fa-palette"></i> ${title}
     </button>`)
        .insertAfter('button[data-action="configure"]')
        .on('click', (event) => {
          const menu = game.settings.menus.get('alienrpg.alienrpgSettings');
          if (!menu) return ui.notifications.error('No submenu found for the provided key');
          const app = new menu.type();
          return app.render(true);
        });
    }
  }
}
