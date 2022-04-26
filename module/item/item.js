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
  }

  /**
   * Handle clickable rolls.
   */

  async roll(right) {
    // Basic template rendering data
    const token = this.actor.token;
    const item = this.data;
    let confirmed = false;

    if (item.type === 'armor') {
      return;
    }
    const actorData = this.actor ? this.actor.system : {};
    let actorid = this.actor.id;
    const itemData = item.system;
    const itemid = item._id;
    game.alienrpg.rollArr.sCount = 0;
    game.alienrpg.rollArr.multiPush = 0;

    let template = 'systems/alienrpg/templates/dialog/roll-all-dialog.html';
    // let roll;
    let r2Data = 0;
    let reRoll = false;
    if (this.actor.type === 'character') {
      r2Data = this.actor.getRollData().stress;
      reRoll = false;
    } else {
      r2Data = 0;
      reRoll = true;
    }
    let label = `${item.name} (` + game.i18n.localize('ALIENRPG.Damage') + ` : ${item.system.attributes.damage.value})`;
    let hostile = this.actor.type;
    let blind = false;

    if (this.actor.token?.disposition === -1) {
      blind = true;
    }

    if (right) {
      // ************************************
      // Right Click Roll sodisplay modboxes
      // ************************************

      // call pop up box here to get any mods then update r1Data or rData as appropriate.
      // let confirmed = false;
      // Check that is a character or a synth pretending to be a character.
      if (this.actor.type === 'character' || this.actor.system.header.synthstress) {
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

                  //
                  // Roll power.  This currently breaks the push code so needs review/refactoring (considerable)
                  //
                  // if (item.data.attributes.power.value >0) {
                  //   const ilabel = game.i18n.localize('ALIENRPG.Power') + ' ' + game.i18n.localize('ALIENRPG.Supply');
                  //   const consUme = 'power';
                  //   this.actor.consumablesCheck(this.actor, consUme, ilabel, item._id);
                  // }
                } else if (item.system.header.type.value === '2') {
                  let r1Data = actorData.skills.closeCbt.mod + itemData.attributes.bonus.value + modifier;
                  r2Data = r2Data + stressMod;
                  yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actorid, itemid);
                  game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;

                  //
                  // Roll power.  This currently breaks the push code so needs review/refactoring (considerable)
                  //
                  // if (item.data.attributes.power.value >0) {
                  //   const ilabel = game.i18n.localize('ALIENRPG.Power') + ' ' + game.i18n.localize('ALIENRPG.Supply');
                  //   const consUme = 'power';
                  //   this.actor.consumablesCheck(this.actor, consUme, ilabel, item._id);
                  // }
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
                  if (item.system.header.type.value === '1') {
                    let r1Data = actorData.skills.rangedCbt.mod + itemData.attributes.bonus.value + modifier;
                    r2Data = r2Data + stressMod;
                    yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actorid, itemid);
                    game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
                  } else if (item.system.header.type.value === '2') {
                    let r1Data = actorData.skills.closeCbt.mod + itemData.attributes.bonus.value + modifier;
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
      if (this.actor.type != 'vehicles') {
        // it's not a vehicle so add the correct attribute bonus
        if (item.system.header.type.value === '1') {
          let r1Data = actorData.skills.rangedCbt.mod + itemData.attributes.bonus.value;
          yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actorid, itemid);
          game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;

          //
          // Roll power.  This currently breaks the push code so needs review/refactoring (considerable)
          //
          // if (item.data.attributes.power.value >0) {
          //   const ilabel = game.i18n.localize('ALIENRPG.Power') + ' ' + game.i18n.localize('ALIENRPG.Supply');
          //   const consUme = 'power';
          //   this.actor.consumablesCheck(this.actor, consUme, ilabel, item._id);
          // }
        } else if (item.system.header.type.value === '2') {
          let r1Data = actorData.skills.closeCbt.mod + itemData.attributes.bonus.value;
          yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actorid, itemid);
          game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;

          //
          // Roll power.  This currently breaks the push code so needs review/refactoring (considerable)
          //
          // if (item.data.attributes.power.value >0) {
          //   const ilabel = game.i18n.localize('ALIENRPG.Power') + ' ' + game.i18n.localize('ALIENRPG.Supply');
          //   const consUme = 'power';
          //   this.actor.consumablesCheck(this.actor, consUme, ilabel, item._id);
          // }
        } else {
          console.warn('No type on item');
        }
      } else {
        // it's a vehicle so no attribute bonus

        if (item.system.header.type.value === '1') {
          let fCrew = [];
          let options = '';
          for (let [index] of actorData.crew.occupants.entries()) {
            if (actorData.crew.occupants[index].position != 'PASSENGER') {
              const firer = game.actors.get(actorData.crew.occupants[index].id).data;
              fCrew.push({ firerName: firer.name, firerID: firer._id, position: actorData.crew.occupants[index].position });
              options = options.concat(`<option value="${index}">${firer.name}</option>`);
            }
          }
          if (fCrew.length === 0) {
            return ui.notifications.warn(game.i18n.localize('ALIENRPG.noCrewAssigned'));
          }
          let template = `
          <form>
              <div class="form-group">
              <label>${game.i18n.localize('ALIENRPG.SelectFirer')}</label>
              <select id="FirerSelect" name="FirerSelect">${options}</select>
              </div>
              <div class="form-group">
              <label>${game.i18n.localize('ALIENRPG.BaseMod')}</label>
              <input type="text" id="modifier" name="modifier" value="0" autofocus="autofocus" />
              </div>
              <div class="form-group">
              <label>${game.i18n.localize('ALIENRPG.StressMod')}</label>
              <input type="text" id="stressMod" name="stressMod" value="0" autofocus="autofocus" />
            </div>
          
          </form>`;
          new Dialog({
            title: game.i18n.localize('ALIENRPG.DialTitle1') + ' ' + label + ' ' + game.i18n.localize('ALIENRPG.DialTitle2'),
            content: template,
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
                let shooter = parseInt(html.find('[name=FirerSelect]')[0].value);
                actorid = fCrew[shooter].firerID;
                let modifier = parseInt(html.find('[name=modifier]')[0].value);
                let stressMod = parseInt(html.find('[name=stressMod]')[0].value);
                let aStressMod = parseInt(game.actors.get(actorid).system.header?.stress?.mod || 0);
                let aStressVal = parseInt(game.actors.get(actorid).system.header?.stress?.value || 0);
                let r1Data = parseInt(itemData.attributes.bonus.value + modifier + game.actors.get(actorid).system.skills.rangedCbt.mod);
                let r2Data = parseInt(aStressVal + aStressMod + stressMod);
                // label += ` (${fCrew[shooter].firerName}) `;
                label += ` (${this.actor.name}) `;

                reRoll = false;
                hostile = 'character';
                yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actorid, itemid);
                game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
              }
            },
          }).render(true);
        } else if (item.system.header.type.value === '2') {
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
