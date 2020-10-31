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
    let r2Data = 0;
    let reRoll = false;
    // console.log('alienrpgItem -> roll -> this.actor.data.type', this.actor.data.type);
    if (this.actor.data.type === 'character') {
      r2Data = this.actor.getRollData().stress;
      reRoll = false;
    } else {
      r2Data = 0;
      reRoll = true;
    }
    let label = `${item.name}`;
    let hostile = this.actor.data.type;
    let blind = false;

    if (this.actor.data.token.disposition === -1) {
      blind = true;
    }

    if (right) {
      // ************************************
      // Right Click Roll sodisplay modboxes
      // ************************************

      // call pop upbox here to get any mods then update r1Data or rData as appropriate.
      let confirmed = false;
      if (this.actor.data.type === 'character') {
        new Dialog({
          title: `Roll Modified ${label} check`,
          content: `
        <p>Please enter your modifier.</p>
        <form>
         <div class="form-group">
          <label>Base Modifier:</label>
            <input type="text" id="modifier" name="modifier" value="0" autofocus="autofocus">
            </div>
            <div class="form-group">
            <label>Stress Modifier:</label>
            <input type="text" id="stressMod" name="stressMod" value="0" autofocus="autofocus">
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
              let stressMod = parseInt(html.find('[name=stressMod]')[0].value);

              // Define the roll formula.
              if (item.data.header.type.value === '1') {
                let r1Data = actorData.skills.rangedCbt.mod + itemData.attributes.bonus.value + modifier;
                r2Data = r2Data + stressMod;
                yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'));
                game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
              } else if (item.data.header.type.value === '2') {
                let r1Data = actorData.skills.closeCbt.mod + itemData.attributes.bonus.value + modifier;
                r2Data = r2Data + stressMod;
                yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'));
                game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
              } else {
                console.warn('No type on item');
              }
            }
          },
        }).render(true);
      } else {
        // Its not got stress so don't display the stress mod box
        new Dialog({
          title: `Roll Modified ${label} check`,
          content: `
        <p>Please enter your modifier.</p>
        <form>
         <div class="form-group">
          <label>Base Modifier:</label>
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
              let stressMod = 0;
              if (this.actor.data.type != 'vehicles') {
                // it's not a vehicle so add the correct attribute bonus
                // Define the roll formula.
                if (item.data.header.type.value === '1') {
                  let r1Data = actorData.skills.rangedCbt.mod + itemData.attributes.bonus.value + modifier;
                  r2Data = r2Data + stressMod;
                  yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'));
                  game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
                } else if (item.data.header.type.value === '2') {
                  let r1Data = actorData.skills.closeCbt.mod + itemData.attributes.bonus.value + modifier;
                  r2Data = r2Data + stressMod;
                  yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'));
                  game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
                } else {
                  console.warn('No type on item');
                }
              } else {
                // it's a vehicle so no attribute bonus

                if (item.data.header.type.value === '1') {
                  let r1Data = itemData.attributes.bonus.value + modifier;
                  r2Data = r2Data + stressMod;
                  yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'));
                  game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
                } else if (item.data.header.type.value === '2') {
                  let r1Data = itemData.attributes.bonus.value + modifier;
                  r2Data = r2Data + stressMod;
                  yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'));
                  game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
                } else {
                  console.warn('No type on item');
                }
              }
            }
          },
        }).render(true);
      }
    } else {
      // ************************************
      // Normal Left Click Roll
      // ************************************
      // Define the roll formula.
      if (this.actor.data.type != 'vehicles') {
        // it's not a vehicle so add the correct attribute bonus
        console.log('alienrpgItem -> roll -> item.data.header.type.value', item.data.header.type.value);
        if (item.data.header.type.value === '1') {
          let r1Data = actorData.skills.rangedCbt.mod + itemData.attributes.bonus.value;
          yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'));
          game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
        } else if (item.data.header.type.value === '2') {
          let r1Data = actorData.skills.closeCbt.mod + itemData.attributes.bonus.value;
          yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'));
          game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
        } else {
          console.warn('No type on item');
        }
      } else {
        // it's a vehicle so no attribute bonus

        if (item.data.header.type.value === '1') {
          let r1Data = itemData.attributes.bonus.value;
          yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'));
          game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
        } else if (item.data.header.type.value === '2') {
          let r1Data = itemData.attributes.bonus.value;
          yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'));
          game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
        } else {
          console.warn('No type on item');
        }
      }
    }
  }
}
