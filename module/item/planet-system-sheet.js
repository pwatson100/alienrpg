/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class alienrpgPlanetSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['alienrpg', 'sheet', 'item', 'planet-system'],
      width: 710,
      height: 665,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'details' }],
    });
  }

  /** @override */
  get template() {
    const path = 'systems/alienrpg/templates/item';
    // Return a single sheet for all item types.
    return `${path}/planet-system-sheet.html`;
    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.

    // return `${path}/${this.item.data.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // const data = super.getData();
    const data = foundry.utils.deepClone(this.item.data);

    // console.warn('get data', data);
    return data;
  }

  /* -------------------------------------------- */

  // /** @override */
  // setPosition(options = {}) {
  //   const position = super.setPosition(options);
  //   const sheetBody = this.element.find('.sheet-body');
  //   const bodyHeight = position.height - 192;
  //   sheetBody.css('height', bodyHeight);
  //   return position;
  // }

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
    // format inital value
    onBlur({ target: event.currentTarget });

    function localStringToNumber(s) {
      return Number(String(s).replace(/[^0-9.-]+/g, ''));
    }

    function onBlur(e) {
      let value = e.target.value;
      e.target.value = value ? Intl.NumberFormat('en-EN', { maximumFractionDigits: 0, style: 'currency', currency: 'USD' }).format(value) : '';
      // console.warn(e.target.value);
    }
  }
}
