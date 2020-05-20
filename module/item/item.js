import { yze } from '../YZEDiceRoller.js';

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
    // let roll;
    let r2Data = this.actor.getRollData().stress;
    let label = `${item.name}`;
    let reRoll = false;
    // Define the roll formula.
    if (item.data.header.type.value === 'Ranged') {
      let r1Data = actorData.skills.rangedCbt.mod + itemData.attributes.bonus.value;
      const myResult = yze.yzeRoll(reRoll, label, r1Data, 'Black', r2Data, 'Yellow');
      console.log(myResult);
    } else if (item.data.header.type.value === 'Melee') {
      let r1Data = actorData.skills.closeCbt.mod + itemData.attributes.bonus.value;
      const myResult = yze.yzeRoll(reRoll, label, r1Data, 'Black', r2Data, 'Yellow');
    } else {
      console.log('No type on item');
    }
  }
}
