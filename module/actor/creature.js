import { yze } from '../YZEDiceRoller.js';
import { alienrpgrTableGet } from './rollTableData.js';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class ActorSheetAlienRPGCreat extends ActorSheet {
  constructor(...args) {
    super(...args);
    // console.warn('Creature.js - Got here');
    /**
     * Track the set of item filters which are applied
     * @type {Set}
     */
    this._filters = {
      inventory: new Set(),
      // spellbook: new Set(),
      // features: new Set()
    };
  }

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['alienrpg', 'sheet', 'actor', 'creature-sheet'],
      // template: 'systems/alienrpg/templates/actor/creature-sheet.html',
      width: 600,
      height: 600,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'general' }],
    });
  }

  get template() {
    const path = 'systems/alienrpg/templates/actor/';
    return `${path}creature-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // const data = super.getData();
    // Basic data
    let isOwner = this.entity.owner;
    const data = {
      owner: isOwner,
      limited: this.entity.limited,
      options: this.options,
      editable: this.isEditable,
      cssClass: isOwner ? 'editable' : 'locked',
      isCharacter: this.entity.data.type === 'character',
      isVehicles: this.entity.data.type === 'vehicles',
      isCreature: this.entity.data.type === 'creature',
      // isNPC: this.entity.data.type === 'creature',
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

    data.rTables = alienrpgrTableGet.rTableget();

    for (let [a, abl] of Object.entries(data.actor.data.general)) {
      abl.label = CONFIG.ALIENRPG.general[a];
    }

    return data;
  }

  _findActiveList() {
    return this.element.find('.tab.active .directory-list');
  }
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

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    html.find('.rollable').contextmenu(this._onRollMod.bind(this));

    // plus tohealth and stress
    html.find('.creature-attack-roll').click(this._creatureAttackRoll.bind(this));
    // Rollable abilities.

    html.find('.creature-acid-roll').click(this._creatureAcidRoll.bind(this));

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
    // console.warn('OnRoll', element, dataset, label);
    if (dataset.roll != '-') {
      let r1Data = parseInt(dataset.roll || 0);
      let r2Data = 0;
      let reRoll = false;
      let hostile = this.actor.type;
      let blind = true;
      if (dataset.spbutt === 'armor' && r1Data < 1) {
        return;
      } else if (dataset.spbutt === 'armor') {
        label = 'Armor';
        r2Data = 0;
      }
      if (this.actor.data.token.disposition === -1) {
        blind = true;
        reRoll = true;
      }
      yze.yzeRoll(hostile, blind, reRoll, label, r1Data, 'Black', r2Data, 'Stress');
      // console.warn('onRoll', game.alienrpg.rollArr);
    } else {
      // Roll against the panic table and push the roll to the chat log.
      let chatMessage = '';
      chatMessage += '<h2>No Skill</h2>';
      chatMessage += `<h4><i>This Creature does not have this Skill</i></h4>`;
      // chatMessage += `${customResults.results[0].text}`;
      ChatMessage.create({ user: game.user._id, content: chatMessage, whisper: game.users.entities.filter((u) => u.isGM).map((u) => u._id), blind: true });
    }
  }
  _onRollMod(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    let label = dataset.label;
    let r1Data = parseInt(dataset.roll || 0);
    let r2Data = 0;
    let reRoll = true;
    let hostile = this.actor.type;
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
         <label>Modifier:</label>
           <input type="text" id="modifier" name="modifier" value="0" autofocus="autofocus">
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
          r1Data = r1Data + modifier;
          yze.yzeRoll(hostile, blind, reRoll, label, r1Data, 'Black', r2Data, 'Stress');
        }
      },
    }).render(true);
  }

  _creatureAcidRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    let label = dataset.label;
    let r1Data = parseInt(dataset.roll || 0);
    let r2Data = 0;
    let reRoll = true;
    let hostile = this.actor.type;
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
      title: `Roll ${label} Damage`,
      content: `
       <p>Please enter the damage inflicted on the Xeno.</p>
       <form>
        <div class="form-group">
         <label>Damage:</label>
           <input type="text" id="damage" name="damage" value="0" autofocus="autofocus" >
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
          let modifier = parseInt(html.find('[name=damage]')[0].value);
          r1Data = r1Data + modifier;
          yze.yzeRoll(hostile, blind, reRoll, label, r1Data, 'Black', r2Data, 'Stress');
        }
      },
    }).render(true);
  }

  _creatureAttackRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    let chatMessage = '';
    const targetTable = dataset.atttype;
    const table = game.tables.entities.find((b) => b.name === targetTable);
    const roll = new Roll('1d6');

    const customResults = table.roll({ roll });
    chatMessage += '<h2>Attack Roll</h2>';
    chatMessage += `<h4><i>${table.data.description}</i></h4>`;
    chatMessage += `${customResults.results[0].text}`;
    ChatMessage.create({ user: game.user._id, content: chatMessage, whisper: game.users.entities.filter((u) => u.isGM).map((u) => u._id), type: CONST.CHAT_MESSAGE_TYPES.WHISPER });
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
}
export default ActorSheetAlienRPGCreat;
