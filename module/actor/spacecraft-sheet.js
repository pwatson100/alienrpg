import { yze } from '../YZEDiceRoller.js';
import { toNumber } from '../utils.js';
import { ALIENRPG } from '../config.js';
import { alienrpgrTableGet } from './rollTableData.js';
import { logger } from '../logger.js';
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class alienrpgSpacecraftSheet extends ActorSheet {
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
      classes: ['alienrpg', 'sheet', 'actor', 'spacecraft-sheet'],
      // template: 'systems/alienrpg/templates/actor/actor-sheet.html',
      width: 1120,
      height: 800,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'general' }],
    });
  }

  get template() {
    const path = 'systems/alienrpg/templates/actor/';
    return `${path}spacecraft-sheet.html`;
  }



  /* -------------------------------------------- */
  async _enrichTextFields(data, fieldNameArr) {
    for (let t = 0; t < fieldNameArr.length; t++) {
      if (hasProperty(data, fieldNameArr[t])) {
        setProperty(data, fieldNameArr[t], await TextEditor.enrichHTML(getProperty(data, fieldNameArr[t]), { async: true }));
      }
    };
  }

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
      isCharacter: this.object.system.type === 'character',
      // isEnc: true,
      isVehicles: this.object.system.type === 'vehicles',
      isGM: game.user.isGM,
      config: CONFIG.ALIENRPG,
    };

    let actor = this.object;
    data.actor = actor.toJSON();

    data.actor.system.items = this.actor.items.map((i) => {
      i.label = i.label;
      return i;
    });
    data.actor.system.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    data.actor.system.label = this.actor.label || {};
    data.actor.system.filters = this._filters;

    switch (this.actor.type) {
      case 'spacecraft':
        await this._prepareVehicleItems(data);
        await this._prepareCrew(data);
        let enrichedFields = [
          "actor.system.notes",
        ];
        await this._enrichTextFields(data, enrichedFields);
        data.actor.system.attributes.damage.max = data.actor.system.attributes.hull.value;
        data.actor.system.attributes.damage.icon = this._getClickIcon(data.actor.system.attributes.damage.value, 'damage');

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
      spacecraftmods: { section: 'Spacecraft Mods', label: game.i18n.localize('ALIENRPG.MODULES-UPGRADES'), items: [], dataset: { type: 'spacecraftmods' } },
      spacecraftweapons: { section: 'Spacecraft Weapons', label: game.i18n.localize('ALIENRPG.SpacecraftWeapons'), items: [], dataset: { type: 'spacecraftweapons' } },
    };
    // Partition items by category
    let [items, Weapons, Armor, spacecraftmods, spacecraftweapons] = data.actor.system.items.reduce(
      (arr, item) => {
        // Item details
        item.img = item.img || DEFAULT_TOKEN;
        item.isStack = item.system.quantity ? item.system.quantity > 1 : false;

        // Classify items into types
        if (item.type === 'Weapons') arr[1].push(item);
        else if (item.type === 'Armor') arr[2].push(item);
        else if (item.type === 'spacecraftmods') arr[3].push(item);
        else if (item.type === 'spacecraftweapons') arr[4].push(item);
        else if (Object.keys(inventory).includes(item.type)) arr[0].push(item);
        return arr;
      },
      [[], [], [], [], []]
    );

    // Apply active item filters
    items = this._filterItems(items, this._filters.inventory);
    const critMin = [];
    const critMaj = [];

    // Iterate through items, allocating to containers
    for (let i of data.actor.system.items) {
      let item = i.system;
      switch (i.type) {
        case 'spacecraft-crit':
          switch (i.system.header.type.value) {
            case '0':
              critMin.push(i);
              break;
            case '1':
              critMaj.push(i);
              break;
          }
          break;
        case 'spacecraftmods':
          inventory[i.type].items.push(i);
          break;
        case 'spacecraftweapons':
          inventory[i.type].items.push(i);
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
    data.critMin = critMin;
    data.critMaj = critMaj;

  }


  async _prepareCrew(sheetData) {
    sheetData.crew = sheetData.actor.system.crew.occupants.reduce((arr, o) => {
      o.actor = game.actors.get(o.id);
      // Creates a fake actor if it doesn't exist anymore in the database.
      if (!o.actor) {
        o.actor = {
          name: '{MISSING_CREW}',
          system: { system: { health: { value: 0, max: 0 } } },
          isCrewDeleted: true,
        };
      }
      arr.push(o);
      return arr;
    }, []);
    sheetData.actor.system.crew.occupants.sort((o1, o2) => {
      const pos1 = ALIENRPG.spacecraft.crewPositionFlags.indexOf(o1.position);
      const pos2 = ALIENRPG.spacecraft.crewPositionFlags.indexOf(o2.position);
      if (pos1 < pos2) return -1;
      if (pos1 > pos2) return 1;
      // If they are at the same position, sort by their actor's names.
      if (o1.actor.name < o2.actor.name) return -1;
      if (o1.actor.name > o2.actor.name) return 1;
      return 0;
    });
    return sheetData;
  }

  /**
   * Determine whether an Owned Item will be shown based on the current set of filters
   * @return {boolean}
   * @private
   */
  _filterItems(items, filters) {
    return items.filter((item) => {
      const data = item.system;
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
          item.update({ 'system.header.active': 'fLocker' });
        },
      },
      {
        name: game.i18n.localize('ALIENRPG.moveFromFlocker'),
        icon: '<i class="fas fa-archive"></i>',
        callback: (element) => {
          let item = this.actor.items.get(element.data('item-id'));
          item.update({ 'system.header.active': false });
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


    // html.find('.pwr-btn').click(this._supplyRoll.bind(this));

    html.find('.inline-edit').change(this._inlineedit.bind(this));

    html.find('.rollMinorCD').click(this._rollMinorCD.bind(this));
    html.find('.rollMinorCD').contextmenu(this._rollMinorCDMan.bind(this));

    html.find('.rollMajorCD').click(this._rollMajorCD.bind(this));
    html.find('.rollMajorCD').contextmenu(this._rollMajorCDMan.bind(this));

    html.find('.activate').click(this._activate.bind(this));
    html.find('.activate').contextmenu(this._deactivate.bind(this));

    html.find('.sensorsubmit').click(this._shipPhase.bind(this));
    html.find('.pilotsubmit').click(this._shipPhase.bind(this));
    html.find('.gunnersubmit').click(this._shipPhase.bind(this));
    html.find('.engineersubmit').click(this._shipPhase.bind(this));
    html.find('.crewPanic').click(this._crewPanic.bind(this));

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
      spacecraft: ['item', 'weapon', 'armor', "spacecraft-crit", "spacecraftmods", "spacecraftweapons"],
    };
    let allowed = true;

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
      system: system,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system['type'];

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
      dataset.roll = this.actor.system.general.armor.value;
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
      dataset.roll = this.actor.system.general.armor.value;
      dataset.mod = 0;
      dataset.spbutt = 'armor';
      this.actor.rollAbility(this.actor, dataset);
    } else {
      this.actor.nowRollItem(item);
    }
  }
  _rollMinorCD(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    this.actor.rollCrit(this.actor, this.actor.type, dataset);
  }
  _rollMinorCDMan(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    this.actor.rollCrit(this.actor, this.actor.type, dataset);
  }

  _rollMajorCD(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    this.actor.rollCrit(this.actor, this.actor.type, dataset);
  }
  _rollMajorCDMan(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    this.actor.rollCrit(this.actor, this.actor.type, dataset);
  }

  _crewPanic(event) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    const panicActor = game.actors.get(dataset.crewpanic);
    this.actor.rollAbility(panicActor, dataset);
  }

  _activate(event) {
    event.preventDefault();
    const dataset = event.currentTarget;
    let itemId = dataset.parentElement.dataset.itemId;
    let item = this.actor.items.get(itemId);
    item.update({ 'system.header.active': true });
  }
  _deactivate(event) {
    event.preventDefault();
    const dataset = event.currentTarget;
    let itemId = dataset.parentElement.dataset.itemId;
    let item = this.actor.items.get(itemId);
    item.update({ 'system.header.active': false });
  }

  _plusMinusButton(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    this.actor.stressChange(this.actor, dataset);
  }

  // _stuntBtn(event) {
  //   event.preventDefault();
  //   let li = $(event.currentTarget).parents('.grid-container');
  //   let li2 = li.children('#panel');
  //   let item = '';
  //   let str = '';
  //   let chatData = '';
  //   let temp2 = '';
  //   let temp3 = '';
  //   const dataset = event.currentTarget.dataset;
  //   let langItem = dataset.pmbut;
  //   let langStr = langItem;

  //   var newLangStr = langStr.replace(/\s+/g, '');
  //   let langTemp = 'ALIENRPG.' + [newLangStr];
  //   temp3 = game.i18n.localize(langTemp);

  //   try {
  //     item = game.items.getName(dataset.pmbut);
  //     str = item.name;
  //     temp2 = item.system.description;
  //     if (temp2 != null || temp2.length) {
  //       chatData = item.system.description;
  //     }
  //     if (temp3.startsWith('<ol>') && chatData.startsWith('<h2>No Stunts Entered</h2>')) {
  //       chatData = temp3;
  //     }
  //   } catch {
  //     if (temp3.startsWith('<ol>')) {
  //       chatData = temp3;
  //     } else {
  //       chatData = '<h2>No Stunts Entered</h2>';
  //     }
  //   }

  //   let div = $(`<div class="panel Col3">${chatData}</div>`);
  //   // Toggle summary
  //   if (li2.hasClass('expanded')) {
  //     let summary = li2.children('.panel');
  //     summary.slideUp(200, () => summary.remove());
  //   } else {
  //     li2.append(div.hide());
  //     div.slideDown(200);
  //   }
  //   li2.toggleClass('expanded');
  // }

  // _talentBtn(event) {
  //   event.preventDefault();
  //   let li = $(event.currentTarget).parents('.grid-container');
  //   let li2 = li.children('#panel');
  //   let item = '';
  //   let str = '';
  //   let temp1 = '';
  //   let temp2 = '';
  //   let temp3 = '';
  //   let chatData = '';
  //   const dataset = event.currentTarget.dataset;

  //   item = this.actor.items.get(dataset.pmbut);
  //   str = item.name;
  //   temp2 = item.system.general.comment.value;
  //   if (temp2 != null && temp2.length > 0) {
  //     chatData = item.system.general.comment.value;
  //   } else {
  //     // item = dataset.pmbut;
  //     // str = item;
  //     var newStr = str.replace(/\s+/g, '');
  //     temp1 = 'ALIENRPG.' + [newStr];
  //     temp3 = game.i18n.localize(temp1);
  //     if (temp3.startsWith('<p>')) {
  //       chatData = temp3;
  //     } else {
  //       chatData = '<p style="font-size: xx-large;">👾</p>';
  //     }
  //   }

  //   let div = $(`<div class="panel Col3">${chatData}</div>`);

  //   // Toggle summary
  //   if (li2.hasClass('expanded')) {
  //     let summary = li2.children('.panel');
  //     summary.slideUp(200, () => summary.remove());
  //   } else {
  //     li2.append(div.hide());
  //     div.slideDown(200);
  //   }
  //   li2.toggleClass('expanded');
  // }

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
    const maxPoints = this.object.system.attributes[stat].max;
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
    const maxPoints = this.object.system.attributes[stat].max;
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

  // _supplyRoll(event) {
  //   event.preventDefault();
  //   const element = event.currentTarget;
  //   const dataset = element.dataset;
  //   // If it's a power roll it will have an item number so test if it's zero
  //   if (dataset.item === '0') return;
  //   const lTemp = 'ALIENRPG.' + dataset.spbutt;
  //   // If this is a power roll get the exact id of the item to process
  //   const tItem = dataset.id || 0;
  //   const label = game.i18n.localize(lTemp) + ' ' + game.i18n.localize('ALIENRPG.Supply');
  //   const consUme = dataset.spbutt.toLowerCase();
  //   this.actor.consumablesCheck(this.actor, consUme, label, tItem);
  // }

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
      if (game.settings.get('alienrpg', 'dollar'))
        e.target.value = value ? Intl.NumberFormat('en-EN', { style: 'currency', currency: 'USD' }).format(value) : '$0.00';
      else
        e.target.value = value ? Intl.NumberFormat('en-EN', { style: 'decimal', useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) : '0.00';
    }
  }

  _dropCrew(actorId) {
    const crew = game.actors.get(actorId);
    const actorData = this.actor;
    if (!crew) return;
    if (crew.type === 'vehicles' && crew.type === 'spacecraft') return ui.notifications.info('Vehicle inceptions are not allowed!');
    if (crew.type !== 'character' && crew.type !== 'synthetic') return;
    if (actorData.type === 'spacecraft') {
      if (actorData.system.crew.passengerQty >= actorData.system.attributes.crew.value) {
        return ui.notifications.warn(game.i18n.localize('ALIENRPG.fullCrew'));
      }
      return this.actor.addVehicleOccupant(actorId);
    }


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
    let crewNumber = actorData.system.crew.passengerQty;
    crewNumber--;
    actorData.update({ 'system.crew.passengerQty': crewNumber });
    return this.actor.update({ 'system.crew.occupants': occupants });
  }

  _onChangePosition(event) {
    event.preventDefault();
    const elem = event.currentTarget;
    const crewId = elem.closest('.occupant').dataset.crewId;
    const position = elem.value;
    return this.actor.addVehicleOccupant(crewId, position);
  }

  async _shipPhase(event) {
    let htmlData = '';
    event.preventDefault();
    const dataset = event.currentTarget;
    const shipName = this.actor.name;
    const actorID = this.actor.id;
    const element = dataset.previousElementSibling.selectedOptions[0].label;
    const phase = game.i18n.localize(`ALIENRPG.${dataset.previousElementSibling.name}`);

    htmlData = {
      phaseName: `${phase}`,
      actorname: `${shipName}`,
      action: `${element}`,
    };

    // Now push the correct chat message
    const html = await renderTemplate(`systems/alienrpg/templates/chat/ship-combat.html`, htmlData);

    let chatData = {
      user: game.user.id,
      speaker: {
        actor: actorID,
      },
      content: html,
      other: game.users.contents.filter((u) => u.isGM).map((u) => u.id),
      sound: CONFIG.sounds.lock,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
    };

    ChatMessage.applyRollMode(chatData, game.settings.get('core', 'rollMode'));
    return ChatMessage.create(chatData);

  }


}
export default alienrpgSpacecraftSheet;
