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
    // minus from health and stress
    html.find('.minus-btn').click(this._minusButton.bind(this));
    // plus tohealth and stress
    html.find('.plus-btn').click(this._plusButton.bind(this));

    // // Career
    // html.find('.career').click((ev) => {
    //   console.log(ev);
    //   this.actor.update({ 'data.general.career.value': ev });
    // });

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
      let reRoll = false;
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
}
