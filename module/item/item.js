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
    const token = this.actor.prototypeToken;
    const item = this;
    let confirmed = false;

    if (item.type === 'armor') {
      return;
    }
    const actorData = this.actor ? this.actor.system : {};
    let actorid = this.actor.id;
    const itemData = item.system;
    const itemid = item.id;
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

    let label = `${item.name} (` + game.i18n.localize('ALIENRPG.Damage') + ` : ${itemData.attributes.damage.value})`;
    let hostile = this.actor.type;
    let blind = false;

    if (this.actor.prototypeToken?.disposition === -1) {
      blind = true;
    }

    if (right) {
      // ************************************
      // Right Click Roll so display modboxes
      // ************************************

      // call pop up box here to get any mods then update r1Data or rData as appropriate.
      // let confirmed = false;
      // Check that is a character or a synth pretending to be a character.
      if (this.actor.type === 'character' || actorData.header.synthstress) {
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
                if (itemData.header.type.value === '1') {
                  let r1Data = actorData.skills.rangedCbt.mod + itemData.attributes.bonus.value + modifier;
                  r2Data = r2Data + stressMod;
                  yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actorid, itemid);
                  game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
                } else if (itemData.header.type.value === '2') {
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
                if (this.actor.type != 'vehicles' && this.actor.type != 'spacecraft') {
                  // it's not a vehicle so add the correct attribute bonus
                  // Define the roll formula.
                  if (itemData.header.type.value === '1') {
                    let r1Data = actorData.skills.rangedCbt.mod + itemData.attributes.bonus.value + modifier;
                    r2Data = r2Data + stressMod;
                    yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actorid, itemid);
                    game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
                  } else if (itemData.header.type.value === '2') {
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
      if (this.actor.type != 'vehicles' && this.actor.type != 'spacecraft') {
        // it's not a vehicle so add the correct attribute bonus
        if (itemData.header.type.value === '1') {
          let r1Data = actorData.skills.rangedCbt.mod + itemData.attributes.bonus.value;
          yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actorid, itemid);
          game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
        } else if (itemData.header.type.value === '2') {
          let r1Data = actorData.skills.closeCbt.mod + itemData.attributes.bonus.value;
          yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actorid, itemid);
          game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
        } else {
          console.warn('No type on item');
        }
      } else {
        // it's a vehicle so no attribute bonus
        switch (this.actor.type) {
          case 'vehicles':
            if (itemData.header.type.value === '1' || itemData.header.type.value === '2') {
              let fCrew = [];
              let options = '';
              for (let [index] of actorData.crew.occupants.entries()) {
                if (actorData.crew.occupants[index].position === 'GUNNER') {
                  const firer = game.actors.get(actorData.crew.occupants[index].id);
                  let fIndex = fCrew.push({ firerName: firer.name, firerID: firer.id, position: actorData.crew.occupants[index].position }) - 1;
                  options = options.concat(`<option value="${fIndex}">${firer.name}</option>`);
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
                      <label>${game.i18n.localize('ALIENRPG.Range')} ${game.i18n.localize('ALIENRPG.MODIFIER')}</label>
                      <select id="rangeMod" name="rangeMod">
                      <option value="0">${game.i18n.localize('ALIENRPG.Short')}</option>
                      <option value="-1">${game.i18n.localize('ALIENRPG.Medium')}</option>
                      <option value="-2">${game.i18n.localize('ALIENRPG.Long')}</option>
                      <option value="-3">${game.i18n.localize('ALIENRPG.Extreme')}</option>
                        </select>
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
                    let tactorid = fCrew[shooter].firerID;
                    let rangeMod = parseInt(html.find('[name=rangeMod]')[0]?.value);
                    let modifier = parseInt(html.find('[name=modifier]')[0].value);
                    let stressMod = parseInt(html.find('[name=stressMod]')[0].value);
                    let aStressVal = parseInt(game.actors.get(tactorid).system.header?.stress?.value || 0);
                    rangeMod = parseInt(rangeMod);
                    if (isNaN(rangeMod)) rangeMod = 0;

                    let r1Data = parseInt(itemData.attributes.bonus.value + modifier + rangeMod + game.actors.get(tactorid).system.skills.rangedCbt.mod);
                    // let r2Data = parseInt(aStressVal + aStressMod + stressMod);
                    let r2Data = parseInt(aStressVal + stressMod);
                    label += ` (${this.actor.name}) `;
                    // label += ` (${fCrew[shooter].firerName}) `;

                    reRoll = false;
                    hostile = 'character';
                    yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actorid, itemid, tactorid);
                    game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
                  }
                },
              }).render(true);
            }
            else {
              console.warn('No type on item');
            }
            break;
          case 'spacecraft':
            if (itemData.header.type.value === '1') {
              let fCrew = [];
              let options = '';
              for (let [index] of actorData.crew.occupants.entries()) {
                if (actorData.crew.occupants[index].position === 'GUNNER') {
                  const firer = game.actors.get(actorData.crew.occupants[index].id);
                  let fIndex = fCrew.push({ firerName: firer.name, firerID: firer.id, position: actorData.crew.occupants[index].position }) - 1;
                  options = options.concat(`<option value="${fIndex}">${firer.name}</option>`);
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
        <label>${game.i18n.localize('ALIENRPG.Range')} ${game.i18n.localize('ALIENRPG.MODIFIER')}</label>
        <select id="rangeMod" name="rangeMod">
          <option value="-2">${game.i18n.localize('ALIENRPG.Extreme')}</option>
          <option value="-1">${game.i18n.localize('ALIENRPG.Long')}</option>
          <option value="0">${game.i18n.localize('ALIENRPG.Medium')}</option>
          <option value="+1">${game.i18n.localize('ALIENRPG.Short')}</option>
          <option value="+2">${game.i18n.localize('ALIENRPG.Contact')}</option>
        </select>
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
                    let tactorid = fCrew[shooter].firerID;
                    let rangeMod = parseInt(html.find('[name=rangeMod]')[0]?.value);
                    let modifier = parseInt(html.find('[name=modifier]')[0].value);
                    let stressMod = parseInt(html.find('[name=stressMod]')[0].value);
                    let aStressVal = parseInt(game.actors.get(tactorid).system.header?.stress?.value || 0);
                    rangeMod = parseInt(rangeMod);
                    if (isNaN(rangeMod)) rangeMod = 0;

                    let r1Data = parseInt(itemData.attributes.bonus.value + modifier + rangeMod + game.actors.get(tactorid).system.skills.rangedCbt.mod);
                    // let r2Data = parseInt(aStressVal + aStressMod + stressMod);
                    let r2Data = parseInt(aStressVal + stressMod);
                    label += ` (${this.actor.name}) `;
                    // label += ` (${fCrew[shooter].firerName}) `;

                    reRoll = false;
                    hostile = 'character';
                    yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actorid, itemid, tactorid);
                    game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
                  }
                },
              }).render(true);
            } else
              if (itemData.header.type.value === '2') {
                let fCrew = [];
                let options = '';
                for (let [index] of actorData.crew.occupants.entries()) {
                  if (actorData.crew.occupants[index].position === 'GUNNER') {
                    const firer = game.actors.get(actorData.crew.occupants[index].id);
                    let fIndex = fCrew.push({ firerName: firer.name, firerID: firer.id, position: actorData.crew.occupants[index].position }) - 1;
                    options = options.concat(`<option value="${fIndex}">${firer.name}</option>`);
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
                      let tactorid = fCrew[shooter].firerID;
                      let modifier = parseInt(html.find('[name=modifier]')[0].value);
                      let stressMod = parseInt(html.find('[name=stressMod]')[0].value);
                      let aStressVal = parseInt(game.actors.get(tactorid).system.header?.stress?.value || 0);

                      let r1Data = parseInt(itemData.attributes.bonus.value + modifier + game.actors.get(tactorid).system.skills.rangedCbt.mod);
                      // let r2Data = parseInt(aStressVal + aStressMod + stressMod);
                      let r2Data = parseInt(aStressVal + stressMod);
                      label += ` (${this.actor.name}) `;
                      // label += ` (${fCrew[shooter].firerName}) `;

                      reRoll = false;
                      hostile = 'character';
                      yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actorid, itemid, tactorid);
                      game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
                    }
                  },
                }).render(true);
              }
              else {
                console.warn('No type on item');
              }
            break;

          default:
            break;
        }
      }
    }
  }

  async rollComputer(item, dataset, rollMod = false) {
    let compData = "";

    if (rollMod) {
      compData = dataset;
    } else {
      compData = dataset.dataset;
    }

    let label = compData.label + ' ' + item.name;
    let r2Data = 0;
    let reRoll = true;
    let actorId = item.id;
    let attrib = dataset.attr;
    let blind = false;
    let effectiveActorType = 'item'; // make rolls look human

    let modifier = parseInt(compData?.mod ?? 0) + parseInt(compData?.modifier ?? 0);

    // the dataset value is returned to the DOM so it should be set to 0 in case a future roll is made without the
    // modifier dialog.

    compData.modifier = 0;

    if (compData.roll) {
      let r1Data = parseInt(compData.roll || 0) + parseInt(modifier);
      reRoll = true;
      r2Data = 0;
      yze.yzeRoll(effectiveActorType, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actorId);
    }
  }

  async rollComputerMod(item, dataset) {
    function myRenderTemplate(template) {
      let confirmed = false;
      renderTemplate(template).then((dlg) => {
        new Dialog({
          title: game.i18n.localize('ALIENRPG.DialTitle1') + ' ' + dataset.label + ' ' + game.i18n.localize('ALIENRPG.DialTitle2'),
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
              let modifier = parseInt(html.find('[name=modifier]')[0]?.value);

              if (modifier == 'undefined') {
                modifier = 0;
              } else modifier = parseInt(modifier);
              if (isNaN(modifier)) modifier = 0;
              // console.log('🚀 ~ file: actor.js ~ line 575 ~ alienrpgActor ~ renderTemplate ~ stressMod', stressMod);

              dataset.modifier = modifier;
              item.rollComputer(item, dataset, confirmed);
            }
          },
        }).render(true);
      });
    }
    if (dataset.roll) {
      // call pop up box here to get any mods then use standard rollComputer
      myRenderTemplate('systems/alienrpg/templates/dialog/roll-base-dialog.html');
    }

  }

}

