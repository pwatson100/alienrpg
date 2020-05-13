/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class alienrpgItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    // Get the Item's data
    const itemData = this.data;
    const actorData = this.actor ? this.actor.data : {};
    const data = itemData.data;
  }
  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */

  async roll() {
    // Basic template rendering data
    const token = this.actor.token;
    const item = this.data;
    const actorData = this.actor ? this.actor.data.data : {};
    const itemData = item.data;
    let roll;
    // Define the roll formula.
    if (item.data.header.type.value === "Ranged") {
      roll = new Roll('(@skills.rangedCbt.mod)d6', actorData);
    } else if (item.data.header.type.value === "Melee") {
      roll = new Roll('(@skills.closeCbt.mod)d6', actorData);
    } else { console.log('No type on item'); };
    let label = `Rolling ${item.name}`;
    // Roll and send to chat.
    roll.roll().toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: label,
    });
  }
}
