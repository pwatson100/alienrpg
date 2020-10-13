import { yze } from '../YZEDiceRoller.js';
import { toNumber } from '../utils.js';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class alienrpgActorSheet extends ActorSheet {
  constructor(...args) {
    super(...args);

    /**
     * Track the set of item filters which are applied
     * @type {Set}
     */
    this._filters = {
      inventory: new Set(),
      // spellbook: new Set(),
      // talents: new Set(),
    };
  }

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['alienrpg', 'sheet', 'actor', 'actor-sheet'],
      // template: 'systems/alienrpg/templates/actor/actor-sheet.html',
      width: 650,
      height: 690,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'general' }],
    });
  }

  get template() {
    const path = 'systems/alienrpg/templates/actor/';
    return `${path}actor-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Basic data
    let isOwner = this.entity.owner;
    const data = {
      owner: isOwner,
      limited: this.entity.limited,
      options: this.options,
      editable: this.isEditable,
      cssClass: isOwner ? 'editable' : 'locked',
      isCharacter: this.entity.data.type === 'character',
      isSynthetic: this.entity.data.type === 'synthetic',
      isVehicles: this.entity.data.type === 'vehicles',
      isCreature: this.entity.data.type === 'creature',
      isNPC: this.entity.data.data.header.npc,
      isGM: game.user.isGM,
      config: CONFIG.ALIENRPG,
    };
    // console.warn('getdata', this.entity.data.name);

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

    // console.warn('data', data, data.filters);

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
    data.actor.data.general.panic.calculatedMax = data.actor.data.general.panic.max; // Update

    data.actor.data.general.radiation.icon = this._getClickIcon(data.actor.data.general.radiation.value, 'radiation');
    data.actor.data.general.xp.icon = this._getClickIcon(data.actor.data.general.xp.value, 'xp');
    data.actor.data.general.starving.icon = this._getContitionIcon(data.actor.data.general.starving.value, 'starving');
    data.actor.data.general.dehydrated.icon = this._getContitionIcon(data.actor.data.general.dehydrated.value, 'dehydrated');
    data.actor.data.general.exhausted.icon = this._getContitionIcon(data.actor.data.general.exhausted.value, 'exhausted');
    data.actor.data.general.freezing.icon = this._getContitionIcon(data.actor.data.general.freezing.value, 'freezing');
    data.actor.data.general.panic.icon = this._getContitionIcon(data.actor.data.general.panic.value, 'panic');
    // this.actor.setFlag('alienrpg', 'sixEs', 0);

    // Prepare items.
    this._prepareItems(data); // Return data to the sheet

    // console.warn('inventory', data.inventory);

    // Return data to the sheet
    return data;
  }

  _findActiveList() {
    return this.element.find('.tab.active .directory-list');
  }

  /*
   * Organize and classify Owned Items for Character sheets
   * @private
   */
  _prepareItems(data) {
    // Initialize containers.
    const talents = [];

    // Iterate through items, allocating to containers
    // let totalWeight = 0;
    for (let i of data.items) {
      let item = i.data;
      // Append to gear.
      if (i.type === 'talent') {
        talents.push(i);
      }
    }

    // Assign and return
    data.talents = talents;
    // console.warn('data.talents', data.talents);
    // console.warn('data.talents', data.talents);

    // Categorize items as inventory, spellbook, features, and classes
    const inventory = {
      weapon: { label: 'Weapons', items: [], dataset: { type: 'weapon' } },
      item: { label: 'Items', items: [], dataset: { type: 'item' } },
      armor: { label: 'Armor', items: [], dataset: { type: 'armor' } },
      // talents: { label: 'Talent', items: [], dataset: { type: 'talents' } },
    };
    // Partition items by category
    let [items, spells, feats, classes, talent] = data.items.reduce(
      (arr, item) => {
        // Item details
        item.img = item.img || DEFAULT_TOKEN;
        item.isStack = item.data.quantity ? item.data.quantity > 1 : false;

        // console.warn('inventory', inventory);

        // Classify items into types
        if (item.type === 'spell') arr[1].push(item);
        else if (item.type === 'feat') arr[2].push(item);
        else if (item.type === 'feature') arr[3].push(item);
        else if (Object.keys(inventory).includes(item.type)) arr[0].push(item);
        return arr;
      },
      [[], [], [], []]
    );

    // Apply active item filters
    items = this._filterItems(items, this._filters.inventory);
    // console.warn('items', items);

    // Organize Inventory
    let totalWeight = 0;
    for (let i of items) {
      if (i.type != 'talent') {
        i.data.attributes.weight.value = i.data.attributes.weight.value || 0;
        i.totalWeight = i.data.attributes.weight.value;
        inventory[i.type].items.push(i);
        totalWeight += i.totalWeight;
      }
    }

    // Loop through the items and update the actors AC
    let totalAc = 0;
    for (let i of items) {
      try {
        i.data.attributes.armorrating.value === true;
        i.data.attributes.armorrating.value = i.data.attributes.armorrating.value || 0;
        i.totalAc = parseInt(i.data.attributes.armorrating.value, 10);
        totalAc += i.totalAc;
        data.data.general.armor.value = totalAc;
      } catch {
        data.data.general.armor.value = totalAc;
      }
    }
    // console.warn('totalAc', i.totalAc, totalAc);

    data.data.general.encumbrance = this._computeEncumbrance(totalWeight, data);

    // Assign and return
    data.inventory = Object.values(inventory);
  }

  /*
   * Compute the level and percentage of encumbrance for an Actor.
   *
   * Optionally include the weight of carried currency across all denominations by applying the standard rule
   * from the PHB pg. 143
   *
   * @param {Number} totalWeight    The cumulative item weight from inventory items
   * @param {Object} actorData      The data object for the Actor being rendered
   * @return {Object}               An object describing the character's encumbrance level
   * @private
   */
  _computeEncumbrance(totalWeight, actorData) {
    // Compute Encumbrance percentage
    const enc = {
      max: actorData.data.attributes.str.value * 4,
      value: Math.round(totalWeight * 10) / 10,
    };
    enc.pct = Math.min((enc.value * 100) / enc.max, 99);
    enc.encumbered = enc.pct > 50;
    return enc;
  }

  /**
   * Determine whether an Owned Item will be shown based on the current set of filters
   * @return {boolean}
   * @private
   */
  _filterItems(items, filters) {
    return items.filter((item) => {
      const data = item.data;

      // Action usage
      for (let f of ['action', 'bonus', 'reaction']) {
        if (filters.has(f)) {
          if (data.activation && data.activation.type !== f) return false;
        }
      }

      // Spell-specific filters
      if (filters.has('ritual')) {
        if (data.components.ritual !== true) return false;
      }
      if (filters.has('concentration')) {
        if (data.components.concentration !== true) return false;
      }
      if (filters.has('prepared')) {
        if (data.level === 0 || ['innate', 'always'].includes(data.preparation.mode)) return true;
        if (this.actor.data.type === 'npc') return true;
        return data.preparation.prepared;
      }

      // Equipment-specific filters
      if (filters.has('equipped')) {
        if (data.equipped !== true) return false;
      }
      return true;
    });
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

    html.find('.rollable').contextmenu(this._onRollMod.bind(this));

    // Rollable Items.
    html.find('.rollItem').click(this._rollItem.bind(this));

    html.find('.rollItem').contextmenu(this._onRollItemMod.bind(this));

    // minus from health and stress
    html.find('.minus-btn').click(this._minusButton.bind(this));

    // plus tohealth and stress
    html.find('.plus-btn').click(this._plusButton.bind(this));

    html.find('.click-stat-level').on('click contextmenu', this._onClickStatLevel.bind(this)); // Toggle Dying Wounded

    html.find('.supply-btn').click(this._supplyRoll.bind(this));

    html.find('.stunt-btn').click(this._stuntBtn.bind(this));

    html.find('.talent-btn').click(this._talentBtn.bind(this));

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
    game.alienrpg.rollArr.sCount = 0;
    if (dataset.roll) {
      let r1Data = parseInt(dataset.roll || 0);
      let r2Data = this.actor.getRollData().stress;
      let reRoll = false;
      let hostile = 'character';
      let blind = false;
      if (dataset.spbutt === 'armor' && r1Data < 1) {
        return;
      } else if (dataset.spbutt === 'armor') {
        label = 'Armor';
        r2Data = 0;
      }
      if (this.actor.data.token.disposition === -1) {
        // hostile = true;
        blind = true;
      }
      yze.yzeRoll(hostile, blind, reRoll, label, r1Data, 'Black', r2Data, 'Stress');
      game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
    } else {
      if (dataset.panicroll) {
        // Roll against the panic table and push the roll to the chat log.
        let chatMessage = '';
        const table = game.tables.getName('Panic Table');
        const roll = new Roll('1d6 + @stress', this.actor.getRollData());
        const customResults = table.roll({ roll });
        let oldPanic = this.actor.data.data.general.panic.lastRoll;

        // console.warn('customResults.roll.total', customResults.roll.total);

        if (customResults.roll.total >= 7 && this.actor.data.data.general.panic.value === 0) {
          this.actor.update({ 'data.general.panic.value': this.actor.data.data.general.panic.value + 1 });
        }

        chatMessage += '<h2>Panic Condition</h2>';
        chatMessage += `<h4><i>${table.data.description}</i></h4>`;

        let mPanic = customResults.roll.total < this.actor.data.data.general.panic.lastRoll;
        let pCheck = oldPanic + 1;
        // console.warn('mPanic', mPanic);
        if (this.actor.data.data.general.panic.value && mPanic) {
          this.actor.update({ 'data.general.panic.lastRoll': pCheck });
          // console.warn('this.actor.data.data.general.panic.lastRoll', this.actor.data.data.general.panic.lastRoll);

          chatMessage += `<h4><i><b>Roll ${customResults.roll.total}   More Panic.</b> </i></h4>`;
          chatMessage += `<h4><i>PC's Panic level has increased by one step to <b>Level ${pCheck}</b> (See page 104 of the Alien rule book.)</i></h4>`;
          switch (pCheck) {
            case 8:
              chatMessage += `<b>TREMBLE:</b>  You start to tremble uncontrollably. All skill rolls using AGILITY suffer a –2 modification until your panic stops.`;
              break;
            case 9:
              chatMessage += `<b>DROP ITEM:</b>  Whether by stress, confusion or the realization that you’re all going to die anyway, you drop a weapon or other important item—the GM decides which one. Your STRESS LEVEL increases by one.`;
              break;
            case 10:
              chatMessage += `<b>FREEZE:</b>  You’re frozen by fear or stress for one Round, losing your next slow action. Your STRESS LEVEL, and the STRESS LEVEL of all friendly PCs in SHORT range of you, increases by one`;
              break;
            case 11:
              chatMessage += `<b>SEEK COVER:</b>  You must use your next action to move away from danger and find a safe spot if possible. You are allowed to make a retreat roll (see page 93) if you have an enemy at ENGAGED range. Your STRESS LEVEL is decreased by one, but the STRESS LEVEL of all friendly PCs in SHORT range increases by one. After one Round, you can act normally.`;
              break;
            case 12:
              chatMessage += `<b>SCREAM:</b> You scream your lungs out for one Round, losing your next slow action. Your STRESS LEVEL is decreased by one, but every friendly character who hears your scream must make an immediate Panic Roll.`;
              break;
            case 13:
              chatMessage += `<b>FLEE:</b>  You just can’t take it anymore. You must flee to a safe place and refuse to leave it. You won’t attack anyone and won’t attempt anything dangerous. You are not allowed to make a retreat roll (see page 93) if you have an enemy at ENGAGED range when you flee. Your STRESS LEVEL is decreased by one, but every friendly character who sees you run must make an immediate Panic Roll.`;
              break;
            case 14:
              chatMessage += `<b>BERSERK:</b>  You must immediately attack the nearest person or creature, friendly or not. You won’t stop until you or the target is Broken. Every friendly character who witnesses your rampage must make an immediate Panic Roll`;
              break;
            default:
              chatMessage += `<b>CATATONIC:</b>  You collapse to the floor and can’t talk or move, staring blankly into oblivion.`;
              break;
          }
        } else {
          this.actor.update({ 'data.general.panic.lastRoll': customResults.roll.total });
          // console.warn('Else', this.actor.data.data.general.panic.lastRoll);

          chatMessage += `<h4><i><b>Roll ${customResults.roll.total} </b></i></h4>`;
          chatMessage += `${customResults.results[0].text}`;
          if (customResults.roll.total >= 7) {
            chatMessage += `<h4><i><b>You are at Panic <b>Level ${customResults.roll.total}</b></i></h4>`;
          }
        }
        let trauma = customResults.roll.total >= 13 || pCheck >= 13;
        // console.warn('trauma', trauma);
        if (trauma) {
          chatMessage += `<h4><b>Permanant Trauma. Make an EMPATHY roll at the end of the session. <i>(See page 106 of the Alien rule book.)</i></h4></b>`;
        }
        ChatMessage.create({ user: game.user._id, content: chatMessage, other: game.users.entities.filter((u) => u.isGM).map((u) => u._id), type: CONST.CHAT_MESSAGE_TYPES.OTHER });
      }
    }
  }

  _onRollMod(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    let label = dataset.label;
    game.alienrpg.rollArr.sCount = 0;

    let r1Data = parseInt(dataset.roll || 0);
    let r2Data = this.actor.getRollData().stress;
    let reRoll = false;
    let hostile = 'character';
    let blind = false;
    if (dataset.spbutt === 'armor' && r1Data < 1) {
      return;
    } else if (dataset.spbutt === 'armor') {
      label = 'Armor';
      r2Data = 0;
    }

    if (this.actor.data.token.disposition === -1) {
      // hostile = true;
      blind = true;
    }

    // callpop upbox here to get any mods then update r1Data or rData as appropriate.
    let confirmed = false;
    new Dialog({
      title: `Roll Modified ${label} check`,
      content: `
       <p>Please enter your modifier.</p>
       <form>
        <div class="form-group">
         <label>Base Modifier:</label>
           <input type="text" id="modifier" name="modifier" value="0" autofocus="autofocus">
           </div>
           <div class="form-group">
           <label>Stress Modifier:</label>
           <input type="text" id="stressMod" name="stressMod" value="0" autofocus="autofocus">
        </div>
       </form>
       `,
      buttons: {
        one: {
          icon: '<i class="fas fa-check"></i>',
          label: 'Roll!',
          callback: () => (confirmed = true),
        },
        two: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Cancel',
          callback: () => (confirmed = false),
        },
      },
      default: 'one',
      close: (html) => {
        if (confirmed) {
          let modifier = parseInt(html.find('[name=modifier]')[0].value);
          let stressMod = parseInt(html.find('[name=stressMod]')[0].value);
          r1Data = r1Data + modifier;
          r2Data = r2Data + stressMod;
          yze.yzeRoll(hostile, blind, reRoll, label, r1Data, 'Black', r2Data, 'Stress');
          game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
        }
      },
    }).render(true);
  }

  _onRollItemMod(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    let label = dataset.label;
    let r1Data = parseInt(dataset.roll || 0);
    let r2Data = this.actor.getRollData().stress;
    let reRoll = false;
    let hostile = 'character';
    let blind = false;

    const itemId = $(event.currentTarget).parents('.item').attr('data-item-id');
    const item = this.actor.getOwnedItem(itemId);
    // console.warn('item', item);
    if (item.type === 'weapon') {
      // Trigger the item roll
      return item.roll(true);
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
  _stuntBtn(event) {
    event.preventDefault();
    let li = $(event.currentTarget).parents('.grid-container');
    let li2 = li.children('#panel');

    const dataset = event.currentTarget.dataset;
    let item = game.items.getName(dataset.pmbut);
    let chatData = item.data.data.description;
    let div = $(`<div class="panel Col3">${chatData}</div>`);

    // Toggle summary
    if (li2.hasClass('expanded')) {
      let summary = li2.children('.panel');
      summary.slideUp(200, () => summary.remove());
    } else {
      li2.append(div.hide());
      div.slideDown(200);
    }
    li2.toggleClass('expanded');
  }

  _talentBtn(event) {
    event.preventDefault();
    let li = $(event.currentTarget).parents('.grid-container');
    let li2 = li.children('#panel');

    const dataset = event.currentTarget.dataset;
    let item = this.actor.getOwnedItem(dataset.pmbut);
    let chatData = item.data.data.general.comment.value;
    let div = $(`<div class="panel Col3">${chatData}</div>`);

    // Toggle summary
    if (li2.hasClass('expanded')) {
      let summary = li2.children('.panel');
      summary.slideUp(200, () => summary.remove());
    } else {
      li2.append(div.hide());
      div.slideDown(200);
    }
    li2.toggleClass('expanded');
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
      if (field[0].name === 'data.general.panic.value') {
        // console.warn('Here', field[0].name);
        this.actor.update({ 'data.general.panic.lastRoll': 0 });
      }
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

    // console.warn(element);
    const consUme = dataset.spbutt.toLowerCase();
    let r1Data = 0;
    let r2Data = this.actor.data.data.consumables[consUme].value;
    let reRoll = true;
    // let hostile = this.actor.data.data.type;
    let blind = false;

    if (this.actor.data.token.disposition === -1) {
      blind = true;
    }
    if (r2Data <= 0) {
      return ui.notifications.warn('You have run out of supplies');
    } else {
      yze.yzeRoll('supply', blind, reRoll, label, r1Data, 'Black', r2Data, 'Stress');
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
    // const element = event.currentTarget;
    // console.warn('element', element);
    const itemId = $(event.currentTarget).parents('.item').attr('data-item-id');
    const item = this.actor.getOwnedItem(itemId);
    // console.warn('item', item);
    if (item.type === 'weapon') {
      // Trigger the item roll
      return item.roll();
    }
  }
}
export default alienrpgActorSheet;
