/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class alienrpgActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['alienrpg', 'sheet', 'actor'],
      template: 'systems/alienrpg/templates/actor/actor-sheet.html',
      width: 600,
      height: 600,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'skills' }],
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.dtypes = ['String', 'Number', 'Boolean'];
    for (let attr of Object.values(data.data.attributes)) {
      attr.isCheckbox = attr.dtype === 'Boolean';
    }
    return data;
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
    let label = dataset.label
    if (dataset.roll) {
      let r1Data = parseInt(dataset.roll || 0);
      let r2Data = this.actor.getRollData().stress;
      this.yzeRoll(label, r1Data, 'Black', r2Data, 'Yellow');
    } else {
      if (dataset.panicroll) {
        let chatMessage = '';
        const table = game.tables.getName('Panic Table');
        const roll = new Roll('1d6 + @stress', this.actor.getRollData()).roll();
        const result = table.data.results.find((r) => Number.between(roll.total, ...r.range));
        chatMessage += '<h2>Panic Condition</h2>';
        chatMessage += `<h4><i>${table.data.description}</i></h4>`;
        chatMessage += `${result.text}`;
        ChatMessage.create({ user: game.user._id, content: chatMessage, other: game.users.entities.filter((u) => u.isGM).map((u) => u._id), type: CONST.CHAT_MESSAGE_TYPES.OTHER });
      }
    }
  }

  /**
   * YZEDice Roll method.
   * Param for number of dice to roll for each die type/rolls
   * @param {string} label
   * @param {number} r1Dice
   * @param {number} r2Dice
   * @param {number} r3Dice
   * @param {string} col1
   * @param {string} col2
   * @param {string} col3
   * 
   */

  yzeRoll(label, r1Dice, col1, r2Dice, col2, r3Dice, col3) {
    //   This finally works
    let chatMessage = "";
    const rollArr = { r1One: 0, r1Six: 0, r2One: 0, r2Six: 0, r3One: 0, r3Six: 0, };
    const data = {
      formula: '',
      results: [],
      whisper: [],
      blind: false
    }
    const dResults = [];

    function yzeRoll(numDie, yzeR6, yzeR1) {
      let die = new Die(6);
      die.roll(numDie);
      die.results.forEach(el => { data.results.push(el); });
      die.countSuccess(6, "=");
      rollArr[yzeR6] = die.total;
      die.countSuccess(1, "=");
      rollArr[yzeR1] = die.total;
      chatMessage += "Ones: ";
      chatMessage += `${rollArr[yzeR1]}`;
      chatMessage += "  Sixes: ";
      chatMessage += `${rollArr[yzeR6]}`;
      chatMessage += "<div><br></div>";
    }
    if (r1Dice < 1) {
      chatMessage += "You must have at least one dice set to roll";
    } else {
      chatMessage += "<h2>Rolling " + label + " </h2>";
      chatMessage += "<div>" + col1 + " - " + r1Dice + "</div>";
      yzeRoll(r1Dice, 'r1Six', 'r1One');
      data.formula = r1Dice + "d6";

      if (r2Dice > 0) {
        chatMessage += "<div>" + col2 + " - " + r2Dice + "</div>";
        yzeRoll(r2Dice, 'r2Six', 'r2One');
        data.formula = r1Dice + r2Dice + "d6";
      }
      if (r3Dice > 0) {
        chatMessage += "<div>" + col3 + " - " + r3Dice + "</div>";
        yzeRoll(r3Dice, 'r3Six', 'r3One');
        data.formula = r1Dice + r2Dice + r3Dice + "d6";
      }
    }
    game.dice3d.show(data).then(displayed => { });
    ChatMessage.create({
      user: game.user._id,
      content: chatMessage, other:
        game.users.entities.filter(u => u.isGM).map(u => u._id), type: CONST.CHAT_MESSAGE_TYPES.OTHER
    })
  }
}