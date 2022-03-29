import { yze } from '../YZEDiceRoller.js';
import { ALIENRPG } from '../config.js';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class ActorSheetAlienRPGVehicle extends ActorSheet {
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
      classes: ['alienrpg', 'sheet', 'actor', 'vehicles-sheet'],
      // template: 'systems/alienrpg/templates/actor/vehicles-sheet.html',
      width: 815,
      height: 600,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'general' }],
    });
  }

  get template() {
    const path = 'systems/alienrpg/templates/actor/';
    return `${path}vehicles-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // const data = super.getData();
    // Basic data
    let isOwner = this.document.isOwner;
    const data = {
      isOwner: this.document.isOwner,
      limited: this.document.limited,
      options: this.options,
      editable: this.isEditable,
      cssClass: isOwner ? 'editable' : 'locked',
      isCharacter: this.document.data.type === 'character',
      isSynthetic: this.document.data.type === 'synthetic',
      isVehicles: this.document.data.type === 'vehicles',
      isCreature: this.document.data.type === 'creature',
      isNPC: this.document.data.data.header.npc,
      isGM: game.user.isGM,
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

    // Return data to the sheet
    this._prepareItems(data); // Return data to the sheet
    this._prepareCrew(data); // Return data to the sheet

    return data;
  }

  _prepareCrew(sheetData) {
    sheetData.crew = sheetData.data.crew.occupants.reduce((arr, o) => {
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
    sheetData.crew.sort((o1, o2) => {
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
   * Organize and classify Owned Items for Character sheets
   * @private
   */
  _prepareItems(data) {
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

  _findActiveList() {
    return this.element.find('.tab.active .directory-list');
  }
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
        icon: '<i class="fas fa-archive"></i>',
        callback: (element) => {
          let item = this.actor.items.get(element.data('item-id'));
          item.update({ 'data.header.active': 'fLocker' });
        },
      },
      {
        name: game.i18n.localize('ALIENRPG.moveFromFlocker'),
        icon: '<i class="fas fa-archive"></i>',
        callback: (element) => {
          let item = this.actor.items.get(element.data('item-id'));
          item.update({ 'data.header.active': true });
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
          let itemDel = this.actor.items.get(element.data('item-id'));
          itemDel.delete();
        },
      },
    ];

    // Add Inventory Item
    new ContextMenu(html, '.item-edit1', itemContextMenu1);

    // Update Inventory Item
    html.find('.item-edit').click((ev) => {
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
    } else {
      // Left to Roll and Right toMod
      // Rollable abilities.
      html.find('.rollable').click(this._onRoll.bind(this));

      html.find('.rollable').contextmenu(this._onRollMod.bind(this));

      html.find('.rollableVeh').click(this._onRoll.bind(this));

      html.find('.rollableVeh').contextmenu(this._onRollMod.bind(this));

      // Rollable Items.
      html.find('.rollItem').click(this._rollItem.bind(this));
    }

    html.find('.inline-edit').change(this._inlineedit.bind(this));

    // Roll handlers, click handlers, etc. would go here.
    html.find('.currency').on('change', this._currencyField.bind(this));

    html.find('.activate').click(this._activate.bind(this));
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
      vehicles: ['item', 'weapon', 'armor'],
      territory: ['planet-system'],
    };
    let allowed = true;

    if (this.actor.type === 'creature') {
      allowed = false;
    } else if (!alwaysAllowedItems.includes(type)) {
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
    return this.actor.createEmbeddedDocuments(itemData);
    return this.actor.createOwnedItem(itemData);
  }

  _inlineedit(event) {
    event.preventDefault();
    const dataset = event.currentTarget;
    let itemId = dataset.parentElement.dataset.itemId;
    let item = this.actor.items.get(itemId);
    let temp = dataset.dataset.mod;
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

  _rollItem(event) {
    event.preventDefault();
    const itemId = $(event.currentTarget).parents('.item').attr('data-item-id');
    const item = this.actor.items.get(itemId);
    this.actor.nowRollItem(item);
  }

  _onRollItemMod(event) {
    event.preventDefault();
    const itemId = $(event.currentTarget).parents('.item').attr('data-item-id');
    const item = this.actor.items.get(itemId);
    this.actor.rollItemMod(item);
  }

  _activate(event) {
    event.preventDefault();
    const dataset = event.currentTarget;
    let itemId = dataset.parentElement.dataset.itemId;
    let item = this.actor.items.get(itemId);

    return item.update({ 'data.header.active': true }, {});
  }
  _deactivate(event) {
    event.preventDefault();
    const dataset = event.currentTarget;
    let itemId = dataset.parentElement.dataset.itemId;
    let item = this.actor.items.get(itemId);

    return item.update({ 'data.header.active': false }, {});
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
      let value = e.target.value;
      e.target.value = value ? Intl.NumberFormat('en-EN', { style: 'currency', currency: 'USD' }).format(value) : '';
    }
  }

  _dropCrew(actorId) {
    const crew = game.actors.get(actorId);
    const actorData = this.actor;
    if (!crew) return;
    if (crew.type === 'vehicles') return ui.notifications.info('Vehicle inceptions are not allowed!');
    if (crew.type !== 'character' && crew.type !== 'synthetic') return;
    if (actorData.data.data.crew.passengerQty >= actorData.data.data.attributes.passengers.value) {
      return ui.notifications.info(game.i18n.localize('ALIENRPG.fullCrew'));
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
export default ActorSheetAlienRPGVehicle;
