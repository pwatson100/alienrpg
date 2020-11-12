import { yze } from '../YZEDiceRoller.js';
/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */

export class alienrpgActor extends Actor {
  /** @override */
  getRollData() {
    const data = super.getRollData();
    const shorthand = game.settings.get('alienrpg', 'macroShorthand');

    // Re-map all attributes onto the base roll data
    if (!!shorthand) {
      for (let [k, v] of Object.entries(data.attributes)) {
        if (!(k in data)) data[k] = v.value;
      }
      delete data.attributes;
    }
    if (!!shorthand) {
      for (let [k, v] of Object.entries(data.header)) {
        if (!(k in data)) data[k] = v.value;
      }
      delete data.header;
    }
    if (!!shorthand) {
      for (let [k, v] of Object.entries(data.general)) {
        if (!(k in data)) data[k] = v.value;
      }
      delete data.general;
    }

    // Map all items data using their slugified names
    data.items = this.data.items.reduce((obj, i) => {
      let key = i.name.slugify({ strict: true });
      let itemData = duplicate(i.data);
      if (!!shorthand) {
        for (let [k, v] of Object.entries(itemData.attributes)) {
          if (!(k in itemData)) itemData[k] = v.value;
        }
        delete itemData['attributes'];
      }
      obj[key] = itemData;
      return obj;
    }, {});
    return data;
  }

  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareBaseData() {
    super.prepareBaseData();

    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags;

    if (actorData.type === 'character') this._prepareCharacterData(actorData);
    else if (actorData.type === 'synthetic') this._prepareCharacterData(actorData);
    else if (actorData.type === 'vehicle') this._prepareVehicleData(data);
    else if (actorData.type === 'creature') this._prepareCreatureData(data);
    else if (actorData.type === 'territory') this._prepareTeritoryData(data);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    super.prepareDerivedData();
    const data = actorData.data;
    // // console.log('alienrpgActor -> _prepareCharacterData -> data', actorData);
    var attrMod = {
      str: 0,
      agl: 0,
      emp: 0,
      wit: 0,
      health: 0,
      stress: 0,
    };

    var sklMod = {
      heavyMach: 0,
      closeCbt: 0,
      stamina: 0,
      rangedCbt: 0,
      mobility: 0,
      piloting: 0,
      command: 0,
      manipulation: 0,
      medicalAid: 0,
      observation: 0,
      survival: 0,
      comtech: 0,
    };

    for (let [skey, Attrib] of Object.entries(actorData.items)) {
      if (Attrib.type === 'item') {
        if (Attrib.data.header.active) {
          let base = Attrib.data.modifiers.attributes;
          for (let [bkey, aAttrib] of Object.entries(base)) {
            switch (bkey) {
              case 'str':
                attrMod.str = attrMod.str += parseInt(aAttrib.value);
                break;
              case 'agl':
                attrMod.agl = attrMod.agl += parseInt(aAttrib.value);
                break;
              case 'emp':
                attrMod.emp = attrMod.emp += parseInt(aAttrib.value);
                break;
              case 'wit':
                attrMod.wit = attrMod.wit += parseInt(aAttrib.value);
                break;
              case 'health':
                attrMod.health = attrMod.health += parseInt(aAttrib.value);
                break;
              case 'stress':
                attrMod.stress = attrMod.stress += parseInt(aAttrib.value);
                break;

              default:
                break;
            }
          }

          let skillBase = Attrib.data.modifiers.skills;
          for (let [skey, sAttrib] of Object.entries(skillBase)) {
            switch (skey) {
              case 'heavyMach':
                sklMod.heavyMach = sklMod.heavyMach += parseInt(sAttrib.value);
                break;
              case 'closeCbt':
                sklMod.closeCbt = sklMod.closeCbt += parseInt(sAttrib.value);
                break;
              case 'stamina':
                sklMod.stamina = sklMod.stamina += parseInt(sAttrib.value);
                break;
              case 'rangedCbt':
                sklMod.rangedCbt = sklMod.rangedCbt += parseInt(sAttrib.value);
                break;
              case 'mobility':
                sklMod.mobility = sklMod.mobility += parseInt(sAttrib.value);
                break;
              case 'piloting':
                sklMod.piloting = sklMod.piloting += parseInt(sAttrib.value);
                break;
              case 'command':
                sklMod.command = sklMod.command += parseInt(sAttrib.value);
                break;
              case 'manipulation':
                sklMod.manipulation = sklMod.manipulation += parseInt(sAttrib.value);
                break;
              case 'medicalAid':
                sklMod.medicalAid = sklMod.medicalAid += parseInt(sAttrib.value);
                break;
              case 'observation':
                sklMod.observation = sklMod.observation += parseInt(sAttrib.value);
                break;
              case 'survival':
                sklMod.survival = sklMod.survival += parseInt(sAttrib.value);
                break;
              case 'comtech':
                sklMod.comtech = sklMod.comtech += parseInt(sAttrib.value);
                break;

              default:
                break;
            }
          }
        }
        setProperty(actorData, 'data.header.health.mod', (data.header.health.mod = parseInt(attrMod.health || 0)));
        if (actorData.type === 'character') {
          setProperty(actorData, 'data.header.stress.mod', (data.header.stress.mod = parseInt(attrMod.stress || 0)));
        }
      }
    }

    for (let [a, abl] of Object.entries(data.attributes)) {
      let target = `data.attributes.${a}.mod`;
      let field = data.attributes[a].mod;
      let upData = parseInt(abl.value || 0) + parseInt(attrMod[a] || 0);
      setProperty(actorData, target, (field = upData));

      // abl.mod = parseInt(abl.value || 0) + parseInt(attrMod[a] || 0);
      abl.label = CONFIG.ALIENRPG.attributes[a];
    }

    for (let [s, skl] of Object.entries(data.skills)) {
      const conSkl = skl.ability;
      let target = `data.skills.${s}.mod`;
      let field = data.skills[s].mod;
      let upData = parseInt(skl.value || 0) + parseInt(actorData.data.attributes[conSkl].mod || 0) + parseInt(sklMod[s] || 0);
      setProperty(actorData, target, (field = upData));
      skl.label = CONFIG.ALIENRPG.skills[s];
    }
    // Loop through the items and update the actors AC
    let totalAc = 0;
    let totalWat = 0;
    let totalFood = 0;
    let totalAir = 0;
    let totalPower = 0;

    for (let i of actorData.items) {
      try {
        //  Update armor value fron items
        i.data.attributes.armorrating.value === true;
        i.data.attributes.armorrating.value = i.data.attributes.armorrating.value || 0;
        i.totalAc = parseInt(i.data.attributes.armorrating.value, 10);
        totalAc += i.totalAc;
        // data.actor.data.general.armor.value = totalAc;
      } catch {
        // data.actor.data.general.armor.value = totalAc;
      }

      try {
        //  Update water value fron items
        i.data.attributes.water.value === true;
        i.data.attributes.water.value = i.data.attributes.water.value || 0;
        i.totalWat = parseInt(i.data.attributes.water.value, 10);
        totalWat += i.totalWat;
        // data.actor.data.consumables.water.value = totalWat;
      } catch {
        // data.actor.data.consumables.water.value = totalWat;
      }
      try {
        //  Update food value fron items
        i.data.attributes.food.value === true;
        i.data.attributes.food.value = i.data.attributes.food.value || 0;
        i.totalFood = parseInt(i.data.attributes.food.value, 10);
        totalFood += i.totalFood;
        // data.actor.data.consumables.food.value = totalFood;
      } catch {
        // data.actor.data.consumables.food.value = totalFood;
      }
      try {
        //  Update air value fron items
        i.data.attributes.airsupply.value === true;
        i.data.attributes.airsupply.value = i.data.attributes.airsupply.value || 0;
        i.totalAir = parseInt(i.data.attributes.airsupply.value, 10);
        totalAir += i.totalAir;
        // data.actor.data.consumables.air.value = totalAir;
      } catch {
        // data.actor.data.consumables.air.value = totalAir;
      }
      try {
        //  Update air value fron items
        i.data.attributes.power.value === true;
        i.data.attributes.power.value = i.data.attributes.power.value || 0;
        i.totalPower = parseInt(i.data.attributes.power.value, 10);
        totalPower += i.totalPower;
        // data.actor.data.consumables.power.value = totalPower;
      } catch {
        // data.actor.data.consumables.power.value = totalPower;
      }
    }

    setProperty(actorData, 'data.consumables.water.value', (data.general.armor.value = totalWat));
    setProperty(actorData, 'data.consumables.food.value', (data.general.armor.value = totalFood));
    setProperty(actorData, 'data.consumables.air.value', (data.general.armor.value = totalAir));
    setProperty(actorData, 'data.consumables.power.value', (data.general.armor.value = totalPower));
    setProperty(actorData, 'data.general.armor.value', (data.general.armor.value = totalAc));
    // actorData.data.general.armor.value = totalAc;
  }

  _prepareVehicleData(data) {}
  _prepareCreatureData(data) {}
  _prepareTeritoryData(data) {}

  _prepareTokenImg() {
    if (game.settings.get('alienrpg', 'defaultTokenSettings')) {
      if (this.data.token.img == 'icons/svg/mystery-man.svg' && this.data.token.img != this.img) {
        this.data.token.img = this.img;
      }
    }
  }
  async rollAbility(actor, dataset) {
    // // console.log('alienrpgActor -> rollAbility -> dataset', dataset);
    let label = dataset.label;
    let r2Data = 0;
    let reRoll = false;
    game.alienrpg.rollArr.sCount = 0;
    if (dataset.roll) {
      let r1Data = parseInt(dataset.roll || 0) + parseInt(dataset.mod || 0);
      if (dataset.attr) {
        r1Data = parseInt(dataset.mod || 0);
      }
      if (actor.data.type === 'character') {
        reRoll = false;
        r2Data = actor.getRollData().stress;
      } else {
        reRoll = true;
        r2Data = 0;
      }
      let hostile = actor.data.data.type;
      let blind = false;
      if (dataset.spbutt === 'armor' && r1Data < 1) {
        return;
      } else if (dataset.spbutt === 'armor') {
        label = 'Armor';
        r2Data = 0;
        reRoll = true;
      }
      if (actor.data.token.disposition === -1) {
        // hostile = true;
        blind = true;
      }
      yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'));
      game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
    } else {
      if (dataset.panicroll) {
        // Roll against the panic table and push the roll to the chat log.
        let chatMessage = '';
        const table = game.tables.getName('Panic Table');
        // let aStress = actor.getRollData().stress;
        let aStress = actor.getRollData().stress + parseInt(actor.data.data.header.stress.mod);
        // // console.log('alienrpgActor -> rollAbility -> actor.data.data.header.stress.mod.value', actor.data.data.header.stress.mod);
        // // console.log('alienrpgActor -> rollAbility -> aStress', aStress);
        let modRoll = 'd6' + '+' + parseInt(aStress || 0);
        const roll = new Roll(modRoll);

        const customResults = table.roll({ roll });
        let oldPanic = actor.data.data.general.panic.lastRoll;

        if (customResults.roll.total >= 7 && actor.data.data.general.panic.value === 0) {
          actor.update({ 'data.general.panic.value': actor.data.data.general.panic.value + 1 });
        }

        chatMessage += '<h2 style=" color: #f71403; font-weight: bold;" >Panic Condition</h2>';
        chatMessage += `<h4><i>${table.data.description}</i></h4>`;

        let mPanic = customResults.roll.total < actor.data.data.general.panic.lastRoll;
        let pCheck = oldPanic + 1;
        if (actor.data.data.general.panic.value && mPanic) {
          actor.update({ 'data.general.panic.lastRoll': pCheck });

          chatMessage += `<h4  style="color: #f71403;font-weight: bolder"><i><b>Roll ${customResults.roll.total}   More Panic.</b> </i></h4>`;
          chatMessage += `<h4><i>PC's Panic level has increased by one step to <b style="color: #f71403;">Level ${pCheck}</b> (See page 104 of the Alien rule book.)</i></h4>`;
          switch (pCheck) {
            case 8:
              chatMessage += `<b>TREMBLE:</b>  You start to tremble uncontrollably. All skill rolls using AGILITY suffer a –2 modification until your panic stops.`;
              break;
            case 9:
              chatMessage += `<b>DROP ITEM:</b>  Whether by stress, confusion or the realization that you’re all going to die anyway, you drop a weapon or other important item—the GM decides which one. Your STRESS LEVEL increases by one.`;
              break;
            case 10:
              chatMessage += `<b>FREEZE:</b>  You’re frozen by fear or stress for one Round, losing your next slow action. Your STRESS LEVEL, and the STRESS LEVEL of all friendly PCs in SHORT range of you, increases by one`;
              break;
            case 11:
              chatMessage += `<b>SEEK COVER:</b>  You must use your next action to move away from danger and find a safe spot if possible. You are allowed to make a retreat roll (see page 93) if you have an enemy at ENGAGED range. Your STRESS LEVEL is decreased by one, but the STRESS LEVEL of all friendly PCs in SHORT range increases by one. After one Round, you can act normally.`;
              break;
            case 12:
              chatMessage += `<b>SCREAM:</b> You scream your lungs out for one Round, losing your next slow action. Your STRESS LEVEL is decreased by one, but every friendly character who hears your scream must make an immediate Panic Roll.`;
              break;
            case 13:
              chatMessage += `<b>FLEE:</b>  You just can’t take it anymore. You must flee to a safe place and refuse to leave it. You won’t attack anyone and won’t attempt anything dangerous. You are not allowed to make a retreat roll (see page 93) if you have an enemy at ENGAGED range when you flee. Your STRESS LEVEL is decreased by one, but every friendly character who sees you run must make an immediate Panic Roll.`;
              break;
            case 14:
              chatMessage += `<b>BERSERK:</b>  You must immediately attack the nearest person or creature, friendly or not. You won’t stop until you or the target is Broken. Every friendly character who witnesses your rampage must make an immediate Panic Roll`;
              break;
            default:
              chatMessage += `<b>CATATONIC:</b>  You collapse to the floor and can’t talk or move, staring blankly into oblivion.`;
              break;
          }
        } else {
          actor.update({ 'data.general.panic.lastRoll': customResults.roll.total });

          chatMessage += `<h4><i><b>Roll ${customResults.roll.total} </b></i></h4>`;
          chatMessage += `${customResults.results[0].text}`;
          if (customResults.roll.total >= 7) {
            chatMessage +=
              `<h4 style="color: #f71403;"><i><b>` + game.i18n.localize('ALIENRPG.YouAreAtPanic') + ` <b>` + game.i18n.localize('ALIENRPG.Level') + ` ${customResults.roll.total}</b></i></h4>`;
          }
        }
        let trauma = customResults.roll.total >= 13 || pCheck >= 13;
        if (trauma) {
          chatMessage += `<h4><b>` + game.i18n.localize('ALIENRPG.PermanantTrauma') + `<i>(` + game.i18n.localize('ALIENRPG.Seepage106') + `) </i></h4></b>`;
        }
        ChatMessage.create({ user: game.user._id, content: chatMessage, other: game.users.entities.filter((u) => u.isGM).map((u) => u._id), type: CONST.CHAT_MESSAGE_TYPES.OTHER });
      }
    }
  }

  async nowRollItem(item, event) {
    if (item.type === 'weapon' || item.type === 'armor') {
      // console.log('alienrpgActor -> rollItemMod -> event', event);

      // Trigger the item roll
      return item.roll(false);
    }
  }

  async rollAbilityMod(actor, dataset) {
    // // console.log('alienrpgActor -> rollAbilityMod -> actor, dataset', actor, dataset);
    let label = dataset.label;
    let r2Data = 0;
    let reRoll = false;
    game.alienrpg.rollArr.sCount = 0;
    if (dataset.roll) {
      let r1Data = parseInt(dataset.roll || 0) + parseInt(dataset.mod || 0);
      if (dataset.attr) {
        r1Data = parseInt(dataset.mod || 0);
      }
      if (actor.data.type === 'character') {
        r2Data = actor.getRollData().stress;
        reRoll = false;
      } else {
        r2Data = 0;
        reRoll = true;
      }
      let hostile = actor.data.data.type;
      let blind = false;
      if (dataset.spbutt === 'armor' && r1Data < 1) {
        return;
      } else if (dataset.spbutt === 'armor') {
        label = 'Armor';
        r2Data = 0;
      }

      if (actor.data.token.disposition === -1) {
        // hostile = true;
        blind = true;
      }

      // callpop upbox here to get any mods then update r1Data or rData as appropriate.
      let confirmed = false;
      if (actor.data.type === 'character') {
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
              r1Data = r1Data + modifier;
              r2Data = r2Data + stressMod;
              yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'));
              game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
            }
          },
        }).render(true);
      } else if (actor.data.type === 'synthetic') {
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
              r1Data = r1Data + modifier;
              r2Data = 0;
              yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'));
              game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
            }
          },
        }).render(true);
      }
    } else if (dataset.panicroll) {
      // Roll against the panic table and push the roll to the chat log.
      let confirmed = false;
      new Dialog({
        title: `Roll Modified ${label} check`,
        content: `
         <p>Please enter your modifier.</p>
         <form>
          <div class="form-group">
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
            let stressMod = parseInt(html.find('[name=stressMod]')[0].value);
            let chatMessage = '';
            const table = game.tables.getName('Panic Table');
            let aStress = actor.getRollData().stress + parseInt(actor.data.data.header.stress.mod);
            let modRoll = 'd6' + '+' + (parseInt(stressMod || 0) + parseInt(aStress || 0));
            const roll = new Roll(modRoll);
            const customResults = table.roll({ roll });
            let oldPanic = actor.data.data.general.panic.lastRoll;
            if (customResults.roll.total >= 7 && actor.data.data.general.panic.value === 0) {
              actor.update({ 'data.general.panic.value': actor.data.data.general.panic.value + 1 });
            }

            chatMessage += '<h2 style=" color: #f71403; font-weight: bold;" >Panic Condition</h2>';
            chatMessage += `<h4><i>${table.data.description}</i></h4>`;

            let mPanic = customResults.roll.total < actor.data.data.general.panic.lastRoll;
            let pCheck = oldPanic + 1;
            if (actor.data.data.general.panic.value && mPanic) {
              actor.update({ 'data.general.panic.lastRoll': pCheck });

              chatMessage += `<h4  style="color: #f71403;font-weight: bolder"><i><b>Roll ${customResults.roll.total}   More Panic.</b> </i></h4>`;
              chatMessage += `<h4><i>PC's Panic level has increased by one step to <b style="color: #f71403;">Level ${pCheck}</b> (See page 104 of the Alien rule book.)</i></h4>`;
              switch (pCheck) {
                case 8:
                  chatMessage += `<b>TREMBLE:</b>  You start to tremble uncontrollably. All skill rolls using AGILITY suffer a –2 modification until your panic stops.`;
                  break;
                case 9:
                  chatMessage += `<b>DROP ITEM:</b>  Whether by stress, confusion or the realization that you’re all going to die anyway, you drop a weapon or other important item—the GM decides which one. Your STRESS LEVEL increases by one.`;
                  break;
                case 10:
                  chatMessage += `<b>FREEZE:</b>  You’re frozen by fear or stress for one Round, losing your next slow action. Your STRESS LEVEL, and the STRESS LEVEL of all friendly PCs in SHORT range of you, increases by one`;
                  break;
                case 11:
                  chatMessage += `<b>SEEK COVER:</b>  You must use your next action to move away from danger and find a safe spot if possible. You are allowed to make a retreat roll (see page 93) if you have an enemy at ENGAGED range. Your STRESS LEVEL is decreased by one, but the STRESS LEVEL of all friendly PCs in SHORT range increases by one. After one Round, you can act normally.`;
                  break;
                case 12:
                  chatMessage += `<b>SCREAM:</b> You scream your lungs out for one Round, losing your next slow action. Your STRESS LEVEL is decreased by one, but every friendly character who hears your scream must make an immediate Panic Roll.`;
                  break;
                case 13:
                  chatMessage += `<b>FLEE:</b>  You just can’t take it anymore. You must flee to a safe place and refuse to leave it. You won’t attack anyone and won’t attempt anything dangerous. You are not allowed to make a retreat roll (see page 93) if you have an enemy at ENGAGED range when you flee. Your STRESS LEVEL is decreased by one, but every friendly character who sees you run must make an immediate Panic Roll.`;
                  break;
                case 14:
                  chatMessage += `<b>BERSERK:</b>  You must immediately attack the nearest person or creature, friendly or not. You won’t stop until you or the target is Broken. Every friendly character who witnesses your rampage must make an immediate Panic Roll`;
                  break;
                default:
                  chatMessage += `<b>CATATONIC:</b>  You collapse to the floor and can’t talk or move, staring blankly into oblivion.`;
                  break;
              }
            } else {
              actor.update({ 'data.general.panic.lastRoll': customResults.roll.total });

              chatMessage += `<h4><i><b>Roll ${customResults.roll.total} </b></i></h4>`;
              chatMessage += `${customResults.results[0].text}`;
              if (customResults.roll.total >= 7) {
                chatMessage +=
                  `<h4 style="color: #f71403;"><i><b>` + game.i18n.localize('ALIENRPG.YouAreAtPanic') + ` <b>` + game.i18n.localize('ALIENRPG.Level') + ` ${customResults.roll.total}</b></i></h4>`;
              }
            }
            let trauma = customResults.roll.total >= 13 || pCheck >= 13;
            if (trauma) {
              chatMessage += `<h4><b>` + game.i18n.localize('ALIENRPG.PermanantTrauma') + `<i>(` + game.i18n.localize('ALIENRPG.Seepage106') + `) </i></h4></b>`;
            }
            ChatMessage.create({ user: game.user._id, content: chatMessage, other: game.users.entities.filter((u) => u.isGM).map((u) => u._id), type: CONST.CHAT_MESSAGE_TYPES.OTHER });
          }
        },
      }).render(true);
    } else {
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
            r1Data = r1Data + modifier;
            r2Data = 0;
            yze.yzeRoll(hostile, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'));
            game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
          }
        },
      }).render(true);
    }
  }

  async rollItemMod(item, event) {
    if (item.type === 'weapon') {
      // console.log('alienrpgActor -> rollItemMod -> event', event);

      // Trigger the item roll
      return item.roll(true);
    }
  }
  async stressChange(actor, dataset) {
    switch (dataset.pmbut) {
      case 'minusStress':
        actor.update({ 'data.header.stress.value': actor.data.data.header.stress.value - 1 });
        break;
      case 'plusStress':
        actor.update({ 'data.header.stress.value': actor.data.data.header.stress.value + 1 });
        break;
      case 'minusHealth':
        actor.update({ 'data.header.health.value': actor.data.data.header.health.value - 1 });
        break;
      case 'plusHealth':
        actor.update({ 'data.header.health.value': actor.data.data.header.health.value + 1 });
        break;

      default:
        break;
    }
  }

  async checkMarks(actor, event) {
    const field = $(event.currentTarget).siblings('input[type="hidden"]');
    // // console.log('alienrpgActor -> checkMarks -> field', field);
    const max = field.data('max') == undefined ? 4 : field.data('max');
    const statIsItemType = field.data('stat-type') == undefined ? false : field.data('stat-type'); // Get the current level and the array of levels
    const level = parseFloat(field.val());
    let newLevel = ''; // Toggle next level - forward on click, backwards on right

    if (event.type === 'click') {
      newLevel = Math.clamped(level + 1, 0, max);
    } else if (event.type === 'contextmenu') {
      newLevel = Math.clamped(level - 1, 0, max);
      if (field[0].name === 'data.general.panic.value') {
        actor.update({ 'data.general.panic.lastRoll': 0 });
      }
    } // Update the field value and save the form
    field.val(newLevel);
    return event;
  }

  async consumablesCheck(actor, consUme, label, consumables) {
    let r1Data = 0;
    let r2Data = 0;
    r2Data = actor.data.data.consumables[`${consUme}`].value;
    let reRoll = true;
    // let hostile = this.actor.data.data.type;
    let blind = false;

    if (actor.data.token.disposition === -1) {
      blind = true;
    }
    if (r2Data <= 0) {
      return ui.notifications.warn(game.i18n.localize('ALIENRPG.NoSupplys'));
    } else {
      yze.yzeRoll('supply', blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'));
      if (game.alienrpg.rollArr.r2One) {
        let itemId = consumables.find(showme)[0].item;
        let itemVal = consumables.find(showme)[0][`${consUme}`];
        let mitem = actor.getOwnedItem(itemId);
        let field = '';
        switch (consUme) {
          case 'air':
            field = `data.attributes.airsupply.value`;
            await mitem.update({ [field]: itemVal - game.alienrpg.rollArr.r2One });
            await actor.update({ 'data.consumables.air.value': actor.data.data.consumables.air.value - game.alienrpg.rollArr.r2One });
            break;
          case 'food':
            field = `data.attributes.${consUme}.value`;
            await mitem.update({ [field]: itemVal - game.alienrpg.rollArr.r2One });
            await actor.update({ 'data.consumables.food.value': actor.data.data.consumables.food.value - game.alienrpg.rollArr.r2One });
            break;
          case 'power':
            field = `data.attributes.${consUme}.value`;
            await mitem.update({ [field]: itemVal - game.alienrpg.rollArr.r2One });
            await actor.update({ 'data.consumables.power.value': actor.data.data.consumables.power.value - game.alienrpg.rollArr.r2One });
            break;
          case 'water':
            field = `data.attributes.${consUme}.value`;
            await mitem.update({ [field]: itemVal - game.alienrpg.rollArr.r2One });
            await actor.update({ 'data.consumables.water.value': actor.data.data.consumables.water.value - game.alienrpg.rollArr.r2One });
            break;
        }
      }
    }

    function showme(consumables) {
      // console.warn('alienrpgActorSheet -> showme -> ', consumables[0][consUme] >= 1);
      return consumables[0][consUme] >= 1;
    }
  }
}
export default alienrpgActor;
