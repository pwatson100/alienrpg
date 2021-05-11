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
    const actorData = this.item ? this.item.data : {};
    const data = this.data;
    // console.warn('data', data);
  }
  /**
   * Handle clickable rolls.
   */

  async roll(right) {
    // Basic template rendering data
    const token = this.actor.token;
    const item = this.data;
    if (item.type === 'armor') {
      return;
    }
    const actorData = this.actor ? this.actor.data.data : {};
    const actorid = this.actor.id;
    const itemData = item.data;
    const itemid = item._id;
    game.alienrpg.rollArr.sCount = 0;
    game.alienrpg.rollArr.multiPush = 0;

    let template = 'systems/alienrpg/templates/dialog/roll-all-dialog.html';
    // let roll;
    let r2Data = 0;
    let reRoll = false;
    if (this.actor.data.type === 'character') {
      r2Data = this.actor.getRollData().stress;
      reRoll = false;
    } else {
      r2Data = 0;
      reRoll = true;
    }
    let label = `${item.name} (` + game.i18n.localize('ALIENRPG.Damage') + ` : ${item.data.attributes.damage.value})`;
    let hostile = this.actor.data.type;
    let blind = false;

    if (this.actor.data.token.disposition === -1) {
      blind = true;
    }

    if (right) {
      // ************************************
      // Right Click Roll sodisplay modboxes
      // ************************************

      // call pop up box here to get any mods then update r1Data or rData as appropriate.
      let confirmed = false;
      // Check that is a character or a synth pretending to be a character.
      if (this.actor.data.type === 'character' || this.actor.data.data.header.synthstress) {
        renderTemplate(template).then((dlg) => {
          new Dialog({
            title: game.i18n.localize('ALIENRPG.DialTitle1') + ' ' + label + ' ' + game.i18n.localize('ALIENRPG.DialTitle2'),
            content: dlg,
            buttons: {
              one: {
                icon: '<i class="fas fa-check"></i>',
                label: game.i18n.localize('ALIENRPG.DialRoll'),
                callback: () => (confirmed = true),
              },
              two: {
                icon: '<i class="fas fa-times"></i>',
                label: game.i18n.localize('ALIENRPG.DialCancel'),
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
                  yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actorid, itemid);
                  game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
                } else if (item.data.header.type.value === '2') {
                  let r1Data = actorData.skills.closeCbt.mod + itemData.attributes.bonus.value + modifier;
                  r2Data = r2Data + stressMod;
                  yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actorid, itemid);
                  game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
                } else {
                  console.warn('No type on item');
                }
              }
            },
          }).render(true);
        });
      } else {
        // Its not got stress so don't display the stress mod box
        template = 'systems/alienrpg/templates/dialog/roll-base-dialog.html';
        renderTemplate(template).then((dlg) => {
          new Dialog({
            title: game.i18n.localize('ALIENRPG.DialTitle1') + ' ' + label + ' ' + game.i18n.localize('ALIENRPG.DialTitle2'),
            content: dlg,
            buttons: {
              one: {
                icon: '<i class="fas fa-check"></i>',
                label: game.i18n.localize('ALIENRPG.DialRoll'),
                callback: () => (confirmed = true),
              },
              two: {
                icon: '<i class="fas fa-times"></i>',
                label: game.i18n.localize('ALIENRPG.DialCancel'),
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
                    yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actorid, itemid);
                    game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
                  } else if (item.data.header.type.value === '2') {
                    let r1Data = actorData.skills.closeCbt.mod + itemData.attributes.bonus.value + modifier;
                    r2Data = r2Data + stressMod;
                    yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actorid, itemid);
                    game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
                  } else {
                    console.warn('No type on item');
                  }
                } else {
                  // it's a vehicle so no attribute bonus

                  if (item.data.header.type.value === '1') {
                    let r1Data = itemData.attributes.bonus.value + modifier;
                    r2Data = r2Data + stressMod;
                    yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actorid, itemid);
                    game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
                  } else if (item.data.header.type.value === '2') {
                    let r1Data = itemData.attributes.bonus.value + modifier;
                    r2Data = r2Data + stressMod;
                    yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actorid, itemid);
                    game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
                  } else {
                    console.warn('No type on item');
                  }
                }
              }
            },
          }).render(true);
        });
      }
    } else {
      // ************************************
      // Normal Left Click Roll
      // ************************************
      // Define the roll formula.
      if (this.actor.data.type != 'vehicles') {
        // it's not a vehicle so add the correct attribute bonus
        if (item.data.header.type.value === '1') {
          let r1Data = actorData.skills.rangedCbt.mod + itemData.attributes.bonus.value;
          yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actorid, itemid);
          game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
        } else if (item.data.header.type.value === '2') {
          let r1Data = actorData.skills.closeCbt.mod + itemData.attributes.bonus.value;
          yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actorid, itemid);
          game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
        } else {
          console.warn('No type on item');
        }
      } else {
        // it's a vehicle so no attribute bonus

        if (item.data.header.type.value === '1') {
          let r1Data = itemData.attributes.bonus.value;
          yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actorid, itemid);
          game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
        } else if (item.data.header.type.value === '2') {
          let r1Data = itemData.attributes.bonus.value;
          yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actorid, itemid);
          game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
        } else {
          console.warn('No type on item');
        }
      }
    }
  }
}
