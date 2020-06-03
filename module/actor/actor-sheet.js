import { yze } from '../YZEDiceRoller.js';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class alienrpgActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['alienrpg', 'sheet', 'actor'],
      template: 'systems/alienrpg/templates/actor/actor-sheet.html',
      width: 600,
      height: 665,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'general' }],
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // const data = super.getData();
    // data.dtypes = ['String', 'Number', 'Boolean'];
    // for (let attr of Object.values(data.data.attributes)) {
    //   attr.isCheckbox = attr.dtype === 'Boolean';
    // }

    // Basic data
    let isOwner = this.entity.owner;
    const data = {
      owner: isOwner,
      limited: this.entity.limited,
      options: this.options,
      editable: this.isEditable,
      cssClass: isOwner ? 'editable' : 'locked',
      isCharacter: this.entity.data.type === 'character',
      // isNPC: this.entity.data.type === "npc",
      config: CONFIG.ALIENRPG,
    };

    // The Actor and its Items
    data.actor = duplicate(this.actor.data);
    data.items = this.actor.items.map((i) => {
      i.data.labels = i.labels;
      return i.data;
    });
    data.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    data.data = data.actor.data;
    data.labels = this.actor.labels || {};
    data.filters = this._filters;

    // Ability Scores
    for (let [a, abl] of Object.entries(data.actor.data.attributes)) {
      abl.label = CONFIG.ALIENRPG.attributes[a];
    }

    // Update skill labels
    for (let [s, skl] of Object.entries(data.actor.data.skills)) {
      skl.label = CONFIG.ALIENRPG.skills[s];
    }

    data.actor.data.general.radiation.calculatedMax = data.actor.data.general.radiation.max; // Update
    data.actor.data.general.xp.calculatedMax = data.actor.data.general.xp.max; // Update
    data.actor.data.general.starving.calculatedMax = data.actor.data.general.starving.max; // Update
    data.actor.data.general.dehydrated.calculatedMax = data.actor.data.general.dehydrated.max; // Update
    data.actor.data.general.exhausted.calculatedMax = data.actor.data.general.exhausted.max; // Update
    data.actor.data.general.freezing.calculatedMax = data.actor.data.general.freezing.max; // Update

    data.actor.data.general.radiation.icon = this._getClickIcon(data.actor.data.general.radiation.value, 'radiation');
    data.actor.data.general.xp.icon = this._getClickIcon(data.actor.data.general.xp.value, 'xp');
    data.actor.data.general.starving.icon = this._getContitionIcon(data.actor.data.general.starving.value, 'starving');
    data.actor.data.general.dehydrated.icon = this._getContitionIcon(data.actor.data.general.dehydrated.value, 'dehydrated');
    data.actor.data.general.exhausted.icon = this._getContitionIcon(data.actor.data.general.exhausted.value, 'exhausted');
    data.actor.data.general.freezing.icon = this._getContitionIcon(data.actor.data.general.freezing.value, 'freezing');

    // Return data to the sheet

    return data;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click((ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.getOwnedItem(li.data('itemId'));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click((ev) => {
      const li = $(ev.currentTarget).parents('.item');
      this.actor.deleteOwnedItem(li.data('itemId'));
      li.slideUp(200, () => this.render(false));
    });

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Rollable Items.
    html.find('.rollItem').click(this._rollItem.bind(this));

    // minus from health and stress
    html.find('.minus-btn').click(this._minusButton.bind(this));

    // plus tohealth and stress
    html.find('.plus-btn').click(this._plusButton.bind(this));

    html.find('.click-stat-level').on('click contextmenu', this._onClickStatLevel.bind(this)); // Toggle Dying Wounded

    html.find('.supply-btn').click(this._supplyRoll.bind(this));

    // Drag events for macros.
    if (this.actor.owner) {
      let handler = (ev) => this._onDragItemStart(ev);
      // Find all items on the character sheet.
      html.find('li.item').each((i, li) => {
        // Ignore for the header row.
        if (li.classList.contains('item-header')) return;
        // Add draggable attribute and dragstart listener.
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', handler, false);
      });
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data['type'];

    // Finally, create the item!
    return this.actor.createOwnedItem(itemData);
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    let label = dataset.label;
    if (dataset.roll) {
      let r1Data = parseInt(dataset.roll || 0);
      let r2Data = this.actor.getRollData().stress;
      let reRoll = 'false';
      yze.yzeRoll(reRoll, label, r1Data, 'Black', r2Data, 'Stress');
      // console.log('onRoll', game.alienrpg.rollArr);
    } else {
      if (dataset.panicroll) {
        // Roll against the panic table and push the roll to the chat log.
        let chatMessage = '';
        const table = game.tables.getName('Panic Table');
        const roll = new Roll('1d6 + @stress', this.actor.getRollData());
        const customResults = table.roll({ roll });
        chatMessage += '<h2>Panic Condition</h2>';
        chatMessage += `<h4><i>${table.data.description}</i></h4>`;
        chatMessage += `${customResults.results[0].text}`;
        ChatMessage.create({ user: game.user._id, content: chatMessage, other: game.users.entities.filter((u) => u.isGM).map((u) => u._id), type: CONST.CHAT_MESSAGE_TYPES.OTHER });
      }
    }
  }
  _minusButton(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    if (dataset.pmbut === 'minusStress') {
      this.actor.update({ 'data.header.stress.value': this.actor.data.data.header.stress.value - 1 });
      // }
    } else {
      this.actor.update({ 'data.header.health.value': this.actor.data.data.header.health.value - 1 });
    }
  }
  _plusButton(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    if (dataset.pmbut === 'plusStress') {
      this.actor.update({ 'data.header.stress.value': this.actor.data.data.header.stress.value + 1 });
    } else {
      this.actor.update({ 'data.header.health.value': this.actor.data.data.header.health.value + 1 });
    }
  }

  _onClickStatLevel(event) {
    event.preventDefault();

    const field = $(event.currentTarget).siblings('input[type="hidden"]');
    const max = field.data('max') == undefined ? 4 : field.data('max');
    const statIsItemType = field.data('stat-type') == undefined ? false : field.data('stat-type'); // Get the current level and the array of levels
    const level = parseFloat(field.val());
    let newLevel = ''; // Toggle next level - forward on click, backwards on right

    if (event.type === 'click') {
      newLevel = Math.clamped(level + 1, 0, max);
    } else if (event.type === 'contextmenu') {
      newLevel = Math.clamped(level - 1, 0, max);
    } // Update the field value and save the form

    field.val(newLevel);

    this._onSubmit(event);
  }

  /**
   * Get the font-awesome icon used to display a certain level of radiation
   * @private
   */

  _getClickIcon(level, stat) {
    const maxPoints = this.object.data.data.general[stat].max;
    const icons = {};
    const usedPoint = '<i class="far fa-dot-circle"></i>';
    const unUsedPoint = '<i class="far fa-circle"></i>';

    for (let i = 0; i <= maxPoints; i++) {
      let iconHtml = '';

      for (let iconColumn = 1; iconColumn <= maxPoints; iconColumn++) {
        iconHtml += iconColumn <= i ? usedPoint : unUsedPoint;
      }

      icons[i] = iconHtml;
    }

    return icons[level];
  }
  _getContitionIcon(level, stat) {
    const maxPoints = this.object.data.data.general[stat].max;
    const icons = {};
    const usedPoint = '<i class="far fa-dot-circle"></i>';
    const unUsedPoint = '<i class="far fa-circle"></i>';

    for (let i = 0; i <= maxPoints; i++) {
      let iconHtml = '';

      for (let iconColumn = 1; iconColumn <= maxPoints; iconColumn++) {
        iconHtml += iconColumn <= i ? usedPoint : unUsedPoint;
      }

      icons[i] = iconHtml;
    }

    return icons[level];
  }

  _supplyRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const lTemp = 'ALIENRPG.' + dataset.spbutt;
    const label = game.i18n.localize(lTemp) + ' ' + game.i18n.localize('ALIENRPG.Supply');

    // console.log(element);
    const consUme = dataset.spbutt.toLowerCase();
    let r1Data = 0;
    let r2Data = this.actor.data.data.consumables[consUme].value;
    let reRoll = 'never';
    if (r2Data <= 0) {
      return ui.notifications.warn('You have run out of supplies');
    } else {
      yze.yzeRoll(reRoll, label, r1Data, 'Black', r2Data, 'Stress');
      if (game.alienrpg.rollArr.r2One) {
        switch (consUme) {
          case 'air':
            this.actor.update({ 'data.consumables.air.value': this.actor.data.data.consumables.air.value - game.alienrpg.rollArr.r2One });
            break;
          case 'food':
            this.actor.update({ 'data.consumables.food.value': this.actor.data.data.consumables.food.value - game.alienrpg.rollArr.r2One });
            break;
          case 'power':
            this.actor.update({ 'data.consumables.power.value': this.actor.data.data.consumables.power.value - game.alienrpg.rollArr.r2One });
            break;
          case 'water':
            this.actor.update({ 'data.consumables.water.value': this.actor.data.data.consumables.water.value - game.alienrpg.rollArr.r2One });
            break;
        }
      }
    }
  }

  _rollItem(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    let label = dataset.label;
    const itemName = dataset.item;
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    // console.log('actor-sheet.js 321 - Got here', speaker, actor);
    const item = actor ? actor.items.find((i) => i.name === itemName) : null;
    if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);

    // Trigger the item roll
    return item.roll();
  }
}
