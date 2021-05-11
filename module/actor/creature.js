import { yze } from '../YZEDiceRoller.js';
import { alienrpgrTableGet } from './rollTableData.js';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class ActorSheetAlienRPGCreat extends ActorSheet {
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
      classes: ['alienrpg', 'sheet', 'actor', 'creature-sheet'],
      // template: 'systems/alienrpg/templates/actor/creature-sheet.html',
      width: 660,
      height: 630,
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
    let isOwner = this.document.isOwner;
    const data = {
      owner: this.document.isOwner,
      limited: this.document.limited,
      options: this.options,
      editable: this.isEditable,
      cssClass: isOwner ? 'editable' : 'locked',
      isCharacter: this.document.data.type === 'character',
      isVehicles: this.document.data.type === 'vehicles',
      isCreature: this.document.data.type === 'creature',
      // isNPC: this.entity.data.type === 'creature',
      config: CONFIG.ALIENRPG,
    };

    // The Actor and its Items
    // data.actor = duplicate(this.actor.data);
    data.actor = foundry.utils.deepClone(this.actor.data);

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
    });
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    if (game.settings.get('alienrpg', 'switchMouseKeys')) {
      // Right to Roll and left to mod
      // Rollable abilities.
      html.find('.rollable').contextmenu(this._onRoll.bind(this));
      html.find('.rollable').click(this._onRollMod.bind(this));
    } else {
      // Left to Roll and Right toMod
      html.find('.rollable').click(this._onRoll.bind(this));
      html.find('.rollable').contextmenu(this._onRollMod.bind(this));
    }
    // plus tohealth and stress
    html.find('.creature-attack-roll').click(this._creatureAttackRoll.bind(this));
    // Rollable abilities.

    html.find('.creature-acid-roll').click(this._creatureAcidRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
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

  _creatureAcidRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    this.actor.creatureAcidRoll(this.actor, dataset);
  }

  _creatureAttackRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    console.log('🚀 ~ file: creature.js ~ line 158 ~ ActorSheetAlienRPGCreat ~ _creatureAttackRoll ~ dataset', dataset);
    this.actor.creatureAttackRoll(this.actor, dataset);
  }
}
export default ActorSheetAlienRPGCreat;
