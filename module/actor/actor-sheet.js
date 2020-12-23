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
    };
  }

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['alienrpg', 'sheet', 'actor', 'actor-sheet'],
      // template: 'systems/alienrpg/templates/actor/actor-sheet.html',
      width: 740,
      height: 741,
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

    // The Actor and its Items
    data.actor = duplicate(this.actor.data);
    const actorData = data.actor.data;

    data.items = this.actor.items.map((i) => {
      i.data.labels = i.labels;
      return i.data;
    });
    data.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    data.data = data.actor.data;
    data.labels = this.actor.labels || {};
    data.filters = this._filters;

    // data.actor.data.general.radiation.calculatedMax = data.actor.data.general.radiation.max; // Update
    this.actor.update({ 'general.radiation.calculatedMax': data.actor.data.general.radiation.max });

    // data.actor.data.general.xp.calculatedMax = data.actor.data.general.xp.max; // Update
    this.actor.update({ 'general.xp.calculatedMax': data.actor.data.general.xp.max });

    // data.actor.data.general.starving.calculatedMax = data.actor.data.general.starving.max; // Update
    this.actor.update({ 'general.starving.calculatedMax': data.actor.data.general.starving.max });

    // data.actor.data.general.dehydrated.calculatedMax = data.actor.data.general.dehydrated.max; // Update
    this.actor.update({ 'general.dehydrated.calculatedMax': data.actor.data.general.dehydrated.max });

    // data.actor.data.general.exhausted.calculatedMax = data.actor.data.general.exhausted.max; // Update
    this.actor.update({ 'general.exhausted.calculatedMax': data.actor.data.general.exhausted.max });

    // data.actor.data.general.freezing.calculatedMax = data.actor.data.general.freezing.max; // Update
    this.actor.update({ 'general.freezing.calculatedMax': data.actor.data.general.freezing.max });

    // data.actor.data.general.panic.calculatedMax = data.actor.data.general.panic.max; // Update
    this.actor.update({ 'general.panic.calculatedMax': data.actor.data.general.panic.max });

    this.actor.update({ 'data.header.health.max': actorData.attributes.str.value });

    data.actor.data.general.radiation.icon = this._getClickIcon(data.actor.data.general.radiation.value, 'radiation');
    data.actor.data.general.xp.icon = this._getClickIcon(data.actor.data.general.xp.value, 'xp');
    data.actor.data.general.starving.icon = this._getContitionIcon(data.actor.data.general.starving.value, 'starving');
    data.actor.data.general.dehydrated.icon = this._getContitionIcon(data.actor.data.general.dehydrated.value, 'dehydrated');
    data.actor.data.general.exhausted.icon = this._getContitionIcon(data.actor.data.general.exhausted.value, 'exhausted');
    data.actor.data.general.freezing.icon = this._getContitionIcon(data.actor.data.general.freezing.value, 'freezing');
    data.actor.data.general.panic.icon = this._getContitionIcon(data.actor.data.general.panic.value, 'panic');
    // Prepare items.
    this._prepareItems(data); // Return data to the sheet

    //Return data to the sheet
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
    for (let i of data.items) {
      let item = i.data;
      // Append to gear.
      if (i.type === 'talent') {
        talents.push(i);
      }
    }

    // Assign and return
    data.talents = talents;

    const agendas = [];

    // Iterate through items, allocating to containers
    for (let i of data.items) {
      let item = i.data;
      // Append to gear.
      if (i.type === 'agenda') {
        agendas.push(i);
      }
    }

    // Assign and return
    data.agendas = agendas;

    // Categorize items as inventory, spellbook, features, and classes
    const inventory = {
      weapon: { label: 'Weapons', items: [], dataset: { type: 'weapon' } },
      item: { label: 'Items', items: [], dataset: { type: 'item' } },
      armor: { label: 'Armor', items: [], dataset: { type: 'armor' } },
    };
    // Partition items by category
    let [items, spells, feats, classes, talent] = data.items.reduce(
      (arr, item) => {
        // Item details
        item.img = item.img || DEFAULT_TOKEN;
        item.isStack = item.data.quantity ? item.data.quantity > 1 : false;

        // Classify items into types
        // console.log('alienrpgActorSheet -> _prepareItems -> item', item);
        // if (item.type === 'talent') arr[1].push(item);
        // else if (item.type === 'feat') arr[2].push(item);
        // else if (item.type === 'feature') arr[3].push(item);
        if (Object.keys(inventory).includes(item.type)) arr[0].push(item);
        return arr;
      },
      [[], [], [], []]
    );

    // Apply active item filters
    items = this._filterItems(items, this._filters.inventory);

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
      // for (let f of ['action', 'bonus', 'reaction']) {
      //   if (filters.has(f)) {
      //     if (data.activation && data.activation.type !== f) return false;
      //   }
      // }

      // // Spell-specific filters
      // if (filters.has('ritual')) {
      //   if (data.components.ritual !== true) return false;
      // }
      // if (filters.has('concentration')) {
      //   if (data.components.concentration !== true) return false;
      // }
      // if (filters.has('prepared')) {
      //   if (data.level === 0 || ['innate', 'always'].includes(data.preparation.mode)) return true;
      //   if (this.actor.data.type === 'npc') return true;
      //   return data.preparation.prepared;
      // }

      // // Equipment-specific filters
      // if (filters.has('equipped')) {
      //   if (data.equipped !== true) return false;
      // }
      return true;
    });
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;
    const itemContextMenu = [
      {
        name: game.i18n.localize('ALIENRPG.EditItem'),
        icon: '<i class="fas fa-edit"></i>',
        callback: (element) => {
          const item = this.actor.getOwnedItem(element.data('item-id'));
          item.sheet.render(true);
        },
      },
      {
        name: game.i18n.localize('ALIENRPG.DeleteItem'),
        icon: '<i class="fas fa-trash"></i>',
        callback: (element) => {
          this.actor.deleteOwnedItem(element.data('item-id'));
        },
      },
    ];

    // Add Inventory Item
    new ContextMenu(html, '.item-edit', itemContextMenu);

    // html.find('.item-create').click(this._onItemCreate.bind(this));

    // // Update Inventory Item
    // html.find('.item-edit').click((ev) => {
    //   const li = $(ev.currentTarget).parents('.item');
    //   const item = this.actor.getOwnedItem(li.data('itemId'));
    //   item.sheet.render(true);
    // });

    // // Delete Inventory Item
    // html.find('.item-delete').click((ev) => {
    //   const li = $(ev.currentTarget).parents('.item');
    //   this.actor.deleteOwnedItem(li.data('itemId'));
    //   li.slideUp(200, () => this.render(false));
    // });

    if (game.settings.get('alienrpg', 'switchMouseKeys')) {
      // Right to Roll and left to mod
      // Rollable abilities.
      html.find('.rollable').contextmenu(this._onRoll.bind(this));

      html.find('.rollable').click(this._onRollMod.bind(this));

      // Rollable Items.
      html.find('.rollItem').contextmenu(this._rollItem.bind(this));

      html.find('.rollItem').click(this._onRollItemMod.bind(this));
    } else {
      // Left to Roll and Right toMod
      // Rollable abilities.
      html.find('.rollable').click(this._onRoll.bind(this));

      html.find('.rollable').contextmenu(this._onRollMod.bind(this));

      // Rollable Items.
      html.find('.rollItem').click(this._rollItem.bind(this));

      html.find('.rollItem').contextmenu(this._onRollItemMod.bind(this));
    }

    // minus from health and stress
    html.find('.minus-btn').click(this._plusMinusButton.bind(this));

    // plus tohealth and stress
    html.find('.plus-btn').click(this._plusMinusButton.bind(this));

    html.find('.click-stat-level').on('click contextmenu', this._onClickStatLevel.bind(this)); // Toggle for radio buttons

    html.find('.supply-btn').click(this._supplyRoll.bind(this));

    html.find('.stunt-btn').click(this._stuntBtn.bind(this));

    html.find('.talent-btn').click(this._talentBtn.bind(this));

    html.find('.inline-edit').change(this._inlineedit.bind(this));

    html.find('.activate').click(this._activate.bind(this));
    html.find('.activate').contextmenu(this._deactivate.bind(this));

    // Drag events for macros.
    if (this.actor.owner) {
      let handler = (ev) => this._onDragStart(ev);
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

  _inlineedit(event) {
    event.preventDefault();
    const dataset = event.currentTarget;
    // console.log('alienrpgActorSheet -> _inlineedit -> dataset', dataset);
    let itemId = dataset.parentElement.dataset.itemId;
    let item = this.actor.getOwnedItem(itemId);
    let field = dataset.name;
    return item.update({ [field]: dataset.value }, {});
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    this.actor.rollAbility(this.actor, dataset);
  }

  _onRollMod(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    this.actor.rollAbilityMod(this.actor, dataset);
  }

  _onRollItemMod(event) {
    event.preventDefault();
    const itemId = $(event.currentTarget).parents('.item').attr('data-item-id');
    const item = this.actor.getOwnedItem(itemId);
    this.actor.rollItemMod(item);
  }
  _rollItem(event) {
    event.preventDefault();
    const itemId = $(event.currentTarget).parents('.item').attr('data-item-id');
    const item = this.actor.getOwnedItem(itemId);
    this.actor.nowRollItem(item);
  }

  _activate(event) {
    event.preventDefault();
    const dataset = event.currentTarget;
    let itemId = dataset.parentElement.dataset.itemId;
    // const atoken = this.actor.getActiveTokens(true)[0].id;
    // console.log('🚀 ~ file: actor-sheet.js ~ line 385 ~ alienrpgActorSheet ~ _rollItem ~ atoken', atoken);
    // atoken.refresh();

    let item = this.actor.getOwnedItem(itemId);

    return item.update({ 'data.header.active': true }, {});
  }
  _deactivate(event) {
    event.preventDefault();
    const dataset = event.currentTarget;
    let itemId = dataset.parentElement.dataset.itemId;
    // const atoken = this.actor.getActiveTokens(true)[0].id;
    // atoken.refresh();

    let item = this.actor.getOwnedItem(itemId);

    return item.update({ 'data.header.active': false }, {});
  }

  _plusMinusButton(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    // console.warn('alienrpgActorSheet -> _minusButton -> elemdatasetent', dataset);
    this.actor.stressChange(this.actor, dataset);
  }

  _stuntBtn(event) {
    event.preventDefault();
    let li = $(event.currentTarget).parents('.grid-container');
    let li2 = li.children('#panel');
    let item = '';
    let str = '';
    let chatData = '';
    let temp2 = '';
    let temp3 = '';
    const dataset = event.currentTarget.dataset;
    let langItem = dataset.pmbut;
    let langStr = langItem;

    var newLangStr = langStr.replace(/\s+/g, '');
    let langTemp = 'ALIENRPG.' + [newLangStr];
    temp3 = game.i18n.localize(langTemp);

    try {
      item = game.items.getName(dataset.pmbut);
      str = item.name;
      temp2 = item.data.data.description;
      if (temp2 != null || temp2.length) {
        chatData = item.data.data.description;
      }
      if (temp3.startsWith('<ol>') && chatData.startsWith('<h2>No Stunts Entered</h2>')) {
        chatData = temp3;
      }
    } catch {
      if (temp3.startsWith('<ol>')) {
        chatData = temp3;
      } else {
        chatData = '<h2>No Stunts Entered</h2>';
      }
    }

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
    let item = '';
    let str = '';
    let temp1 = '';
    let temp2 = '';
    let temp3 = '';
    let chatData = '';
    const dataset = event.currentTarget.dataset;

    item = this.actor.getOwnedItem(dataset.pmbut);
    str = item.name;
    temp2 = item.data.data.general.comment.value;
    if (temp2 != null && temp2.length > 0) {
      chatData = item.data.data.general.comment.value;
    } else {
      // item = dataset.pmbut;
      // str = item;
      var newStr = str.replace(/\s+/g, '');
      temp1 = 'ALIENRPG.' + [newStr];
      temp3 = game.i18n.localize(temp1);
      if (temp3.startsWith('<p>')) {
        chatData = temp3;
      } else {
        chatData = '<p style="font-size: xx-large;">👾</p>';
      }
    }

    // let chatData = item.data.data.general.comment.value;
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
    this.actor.checkMarks(this.actor, event);
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
    const consUme = dataset.spbutt.toLowerCase();
    let mItems = this.actor.items;
    let numbers = [];
    let temp = [];
    for (let index = 0; index < mItems.entries.length; index++) {
      let spanner = mItems.entries[index].data;
      if (spanner.totalAir || spanner.totalFood || spanner.totalWat || spanner.totalPower) {
        switch (spanner.type) {
          case 'item':
            temp = [
              {
                name: spanner.name,
                item: spanner._id,
                food: spanner.data.attributes.food.value,
                water: spanner.data.attributes.water.value,
                power: spanner.data.attributes.power.value,
              },
            ];
            numbers.push(temp);
            break;
          case 'armor':
            temp = [
              {
                name: spanner.name,
                item: spanner._id,
                air: spanner.data.attributes.airsupply.value,
              },
            ];
            numbers.push(temp);
            break;
          case 'weapon':
            temp = [
              {
                name: spanner.name,
                item: spanner._id,
                power: spanner.data.attributes.power.value,
              },
            ];
            numbers.push(temp);
            break;

          default:
            break;
        }
      }
    }
    this.actor.consumablesCheck(this.actor, consUme, label, numbers);
  }
}
export default alienrpgActorSheet;
