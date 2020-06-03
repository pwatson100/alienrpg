/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class alienrpgItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['alienrpg', 'sheet', 'item'],
      width: 520,
      height: 458,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'description' }],
    });
  }

  /** @override */
  get template() {
    const path = 'systems/alienrpg/templates/item';
    // Return a single sheet for all item types.
    return `${path}/item-sheet.html`;
    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.

    // return `${path}/${this.item.data.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    return data;
  }

  /* -------------------------------------------- */

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
    html.find('.currency').click(this._currencyField.bind(this));
  }

  _currencyField(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    let label = dataset.label;

    console.log(element.dataset);

    const currency = 'USD'; // https://www.currency-iso.org/dam/downloads/lists/list_one.xml

    // format inital value
    onBlur({ target: event.currentTarget });
    // bind event listeners
    // event.currentTarget.addEventListener('focus', onFocus);
    // event.currentTarget.addEventListener('blur', onBlur);

    function localStringToNumber(s) {
      return Number(String(s).replace(/[^0-9.-]+/g, ''));
    }

    function onFocus(e) {
      let value = e.target.value;
      e.target.value = value ? localStringToNumber(value) : '';
    }

    function onBlur(e) {
      console.log('onblur');
      let value = e.target.value;

      let options = {
        maximumFractionDigits: 2,
        currency: currency,
        style: 'currency',
        currencyDisplay: 'symbol',
      };
      e.target.value = value ? localStringToNumber(value).toLocaleString(undefined, options) : '';
      console.log(e.target.value);
    }
  }
}
