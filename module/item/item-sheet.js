import { logger } from '../logger.js';

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class alienrpgItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['alienrpg', 'sheet', 'item', 'item-sheet'],
      width: 675,
      height: 489 + 'max-content',
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'general' }],
    });
  }

  /** @override */
  get template() {
    const path = 'systems/alienrpg/templates/item';
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;
    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.

    return `${path}/${this.item.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const data = super.getData();
    // const item = foundry.utils.deepClone(this.item.data);
    // debugger;
    // let item = data.item;
    const item = data.item.toJSON();
    // console.log(data);

    // const item = duplicate(this.item.data);
    // const data = item;
    switch (item.type) {
      case 'planet-system':
        // this._prepareSystemData(item);
        break;
      case 'agenda':
        this._prepareAgendaData(item);
        break;
      case 'talent':
        this._prepareTalentData(item);
        break;
      case 'specialty':
        this._prepareSpecialtyData(item);
        break;

      default:
        break;
    }
    logger.debug('Item Sheet derived data:', item);
    return item;
  }

  async _prepareSystemData(data) {
    this.item.update({ img: 'systems/alienrpg/images/icons/solar-system.svg' });
  }

  async _prepareAgendaData(data) {
    this.item.update({ img: 'systems/alienrpg/images/icons/personal-agenda.png' });
  }

  async _prepareSpecialtyData(data) {
    this.item.update({ img: 'systems/alienrpg/images/icons/cover-notext.png' });
  }

  async _prepareTalentData(data) {
    if (data.system.general.career.value === '1' || data.system.general.career.value === '') {
      this.item.update({ img: 'systems/alienrpg/images/icons/sprint.svg' });
    } else {
      this.item.update({ img: 'systems/alienrpg/images/icons/fire-dash.svg' });
    }
  }

  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find('.sheet-body');
    const bodyHeight = position.height - 192;
    sheetBody.css('height', bodyHeight);
    return position;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Roll handlers, click handlers, etc. would go here.
    html.find('.currency').on('change', this._currencyField.bind(this));
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
      // console.warn(e.target.value);
    }
  }
}
