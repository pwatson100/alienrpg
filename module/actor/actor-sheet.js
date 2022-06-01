import { yze } from '../YZEDiceRoller.js';
import { toNumber } from '../utils.js';
import { ALIENRPG } from '../config.js';
import { alienrpgrTableGet } from './rollTableData.js';
import { logger } from '../logger.js';

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
      planetsystem: new Set(),
    };
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['alienrpg', 'sheet', 'actor', 'actor-sheet'],
      // template: 'systems/alienrpg/templates/actor/actor-sheet.html',
      width: 800,
      height: 900 - 'min-content',
      // height: 900,
      // Creature sheet size
      //       width: 750,
      //       height: 650,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'general' }],
    });
  }
  get template() {
    const path = 'systems/alienrpg/templates/actor/';
    // return `${path}actor-sheet.html`;
    // unique item sheet by type, like `weapon-sheet.html`.
    if (game.settings.get('alienrpg', 'aliencrt')) {
      return `systems/alienrpg/templates/actor/crt/${this.actor.data.type}-sheet.html`;
    } else {
      return `${path}${this.actor.data.type}-sheet.html`;
    }
  }

  /* -------------------------------------------- */

  /** @override */
  async getData(options) {
    // Basic data
    const isOwner = this.document.isOwner;
    const data = {
      actor: this.object,
      owner: this.object.isOwner,
      limited: this.object.limited,
      options: this.options,
      editable: this.isEditable,
      cssClass: isOwner ? 'editable' : 'locked',
      isCharacter: this.object.data.type === 'character',
      isEnc: this.object.data.type === 'character' || this.object.data.type === 'synthetic',
      // isEnc: false,
      isSynthetic: this.object.data.type === 'synthetic',
      isVehicles: this.object.data.type === 'vehicles',
      isCreature: this.object.data.type === 'creature',
      isNPC: this.object.data.data.header.npc,
      isGM: game.user.isGM,
      config: CONFIG.ALIENRPG,
    };

    // The Actor and its Items
    data.actor = foundry.utils.deepClone(this.actor.data);

    data.items = this.actor.items.map((i) => {
      i.data.labels = i.labels;
      return i.data;
    });
    data.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    data.data = data.actor.data;
    data.labels = this.actor.labels || {};
    data.filters = this._filters;

    switch (this.actor.data.type) {
      case 'character':
        data.actor.data.general.radiation.icon = this._getClickIcon(data.actor.data.general.radiation.value, 'radiation');
        data.actor.data.general.xp.icon = this._getClickIcon(data.actor.data.general.xp.value, 'xp');
        data.actor.data.general.sp.icon = this._getClickIcon(data.actor.data.general.sp.value, 'sp');
        data.actor.data.general.starving.icon = this._getContitionIcon(data.actor.data.general.starving.value, 'starving');
        data.actor.data.general.dehydrated.icon = this._getContitionIcon(data.actor.data.general.dehydrated.value, 'dehydrated');
        data.actor.data.general.exhausted.icon = this._getContitionIcon(data.actor.data.general.exhausted.value, 'exhausted');
        data.actor.data.general.freezing.icon = this._getContitionIcon(data.actor.data.general.freezing.value, 'freezing');
        data.actor.data.general.panic.icon = this._getContitionIcon(data.actor.data.general.panic.value, 'panic');
        // Prepare items.
        await this._prepareItems(data); // Return data to the sheet
        break;

      case 'creature':
        data.rTables = alienrpgrTableGet.rTableget();
        data.cTables = alienrpgrTableGet.cTableget();
        await this._prepareCreatureItems(data); // Return data to the sheet

        break;

      case 'synthetic':
        data.actor.data.general.radiation.icon = this._getClickIcon(data.actor.data.general.radiation.value, 'radiation');
        data.actor.data.general.xp.icon = this._getClickIcon(data.actor.data.general.xp.value, 'xp');
        data.actor.data.general.sp.icon = this._getClickIcon(data.actor.data.general.sp.value, 'sp');
        // Prepare items.
        await this._prepareItems(data); // Return data to the sheet
        break;
      case 'territory':
        // Prepare items.
        await this._prepareTerritoryItems(data); // Return data to the sheet
        break;

      case 'vehicles':
        // Return data to the sheet
        await this._prepareVehicleItems(data); // Return data to the sheet
        await this._prepareCrew(data); // Return data to the sheet

        break;

      default:
        break;
    }
    logger.debug('Actor Sheet derived data:', data);

    //Return data to the sheet
    return data;
  }

  _findActiveList() {
    return this.element.find('.tab.active .directory-list');
  }

  async _prepareTerritoryItems(data) {
    const systems = [];
    // Iterate through items, allocating to containers
    // let totalWeight = 0;
    for (let i of data.items) {
      let item = i.data;
      // Append to gear.
      if (i.type === 'planet-system') {
        systems.push(i);
      }
    }

    // Assign and return
    data.systems = systems;
  }

  /*
   * Organize and classify Owned Items for Character sheets
   * @private
   */
  async _prepareItems(data) {
    // Initialize containers.
    const inventory = {
      weapon: { section: 'Weapons', label: game.i18n.localize('ALIENRPG.InventoryWeaponsHeader'), items: [], dataset: { type: 'weapon' } },
      item: { section: 'Items', label: game.i18n.localize('ALIENRPG.InventoryItemsHeader'), items: [], dataset: { type: 'item' } },
      armor: { section: 'Armor', label: game.i18n.localize('ALIENRPG.InventoryArmorHeader'), items: [], dataset: { type: 'armor' } },
    };
    // Partition items by category
    let [items, Weapons, Armor] = data.items.reduce(
      (arr, item) => {
        // Item details
        item.img = item.img || DEFAULT_TOKEN;
        item.isStack = item.data.quantity ? item.data.quantity > 1 : false;

        // Classify items into types
        if (item.type === 'Weapons') arr[1].push(item);
        else if (item.type === 'Armor') arr[2].push(item);
        else if (Object.keys(inventory).includes(item.type)) arr[0].push(item);
        return arr;
      },
      [[], [], []]
    );

    // Apply active item filters
    items = this._filterItems(items, this._filters.inventory);

    const talents = [];
    const agendas = [];
    const specialities = [];
    const critInj = [];

    let totalWeight = 0;

    // Iterate through items, allocating to containers
    for (let i of data.items) {
      let item = i.data;
      switch (i.type) {
        case 'talent':
          talents.push(i);
          break;

        case 'agenda':
          agendas.push(i);
          break;

        case 'specialty':
          if (specialities.length > 1) {
            break;
          } else {
            specialities.push(i);
            break;
          }
        case 'critical-injury':
          critInj.push(i);
          break;

        case 'armor':
          if (item.header.active != 'fLocker') {
            i.data.attributes.weight.value = i.data.attributes.weight.value || 0;
            i.totalWeight = i.data.attributes.weight.value;
            totalWeight += i.totalWeight;
          }
          inventory[i.type].items.push(i);
          break;

        case 'weapon':
          if (item.header.active != 'fLocker') {
            let ammoweight = 0.25;
            if (i.data.attributes.class.value == 'RPG' || i.name.includes(' RPG ') || i.name.startsWith('RPG') || i.name.endsWith('RPG')) {
              ammoweight = 0.5;
            }
            i.data.attributes.weight.value = i.data.attributes.weight.value || 0;
            // i.totalWeight = i.data.attributes.weight.value + i.data.attributes.rounds.value * ammoweight;
            i.totalWeight = (i.data.attributes.weight.value + i.data.attributes.rounds.value * ammoweight) * i.data.attributes.quantity.value;
            totalWeight += i.totalWeight;
          }
          inventory[i.type].items.push(i);

          break;

        default:
          // Its just an item
          if (item.header.active != 'fLocker') {
            i.data.attributes.weight.value = i.data.attributes.weight.value || 0;
            i.totalWeight = i.data.attributes.weight.value * i.data.attributes.quantity.value;
            totalWeight += i.totalWeight;
          }
          inventory[i.type].items.push(i);
          break;
      }
    }
    // Assign and return
    data.talents = talents;
    data.agendas = agendas;
    data.specialities = specialities;
    data.critInj = critInj;
    data.data.general.encumbrance = await this._computeEncumbrance(totalWeight, data);
    data.inventory = Object.values(inventory);
  }
  async _prepareCreatureItems(data) {
    const critInj = [];

    // Iterate through items, allocating to containers
    for (let i of data.items) {
      critInj.push(i);
      data.critInj = critInj;
    }
  }
  /*
   * Organize and classify Owned Items for Character sheets
   * @private
   */
  async _prepareVehicleItems(data) {
    // Initialize containers.
    const inventory = {
      weapon: { section: 'Weapons', label: game.i18n.localize('ALIENRPG.InventoryWeaponsHeader'), items: [], dataset: { type: 'weapon' } },
      item: { section: 'Items', label: game.i18n.localize('ALIENRPG.InventoryItemsHeader'), items: [], dataset: { type: 'item' } },
      armor: { section: 'Armor', label: game.i18n.localize('ALIENRPG.InventoryArmorHeader'), items: [], dataset: { type: 'armor' } },
    };
    // Partition items by category
    let [items, Weapons, Armor] = data.items.reduce(
      (arr, item) => {
        // Item details
        item.img = item.img || DEFAULT_TOKEN;
        item.isStack = item.data.quantity ? item.data.quantity > 1 : false;

        // Classify items into types
        if (item.type === 'Weapons') arr[1].push(item);
        else if (item.type === 'Armor') arr[2].push(item);
        else if (Object.keys(inventory).includes(item.type)) arr[0].push(item);
        return arr;
      },
      [[], [], []]
    );

    // Apply active item filters
    items = this._filterItems(items, this._filters.inventory);
    const talents = [];
    const agendas = [];
    const specialities = [];
    const critInj = [];

    // Iterate through items, allocating to containers
    for (let i of data.items) {
      let item = i.data;
      switch (i.type) {
        case 'talent':
          talents.push(i);
          break;

        case 'agenda':
          agendas.push(i);
          break;

        case 'specialty':
          if (specialities.length > 1) {
            break;
          } else {
            specialities.push(i);
            break;
          }
        case 'critical-injury':
          critInj.push(i);
          break;

        case 'armor':
          inventory[i.type].items.push(i);
          break;

        case 'weapon':
          if (item.header.active != 'fLocker') {
          }
          inventory[i.type].items.push(i);

          break;

        default:
          // Its just an item
          if (item.header.active != 'fLocker') {
          }
          inventory[i.type].items.push(i);
          break;
      }
    }

    data.inventory = Object.values(inventory);
  }

  async _prepareCrew(sheetData) {
    sheetData.actor.data.crew.occupants = sheetData.data.crew.occupants.reduce((arr, o) => {
      o.actor = game.actors.get(o.id);
      // Creates a fake actor if it doesn't exist anymore in the database.
      if (!o.actor) {
        o.actor = {
          name: '{MISSING_CREW}',
          data: { data: { health: { value: 0, max: 0 } } },
          isCrewDeleted: true,
        };
      }
      arr.push(o);
      return arr;
    }, []);
    sheetData.actor.data.crew.occupants.sort((o1, o2) => {
      const pos1 = ALIENRPG.vehicle.crewPositionFlags.indexOf(o1.position);
      const pos2 = ALIENRPG.vehicle.crewPositionFlags.indexOf(o2.position);
      if (pos1 < pos2) return -1;
      if (pos1 > pos2) return 1;
      // If they are at the same position, sort by their actor's names.
      if (o1.actor.name < o2.actor.name) return -1;
      if (o1.actor.name > o2.actor.name) return 1;
      return 0;
    });
    return sheetData;
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
  async _computeEncumbrance(totalWeight, actorData) {
    // Compute Encumbrance percentage
    const enc = {
      max: actorData.data.attributes.str.value * 4,
      value: Math.round(totalWeight * 100) / 100,
      value: totalWeight,
    };
    enc.pct = Math.min((enc.value * 100) / enc.max, 99);
    enc.encumbered = enc.pct > 50;
    for (let i of actorData.talents) {
      if (i.name.toUpperCase() === 'PACK MULE') {
        enc.encumbered = enc.pct > 75;
      }
    }
    let aTokens = '';
    if (enc.encumbered) {
      await this.actor.addCondition('encumbered');
    } else {
      await this.actor.removeCondition('encumbered');
    }
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
        name: game.i18n.localize('ALIENRPG.addToFLocker'),
        // icon: '<i class="fas fa-archive"></i>"></fas>',
        icon: '<i class="fas fa-archive"></i>',
        callback: (element) => {
          let item = this.actor.items.get(element.data('item-id'));
          item.update({ 'data.header.active': 'fLocker' });
        },
      },
      {
        name: game.i18n.localize('ALIENRPG.moveFromFlocker'),
        // icon: '<i class="fas fa-archive"></i>"></fas>',
        icon: '<i class="fas fa-archive"></i>',
        callback: (element) => {
          let item = this.actor.items.get(element.data('item-id'));
          item.update({ 'data.header.active': false });
        },
      },
      {
        name: game.i18n.localize('ALIENRPG.EditItemTitle'),
        icon: '<i class="fas fa-edit"></i>',
        callback: (element) => {
          const item = this.actor.items.get(element.data('item-id'));
          item.sheet.render(true);
        },
      },
      {
        name: game.i18n.localize('ALIENRPG.DeleteItem'),
        icon: '<i class="fas fa-trash"></i>',
        callback: (element) => {
          // this.actor.deleteOwnedItem(element.data('item-id'));
          let itemDel = this.actor.items.get(element.data('item-id'));
          itemDel.delete();
        },
      },
    ];

    // Add Inventory Item
    new ContextMenu(html, '.item-edit', itemContextMenu);

    const itemContextMenu1 = [
      {
        name: game.i18n.localize('ALIENRPG.EditItemTitle'),
        icon: '<i class="fas fa-edit"></i>',
        callback: (element) => {
          const item = this.actor.items.get(element.data('item-id'));
          item.sheet.render(true);
        },
      },
      {
        name: game.i18n.localize('ALIENRPG.DeleteItem'),
        icon: '<i class="fas fa-trash"></i>',
        callback: (element) => {
          // this.actor.deleteOwnedItem(element.data('item-id'));
          let itemDel = this.actor.items.get(element.data('item-id'));
          itemDel.delete();
        },
      },
    ];

    // Add Inventory Item
    new ContextMenu(html, '.item-edit1', itemContextMenu1);

    html.find('.item-create').click(this._onItemCreate.bind(this));
    // Update Inventory Item
    html.find('.openItem').click((ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });

    // Update Inventory Item
    html.find('.item-edit').click((ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });

    html.find('.item-edit1').click((ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });

    if (game.settings.get('alienrpg', 'switchMouseKeys')) {
      // Right to Roll and left to mod
      // Rollable abilities.
      html.find('.rollable').contextmenu(this._onRoll.bind(this));

      html.find('.rollable').click(this._onRollMod.bind(this));

      html.find('.rollableVeh').contextmenu(this._onRoll.bind(this));

      html.find('.rollableVeh').click(this._onRollMod.bind(this));

      // Rollable Items.
      html.find('.rollItem').contextmenu(this._rollItem.bind(this));

      html.find('.rollItem').click(this._onRollItemMod.bind(this));
    } else {
      // Left to Roll and Right toMod
      // Rollable abilities.
      html.find('.rollable').click(this._onRoll.bind(this));

      html.find('.rollable').contextmenu(this._onRollMod.bind(this));

      html.find('.rollableVeh').click(this._onRoll.bind(this));

      html.find('.rollableVeh').contextmenu(this._onRollMod.bind(this));

      // Rollable Items.
      html.find('.rollItem').click(this._rollItem.bind(this));

      html.find('.rollItem').contextmenu(this._onRollItemMod.bind(this));
    }

    html.find('.currency').on('change', this._currencyField.bind(this));
    // minus from health and stress
    html.find('.minus-btn').click(this._plusMinusButton.bind(this));

    // plus tohealth and stress
    html.find('.plus-btn').click(this._plusMinusButton.bind(this));

    html.find('.click-stat-level').on('click contextmenu', this._onClickStatLevel.bind(this)); // Toggle for radio buttons
    html.find('.click-stat-level-con').on('click contextmenu', this._onClickStatLevelCon.bind(this)); // Toggle for radio buttons

    html.find('.supply-btn').click(this._supplyRoll.bind(this));

    html.find('.pwr-btn').click(this._supplyRoll.bind(this));

    html.find('.stunt-btn').click(this._stuntBtn.bind(this));

    html.find('.talent-btn').click(this._talentBtn.bind(this));

    html.find('.inline-edit').change(this._inlineedit.bind(this));

    html.find('.rollCrit').click(this._rollCrit.bind(this));
    html.find('.rollCrit').contextmenu(this._rollCritMan.bind(this));

    html.find('.activate').click(this._activate.bind(this));
    html.find('.activate').contextmenu(this._deactivate.bind(this));

    html.find('.overwatch-toggle').click(this._onOverwatchToggle.bind(this));

    // Creature sheet
    html.find('.creature-attack-roll').click(this._creatureAttackRoll.bind(this));
    html.find('.creature-attack-roll').contextmenu(this._creatureManAttackRoll.bind(this));

    html.find('.creature-acid-roll').click(this._creatureAcidRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
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

    html.find('.crew-edit').click(this._onCrewEdit.bind(this));
    html.find('.crew-remove').click(this._onCrewRemove.bind(this));
    html.find('.crew-position').change(this._onChangePosition.bind(this));
  }
  /** @override */
  async _onDropItemCreate(itemData) {
    const type = itemData.type;
    const alwaysAllowedItems = ALIENRPG.physicalItems;
    const allowedItems = {
      character: ['item', 'weapon', 'armor', 'talent', 'agenda', 'specialty', 'critical-injury'],
      synthetic: ['item', 'weapon', 'armor', 'talent', 'agenda', 'specialty', 'critical-injury'],
      creature: ['critical-injury'],
      vehicles: ['item', 'weapon'],
      territory: ['planet-system'],
    };
    let allowed = true;

    // if (this.actor.type === 'creature') {
    //   allowed = false;
    // } else

    if (!alwaysAllowedItems.includes(type)) {
      if (!allowedItems[this.actor.type].includes(type)) {
        allowed = false;
      }
    }

    if (!allowed) {
      const msg = game.i18n.format('ALIENRPG.NotifWrongItemType', {
        type: type,
        actor: this.actor.type,
      });
      console.warn(`Alien RPG | ${msg}`);
      ui.notifications.warn(msg);
      return false;
    }
    return super._onDropItemCreate(itemData);
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
    const iName = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: iName,
      type: type,
      data: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data['type'];

    // Finally, create the item!
    // return this.actor.createOwnedItem(itemData);
    return this.actor.createEmbeddedDocuments(itemData);
  }

  _inlineedit(event) {
    event.preventDefault();
    const dataset = event.currentTarget;
    // console.log('alienrpgActorSheet -> _inlineedit -> dataset', dataset);
    let itemId = dataset.parentElement.dataset.itemId;
    let item = this.actor.items.get(itemId);
    let temp = dataset.dataset.mod;
    // let field = temp.slice(5);
    return item.update({ [temp]: dataset.value }, {});
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
    const element = event.currentTarget;
    const dataset = element.dataset;
    const itemId = $(event.currentTarget).parents('.item').attr('data-item-id');
    const item = this.actor.items.get(itemId);
    if (item.type === 'armor') {
      dataset.roll = this.actor.data.data.general.armor.value;
      dataset.mod = 0;
      dataset.spbutt = 'armor';
      this.actor.rollAbilityMod(this.actor, dataset);
    } else {
      this.actor.rollItemMod(item);
    }
  }
  _rollItem(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    const itemId = $(event.currentTarget).parents('.item').attr('data-item-id');
    const item = this.actor.items.get(itemId);
    if (item.type === 'armor') {
      dataset.roll = this.actor.data.data.general.armor.value;
      dataset.mod = 0;
      dataset.spbutt = 'armor';
      this.actor.rollAbility(this.actor, dataset);
    } else {
      this.actor.nowRollItem(item);
    }
  }
  _rollCrit(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    this.actor.rollCrit(this.actor, this.actor.type, dataset);
  }
  _rollCritMan(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    this.actor.rollCritMan(this.actor, this.actor.type, dataset);
  }

  _activate(event) {
    event.preventDefault();
    const dataset = event.currentTarget;
    let itemId = dataset.parentElement.dataset.itemId;
    let item = this.actor.items.get(itemId);
    item.update({ 'data.header.active': true });
  }
  _deactivate(event) {
    event.preventDefault();
    const dataset = event.currentTarget;
    let itemId = dataset.parentElement.dataset.itemId;
    let item = this.actor.items.get(itemId);
    item.update({ 'data.header.active': false });
  }

  _plusMinusButton(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
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

    item = this.actor.items.get(dataset.pmbut);
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
  _onClickStatLevelCon(event) {
    event.preventDefault();
    this.actor.conCheckMarks(this.actor, event);
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
    // If it's a power roll it will have an item number so test if it's zero
    if (dataset.item === '0') return;
    const lTemp = 'ALIENRPG.' + dataset.spbutt;
    // If this is a power roll get the exact id of the item to process
    const tItem = dataset.id || 0;
    const label = game.i18n.localize(lTemp) + ' ' + game.i18n.localize('ALIENRPG.Supply');
    const consUme = dataset.spbutt.toLowerCase();
    this.actor.consumablesCheck(this.actor, consUme, label, tItem);
  }

  _currencyField(event) {
    event.preventDefault();
    const element = event.currentTarget;
    // format initial value
    onBlur({ target: event.currentTarget });

    function localStringToNumber(s) {
      return Number(String(s).replace(/[^0-9.-]+/g, ''));
    }
    function onBlur(e) {
      let value = localStringToNumber(e.target.value);
      e.target.value = value ? Intl.NumberFormat('en-EN', { style: 'currency', currency: 'USD' }).format(value) : '';
    }
  }
  async _onOverwatchToggle(event) {
    let key = $(event.currentTarget).parents('.condition').attr('data-key');
    if (await this.actor.hasCondition(key)) await this.actor.removeCondition(key);
    else await this.actor.addCondition(key);
  }

  _creatureAcidRoll(event) {
    event.preventDefault();
    // const element = event.currentTarget;
    const dataset = event.currentTarget.dataset;
    this.actor.creatureAcidRoll(this.actor, dataset);
  }

  _creatureAttackRoll(event) {
    event.preventDefault();
    // const element = event.currentTarget;
    const dataset = event.currentTarget.dataset;
    this.actor.creatureAttackRoll(this.actor, dataset);
  }

  _creatureManAttackRoll(event) {
    event.preventDefault();
    // const element = event.currentTarget;
    const dataset = event.currentTarget.dataset;
    this.actor.creatureManAttackRoll(this.actor, dataset);
  }

  _dropCrew(actorId) {
    const crew = game.actors.get(actorId);
    const actorData = this.actor;
    if (!crew) return;
    if (crew.type === 'vehicles') return ui.notifications.info('Vehicle inceptions are not allowed!');
    if (crew.type !== 'character' && crew.type !== 'synthetic') return;
    if (actorData.data.data.crew.passengerQty >= actorData.data.data.attributes.passengers.value) {
      return ui.notifications.warn(game.i18n.localize('ALIENRPG.fullCrew'));
    }
    let crewNumber = actorData.data.data.crew.passengerQty;
    crewNumber++;
    actorData.update({ 'data.crew.passengerQty': crewNumber });
    return this.actor.addVehicleOccupant(actorId);
  }
  _onCrewEdit(event) {
    event.preventDefault();
    const elem = event.currentTarget;
    const crewId = elem.closest('.occupant').dataset.crewId;
    const actor = game.actors.get(crewId);
    return actor.sheet.render(true);
  }

  _onCrewRemove(event) {
    event.preventDefault();
    const actorData = this.actor;
    const elem = event.currentTarget;
    const crewId = elem.closest('.occupant').dataset.crewId;
    const occupants = this.actor.removeVehicleOccupant(crewId);
    let crewNumber = actorData.data.data.crew.passengerQty;
    crewNumber--;
    actorData.update({ 'data.crew.passengerQty': crewNumber });
    return this.actor.update({ 'data.crew.occupants': occupants });
  }

  _onChangePosition(event) {
    event.preventDefault();
    const elem = event.currentTarget;
    const crewId = elem.closest('.occupant').dataset.crewId;
    const position = elem.value;
    return this.actor.addVehicleOccupant(crewId, position);
  }
}
export default alienrpgActorSheet;
