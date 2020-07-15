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
    // console.warn('data', data);
  }
  /**
   * Handle clickable rolls.
   */

  async roll(right) {
    // Basic template rendering data
    const token = this.actor.token;
    const item = this.data;
    const actorData = this.actor ? this.actor.data.data : {};
    const itemData = item.data;
    game.alienrpg.rollArr.sCount = 0;

    // let roll;
    let r2Data = this.actor.getRollData().stress;
    let label = `${item.name}`;
    let reRoll = false;
    let hostile = this.actor.data.type;
    let blind = false;

    if (this.actor.data.token.disposition === -1) {
      blind = true;
    }

    if (this.actor.data.type === 'synthetic') {
      r2Data = 0;
      reRoll = true;
    }

    if (right) {
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
            // Define the roll formula.
            if (item.data.header.type.value === 'Ranged') {
              let r1Data = actorData.skills.rangedCbt.mod + itemData.attributes.bonus.value + modifier;
              yze.yzeRoll(hostile, blind, reRoll, label, r1Data, 'Black', r2Data, 'Stress');
              game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six + game.alienrpg.rollArr.r3Six;
            } else if (item.data.header.type.value === 'Melee') {
              let r1Data = actorData.skills.closeCbt.mod + itemData.attributes.bonus.value + modifier;
              yze.yzeRoll(hostile, blind, reRoll, label, r1Data, 'Black', r2Data, 'Stress');
              game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six + game.alienrpg.rollArr.r3Six;
            } else {
              console.warn('No type on item');
            }
          }
        },
      }).render(true);
    } else {
      // Define the roll formula.
      if (item.data.header.type.value === 'Ranged') {
        let r1Data = actorData.skills.rangedCbt.mod + itemData.attributes.bonus.value;
        yze.yzeRoll(hostile, blind, reRoll, label, r1Data, 'Black', r2Data, 'Stress');
        game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six + game.alienrpg.rollArr.r3Six;
      } else if (item.data.header.type.value === 'Melee') {
        let r1Data = actorData.skills.closeCbt.mod + itemData.attributes.bonus.value;
        yze.yzeRoll(hostile, blind, reRoll, label, r1Data, 'Black', r2Data, 'Stress');
        game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six + game.alienrpg.rollArr.r3Six;
      } else {
        console.warn('No type on item');
      }
    }
  }
}
