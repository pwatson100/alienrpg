import { yze } from '../YZEDiceRoller.js';
import { addSign } from '../utils.js';
import { ALIENRPG } from '../config.js';

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
      // delete data.attributes;
    }
    if (!!shorthand) {
      for (let [k, v] of Object.entries(data.header)) {
        if (!(k in data)) data[k] = v.value;
      }
      // delete data.header;
    }
    if (!!shorthand) {
      for (let [k, v] of Object.entries(data.general)) {
        if (!(k in data)) data[k] = v.value;
      }
      // delete data.general;
    }
    if (this.data.type === 'character' || this.data.type === 'synthetic') {
      if (!!shorthand) {
        for (let [k, v] of Object.entries(data.skills)) {
          if (!(k in data)) data[k] = v.value;
        }
        // delete data.skills;
      }
    }

    // Map all items data using their slugified names
    data.items = this.data.items.reduce((obj, i) => {
      let key = i.name.slugify({ strict: true });
      let itemData = duplicate(i.data);
      if (itemData.skill) {
        return;
      }
      if (!!shorthand && !!itemData.skill) {
        for (let [k, v] of Object.entries(itemData.attributes)) {
          if (!(k in itemData)) itemData[k] = v.value;
        }
        // delete itemData['attributes'];
      }
      obj[key] = itemData;
      return obj;
    }, {});
    return data;
  }

  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    const actorData = this.data;
    // console.log('🚀 ~ file: actor.js ~ line 69 ~ alienrpgActor ~ prepareBaseData ~ actorData', actorData);
    const data = actorData.data;
    const flags = actorData.flags;

    if (actorData.type === 'character') this._prepareCharacterData(actorData, flags);
    else if (actorData.type === 'synthetic') this._prepareCharacterData(actorData, flags);
    else if (actorData.type === 'vehicles') this._prepareVehicleData(data);
    else if (actorData.type === 'spacecraft') this._prepareVehicleData(data);
    else if (actorData.type === 'creature') this._prepareCreatureData(data);
    else if (actorData.type === 'territory') this._prepareTeritoryData(data);
  }

  /**
   * Prepare Character type specific data
   */

  _prepareCharacterData(actorData) {
    super.prepareDerivedData();

    const data = actorData.data;
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
    // debugger;
    for (let [skey, iAttrib] of Object.entries(actorData.items.contents)) {
      // console.log('🚀 ~ file: actor.js ~ line 110 ~ alienrpgActor ~ _prepareCharacterData ~ Attrib', actorData);
      const Attrib = iAttrib.data;
      // debugger;
      if (Attrib.type === 'item' || Attrib.type === 'critical-injury' || Attrib.type === 'armor') {
        if (Attrib.data.header.active === true) {
          let base = Attrib.data.modifiers.attributes;
          // console.log('🚀 ~ file: actor.js ~ line 104 ~ alienrpgActor ~ _prepareCharacterData ~ base', base);
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
          for (let [skkey, sAttrib] of Object.entries(skillBase)) {
            switch (skkey) {
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
        setProperty(actorData, 'data.header.health.mod', (data.header.health.mod += parseInt(attrMod.health || 0)));
        // actorData.update({ 'data.header.health.mod': (actorData.data.header.health.mod = parseInt(attrMod.health || 0)) });

        if (actorData.type === 'character') {
          // actorData.update({ 'data.header.stress.mod': (actorData.data.header.stress.mod = parseInt(attrMod.stress || 0)) });

          setProperty(actorData, 'data.header.stress.mod', (data.header.stress.mod += parseInt(attrMod.stress || 0)));
        }
      }

      if (Attrib.type === 'talent') {
        const talName = Attrib.name.toUpperCase();
        let aId = Attrib._id;
        switch (talName) {
          case 'NERVES OF STEEL':
            // actorData.update({ 'data.header.stress.mod': (actorData.data.header.stress.mod -= 2) });

            setProperty(actorData, 'data.header.stress.mod', (data.header.stress.mod -= 2));
            break;
          case 'TOUGH':
            setProperty(actorData, 'data.header.health.mod', (data.header.health.mod += 2));

            // actorData.update({ 'data.header.health.value': (actorData.data.header.health.value += 2) });
            break;

          // case 'TOUGH':
          //   console.log('🚀 ~ file: actor.js ~ line 228 ~ alienrpgActor ~ _prepareCharacterData ~ flags.tough', flags.tough);
          //   setProperty(actorData, 'data.header.health.value', (data.header.health.value += 2));
          //   console.log('🚀 ~ file: actor.js ~ line 228 ~ alienrpgActor ~ _prepareCharacterData ~ flags.tough', flags.tough);
          //   break;

          default:
            break;
        }
      }
    }

    for (let [a, abl] of Object.entries(data.attributes)) {
      let target = `data.attributes.${a}.mod`;
      let field = actorData.data.attributes[a].mod;
      let upData = parseInt(abl.value || 0) + parseInt(attrMod[a] || 0);
      // actorData.update({ [target]: (field = upData) });
      setProperty(actorData, target, (field = upData));
      abl.mod = parseInt(abl.value || 0) + parseInt(attrMod[a] || 0);
      abl.label = CONFIG.ALIENRPG.attributes[a];
    }

    for (let [s, skl] of Object.entries(data.skills)) {
      const conSkl = skl.ability;
      let target = `data.skills.${s}.mod`;
      let field = actorData.data.skills[s].mod;
      let upData = parseInt(skl.value || 0) + parseInt(actorData.data.attributes[conSkl].mod || 0) + parseInt(sklMod[s] || 0);
      // actorData.update({ [target]: (field = upData) });
      setProperty(actorData, target, (field = upData));
      skl.label = CONFIG.ALIENRPG.skills[s];
    }
    // Loop through the items and update the actors AC
    let totalAc = 0;
    let totalWat = 0;
    let totalFood = 0;
    let totalAir = 0;
    let totalPower = 0;

    for (let i of actorData.items.contents) {
      // debugger;
      try {
        //  Update armor value fron items
        i.data.data.attributes.armorrating.value === true;

        if (i.data.data.header.active === true) {
          i.data.data.attributes.armorrating.value && i.data.data.header;
          i.data.data.attributes.armorrating.value = i.data.data.attributes.armorrating.value || 0;
          i.totalAc = parseInt(i.data.data.attributes.armorrating.value, 10);
          totalAc += i.totalAc;
        }
      } catch {}

      try {
        //  Update water value fron items
        i.data.data.attributes.water.value === true;
        if (i.data.data.header.active === true) {
          i.data.data.attributes.water.value = i.data.data.attributes.water.value || 0;
          i.totalWat = parseInt(i.data.data.attributes.water.value, 10);
          totalWat += i.totalWat;
        }
      } catch {}
      try {
        //  Update food value fron items
        i.data.data.attributes.food.value === true;
        if (i.data.data.header.active === true) {
          i.data.data.attributes.food.value = i.data.data.attributes.food.value || 0;
          i.totalFood = parseInt(i.data.data.attributes.food.value, 10);
          totalFood += i.totalFood;
        }
      } catch {}
      try {
        //  Update air value fron items
        i.data.data.attributes.airsupply.value === true;
        if (i.data.data.header.active === true) {
          i.data.data.attributes.airsupply.value = i.data.data.attributes.airsupply.value || 0;
          i.totalAir = parseInt(i.data.data.attributes.airsupply.value, 10);
          totalAir += i.totalAir;
        }
      } catch {}
      try {
        //  Update air value fron items
        i.data.data.attributes.power.value === true;
        if (i.data.data.header.active === true) {
          i.data.data.attributes.power.value = i.data.data.attributes.power.value || 0;
          i.totalPower = parseInt(i.data.data.attributes.power.value, 10);
          totalPower += i.totalPower;
        }
      } catch {}
    }

    setProperty(actorData, 'data.consumables.water.value', (data.consumables.water.value = totalWat));
    // actorData.update({ 'data.consumables.water.value': (actorData.data.consumables.water.value = parseInt(totalWat || 0)) });

    setProperty(actorData, 'data.consumables.food.value', (data.consumables.food.value = totalFood));
    // actorData.update({ 'data.consumables.food.value': (actorData.data.consumables.food.value = parseInt(totalFood || 0)) });

    setProperty(actorData, 'data.consumables.air.value', (data.consumables.air.value = totalAir));
    // actorData.update({ 'data.consumables.air.value': (actorData.data.consumables.air.value = parseInt(totalAir || 0)) });

    setProperty(actorData, 'data.consumables.power.value', (data.consumables.power.value = totalPower));
    // actorData.update({ 'data.consumables.power.value': (actorData.data.consumables.power.value = parseInt(totalPower || 0)) });

    setProperty(actorData, 'data.general.armor.value', (data.general.armor.value = totalAc));
    // actorData.update({ 'data.general.armor.value': (actorData.data.general.armor.value = parseInt(totalAc || 0)) });

    setProperty(actorData, 'data.general.radiation.calculatedMax', (data.general.radiation.calculatedMax = data.general.radiation.max));

    setProperty(actorData, 'data.general.xp.calculatedMax', (data.general.xp.calculatedMax = data.general.xp.max));

    setProperty(actorData, 'data.general.sp.calculatedMax', (data.general.sp.calculatedMax = data.general.sp.max));

    setProperty(actorData, 'data.general.starving.calculatedMax', (data.general.starving.calculatedMax = data.general.starving.max));

    setProperty(actorData, 'data.general.dehydrated.calculatedMax', (data.general.dehydrated.calculatedMax = data.general.dehydrated.max));

    setProperty(actorData, 'data.general.exhausted.calculatedMax', (data.general.exhausted.calculatedMax = data.general.exhausted.max));

    setProperty(actorData, 'data.general.freezing.calculatedMax', (data.general.freezing.calculatedMax = data.general.freezing.max));

    if (actorData.type === 'character') {
      setProperty(actorData, 'data.general.panic.calculatedMax', (data.general.panic.calculatedMax = data.general.panic.max));
    }

    setProperty(actorData, 'data.header.health.max', (data.header.health.max = data.attributes.str.value + data.header.health.mod));

    if (this.hasCondition('overwatch')) {
      setProperty(actorData, 'data.general.overwatch', true);
    } else {
      setProperty(actorData, 'data.general.overwatch', false);
    }
  }

  _prepareVehicleData(data) {}
  _prepareCreatureData(actorData) {
    // super.prepareDerivedData();
    // console.log('🚀 ~ file: actor.js ~ line 268 ~ alienrpgActor ~ _prepareCreatureData ~ data', actorData);
    // // this.actor.update({ 'data.header.health.tmp': this.actor.data.data.header.health.value });
    // if (actorData.header.health.max === 0 || actorData.header.health.value > actorData.header.health.max) {
    //   // this.actor.update({ 'data.header.health.max': this.actor.data.data.header.health.value });
    //   setProperty(actorData, 'actorData.health.max', (actorData.header.health.max = actorData.header.health.value));
    // }
  }
  _prepareTeritoryData(data) {
    this.data.img = 'systems/alienrpg/images/icons/nested-eclipses.svg';
  }

  _prepareTokenImg() {
    if (game.settings.get('alienrpg', 'defaultTokenSettings')) {
      if (this.data.token.img == 'icons/svg/mystery-man.svg' && this.data.token.img != this.img) {
        this.data.token.img = this.img;
      }
    }
  }

  // *************************************************
  // Setupthe prototype token
  // *************************************************
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);
    let tokenProto = {
      'token.displayName': CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
      'token.displayBars': CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
      'token.disposition': CONST.TOKEN_DISPOSITIONS.FRIENDLY,
      'token.name': `${data.name}`,
      'token.bar1': { attribute: 'header.health' },
      'token.bar2': { attribute: 'None' },
      'token.vision': true,
      'token.actorLink': true,
    };
    if (game.settings.get('alienrpg', 'defaultTokenSettings')) {
      switch (data.type) {
        case 'character':
          tokenProto['token.bar2'] = { attribute: 'header.stress' };
          break;
        case 'vehicles':
          tokenProto['token.bar1'] = { attribute: 'None' };
          break;
        case 'creature':
          tokenProto['token.actorLink'] = false;
          tokenProto['token.disposition'] = CONST.TOKEN_DISPOSITIONS.HOSTILE;
          break;
        case 'synthetic':
          break;
        case 'territory':
          tokenProto['token.bar1'] = { attribute: 'None' };
          tokenProto['token.img'] = 'systems/alienrpg/images/icons/nested-eclipses.svg';
          break;
      }
    }
    this.data.update(tokenProto);
  }

  async rollAbility(actor, dataset) {
    let label = dataset.label;
    let r2Data = 0;
    let reRoll = false;
    let effectiveActorType = actor.data.type;
    game.alienrpg.rollArr.sCount = 0;
    game.alienrpg.rollArr.multiPush = 0;

    let modifier = parseInt(dataset?.mod ?? 0) + parseInt(dataset?.modifier ?? 0);
    let stressMod = parseInt(dataset?.stressMod ?? 0);

    // the dataset value is returned to the DOM so it should be set to 0 in case a future roll is made without the
    // modifier dialog.

    dataset.modifier = 0;
    dataset.stressMod = 0;

    // console.log('🚀 ~ file: actor.js ~ line 397 ~ alienrpgActor ~ rollAbility ~ dataset.roll', dataset.roll);
    if (dataset.roll) {
      let r1Data = parseInt(dataset.roll || 0) + parseInt(modifier);
      if (dataset.attr) {
        r1Data = parseInt(modifier);
      }
      // console.log('🚀 ~ file: actor.js ~ line 395 ~ alienrpgActor ~ rollAbility ~ r1Data', r1Data);

      reRoll = true;
      r2Data = 0;

      if (actor.data.type === 'character') {
        reRoll = false;
        r2Data = actor.getRollData().stress + parseInt(stressMod);
      } else if (actor.data.type === 'synthetic') {
        if (actor.data.data.header.synthstress) {
          effectiveActorType = 'character'; // make rolls look human
          r2Data = parseInt(stressMod);
          reRoll = false;
        }
      }

      let blind = false;
      if (dataset.spbutt === 'armor' && r1Data < 1 && !dataset.armorP && !dataset.armorDou) {
        return;
      } else if (dataset.spbutt === 'armor') {
        label = 'Armor';
        r2Data = 0;
        reRoll = true;
        if (dataset.armorP === 'true') {
          r1Data = parseInt(r1Data / 2);
          dataset.armorP = 'false';
        }
        if (dataset.armorDou === 'true') {
          r1Data = parseInt(r1Data * 2);
          dataset.armorDou = 'false';
        }
      }

      if (label === 'Radiation') {
        r2Data = 0;
        reRoll = true;
        r1Data += 1;
      }
      // if (actor.data.token.disposition === -1) {
      //   blind = true;
      // }

      yze.yzeRoll(effectiveActorType, blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actor.id);
      game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
    } else {
      if (dataset.panicroll) {
        // Roll against the panic table and push the roll to the chat log.
        let chatMessage = '';
        const table = game.tables.getName('Panic Table');
        // let aStress = actor.getRollData().stress;

        let rollModifier = parseInt(modifier) + parseInt(stressMod);
        // console.log('🚀 ~ file: actor.js ~ line 432 ~ alienrpgActor ~ rollAbility ~ rollModifier', rollModifier);

        let aStress = 0;

        if (actor.data.type === 'synthetic') {
          if (!actor.data.data.header.synthstress) return;

          actor.data.data.header.stress = new Object({ mod: '0' });
          actor.data.data.general.panic = new Object({ lastRoll: '0', value: '0' });
          aStress = 0;
        } else aStress = actor.getRollData().stress + rollModifier;
        // } else aStress = actor.getRollData().stress + rollModifier + parseInt(actor.data.data.header.stress.mod);
        // console.log('🚀 ~ file: actor.js ~ line 443 ~ alienrpgActor ~ rollAbility ~ aStress', aStress);

        let modRoll = '1d6' + '+' + parseInt(aStress);
        console.warn('rolling stress', modRoll);
        const roll = new Roll(modRoll);
        roll.evaluate({ async: false });
        const customResults = await table.roll({ roll });
        let oldPanic = actor.data.data.general.panic.lastRoll;

        if (customResults.roll.total >= 7 && actor.data.data.general.panic.value === 0) {
          this.causePanic(actor);
        }

        chatMessage +=
          '<h2 style=" color: #f71403; font-weight: bold;" class="ctooltip">' +
          game.i18n.localize('ALIENRPG.PanicCondition') +
          ' ' +
          addSign(aStress).toString() +
          '<span class="ctooltiptext">' +
          game.i18n.localize('ALIENRPG.Stress') +
          ' + (' +
          (actor.getRollData().stress || 0) +
          ') <br>+ ' +
          game.i18n.localize('ALIENRPG.StressMod') +
          ' + (' +
          stressMod +
          ') <br>+ ' +
          game.i18n.localize('ALIENRPG.Talent-Crit') +
          ' + (' +
          modifier +
          ')' +
          '</span></h2>';

        let mPanic = customResults.roll.total < actor.data.data.general.panic.lastRoll;

        let pCheck = oldPanic + 1;
        if (actor.data.data.general.panic.value && mPanic) {
          actor.update({ 'data.general.panic.lastRoll': pCheck });

          chatMessage +=
            '<h4 style="font-weight: bolder"><i><b>' +
            game.i18n.localize('ALIENRPG.Roll') +
            ' ' +
            `${customResults.roll.total}` +
            ' ' +
            '<span style="color: #f71403;font-weight: bolder"><i><b>' +
            game.i18n.localize('ALIENRPG.MorePanic') +
            '</span></b></i></span></h4>';

          chatMessage +=
            '<h4><i>' +
            game.i18n.localize('ALIENRPG.PCPanicLevel') +
            '<b style="color: #f71403;">' +
            game.i18n.localize('ALIENRPG.Level') +
            ' ' +
            `${pCheck}` +
            ' ' +
            game.i18n.localize('ALIENRPG.Seepage104') +
            '</b></i></h4>';

          chatMessage += this.morePanic(pCheck);
        } else {
          if (actor.data.type === 'character') actor.update({ 'data.general.panic.lastRoll': customResults.roll.total });
          pCheck = customResults.roll.total;
          chatMessage += '<h4><i><b>' + game.i18n.localize('ALIENRPG.Roll') + ' ' + `${pCheck}` + ' </b></i></h4>';
          // chatMessage += game.i18n.localize(`ALIENRPG.${customResults.results[0].text}`);
          chatMessage += this.morePanic(pCheck);
          if (customResults.roll.total >= 7) {
            chatMessage += `<h4 style="color: #f71403;"><i><b>` + game.i18n.localize('ALIENRPG.YouAreAtPanic') + ` <b>` + game.i18n.localize('ALIENRPG.Level') + ` ${pCheck}</b></i></h4>`;
          }
        }
        let trauma = customResults.roll.total >= 13 || pCheck >= 13;
        if (trauma) {
          chatMessage += `<h4><b>` + game.i18n.localize('ALIENRPG.PermanantTrauma') + `<i>(` + game.i18n.localize('ALIENRPG.Seepage106') + `) </i></h4></b>`;
        }

        let rollMode = game.settings.get('core', 'rollMode');
        let whispertarget = [];

        if (rollMode == 'gmroll' || rollMode == 'blindroll') {
          whispertarget = game.users.contents.filter((u) => u.isGM).map((u) => u._id);
        } else if (rollMode == 'selfroll') {
          whispertarget = game.users.contents.filter((u) => u.isGM).map((u) => u._id);
          whispertarget.push(game.user._id);
        }

        let blind = false;
        if (rollMode == 'blindroll') {
          blind = true;
          if (!game.user.isGM) {
            function SelfMessage(content, sound) {
              let selftarget = [];
              selftarget.push(game.user._id);

              ChatMessage.create({ speaker: { actor: actor.id }, content, whisper: selftarget, type: CONST.CHAT_MESSAGE_TYPES.OTHER, sound, blind: false });
            }

            SelfMessage('<h2 style=" color: #f71403; font-weight: bold;" >' + game.i18n.localize('ALIENRPG.PanicCondition') + addSign(aStress).toString() + ' ???</h2>', CONFIG.sounds.dice);
          }
        }

        ChatMessage.create({
          speaker: {
            actor: actor.id,
          },

          content: chatMessage,
          whisper: whispertarget,
          roll: customResults.roll,
          type: CONST.CHAT_MESSAGE_TYPES.ROLL,
          sound: CONFIG.sounds.dice,
          blind,
        });
      }
    }
  }

  async rollAbilityMod(actor, dataset) {
    function myRenderTemplate(template) {
      let confirmed = false;
      let armorP = false;
      let armorDou = false;
      switch (dataset.spbutt) {
        case 'armorVfire':
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
                four: {
                  icon: '<i class="fas fa-times"></i>',
                  label: game.i18n.localize('ALIENRPG.DialCancel'),
                  callback: () => (confirmed = false),
                },
              },
              default: 'one',
              close: (html) => {
                if (confirmed || armorP || armorDou) {
                  let modifier = parseInt(html.find('[name=modifier]')[0]?.value);
                  let stressMod = html.find('[name=stressMod]')[0]?.value;

                  if (stressMod == 'undefined') {
                    stressMod = 0;
                  } else stressMod = parseInt(stressMod);
                  if (modifier == 'undefined') {
                    modifier = 0;
                  } else modifier = parseInt(modifier);
                  if (isNaN(modifier)) modifier = 0;
                  if (isNaN(stressMod)) stressMod = 0;
                  // console.log('🚀 ~ file: actor.js ~ line 575 ~ alienrpgActor ~ renderTemplate ~ stressMod', stressMod);

                  dataset.modifier = modifier;
                  dataset.stressMod = stressMod;
                  actor.rollAbility(actor, dataset);
                }
              },
            }).render(true);
          });

          break;
        case 'armor':
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
                  label: game.i18n.localize('ALIENRPG.ArmorPiercing'),
                  callback: () => (armorP = true),
                },
                three: {
                  label: game.i18n.localize('ALIENRPG.ArmorDoubled'),
                  callback: () => (armorDou = true),
                },
                four: {
                  icon: '<i class="fas fa-times"></i>',
                  label: game.i18n.localize('ALIENRPG.DialCancel'),
                  callback: () => (confirmed = false),
                },
              },
              default: 'one',
              close: (html) => {
                if (confirmed || armorP || armorDou) {
                  let modifier = parseInt(html.find('[name=modifier]')[0]?.value);
                  let stressMod = html.find('[name=stressMod]')[0]?.value;

                  if (stressMod == 'undefined') {
                    stressMod = 0;
                  } else stressMod = parseInt(stressMod);
                  if (modifier == 'undefined') {
                    modifier = 0;
                  } else modifier = parseInt(modifier);
                  if (isNaN(modifier)) modifier = 0;
                  if (isNaN(stressMod)) stressMod = 0;
                  // console.log('🚀 ~ file: actor.js ~ line 575 ~ alienrpgActor ~ renderTemplate ~ stressMod', stressMod);

                  dataset.modifier = modifier;
                  dataset.stressMod = stressMod;
                  dataset.armorP = armorP;
                  dataset.armorDou = armorDou;
                  actor.rollAbility(actor, dataset);
                }
              },
            }).render(true);
          });

          break;

        default:
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
                four: {
                  icon: '<i class="fas fa-times"></i>',
                  label: game.i18n.localize('ALIENRPG.DialCancel'),
                  callback: () => (confirmed = false),
                },
              },
              default: 'one',
              close: (html) => {
                if (confirmed) {
                  let modifier = parseInt(html.find('[name=modifier]')[0]?.value);
                  let stressMod = html.find('[name=stressMod]')[0]?.value;

                  if (stressMod == 'undefined') {
                    stressMod = 0;
                  } else stressMod = parseInt(stressMod);
                  if (modifier == 'undefined') {
                    modifier = 0;
                  } else modifier = parseInt(modifier);
                  if (isNaN(modifier)) modifier = 0;
                  if (isNaN(stressMod)) stressMod = 0;
                  // console.log('🚀 ~ file: actor.js ~ line 575 ~ alienrpgActor ~ renderTemplate ~ stressMod', stressMod);

                  dataset.modifier = modifier;
                  dataset.stressMod = stressMod;
                  actor.rollAbility(actor, dataset);
                }
              },
            }).render(true);
          });

          break;
      }
    }

    if (dataset.roll) {
      // call pop up box here to get any mods then use standard RollAbility()
      // Check that is a character (and not armor) or a synth pretending to be a character.
      if ((actor.data.type === 'character' && dataset.spbutt != 'armor') || actor.data.data.header.synthstress) {
        myRenderTemplate('systems/alienrpg/templates/dialog/roll-all-dialog.html');
      } else if (actor.data.type === 'synthetic') {
        myRenderTemplate('systems/alienrpg/templates/dialog/roll-base-dialog.html');
      } else {
        myRenderTemplate('systems/alienrpg/templates/dialog/roll-base-dialog.html');
      }
    } else if (dataset.panicroll) {
      // Roll against the panic table and push the roll to the chat log.

      myRenderTemplate('systems/alienrpg/templates/dialog/roll-stress-dialog.html');
    }
  }

  async nowRollItem(item, event) {
    // if (item.type === 'weapon' || item.type === 'armor') {
    if (item.type === 'weapon') {
      // Trigger the item roll
      return item.roll(false);
    }
  }

  async rollItemMod(item, event) {
    if (item.type === 'weapon') {
      // Trigger the item roll
      return item.roll(true);
    }
  }

  async stressChange(actor, dataset) {
    switch (dataset.pmbut) {
      case 'minusStress':
        if (actor.data.data.header.stress.value <= 0) {
          actor.update({ 'data.header.stress.value': (actor.data.data.header.stress.value = 0) });
        } else {
          actor.update({ 'data.header.stress.value': actor.data.data.header.stress.value - 1 });
        }
        // actor.update({ 'data.header.stress.value': actor.data.data.header.stress.value - 1 });
        break;
      case 'plusStress':
        actor.update({ 'data.header.stress.value': actor.data.data.header.stress.value + 1 });
        break;
      case 'minusHealth':
        if (actor.data.data.header.health.value <= 0) {
          actor.update({ 'data.header.health.value': (actor.data.data.header.health.value = 0) });
        } else {
          actor.update({ 'data.header.health.value': actor.data.data.header.health.value - 1 });
        }
        // actor.update({ 'data.header.health.value': actor.data.data.header.health.value - 1 });
        break;
      case 'plusHealth':
        actor.update({ 'data.header.health.value': actor.data.data.header.health.value + 1 });
        break;

      default:
        break;
    }
  }

  async checkAndEndPanic(actor) {
    if (actor.data.type != 'character') return;

    if (actor.data.data.general.panic.lastRoll > 0) {
      actor.update({ 'data.general.panic.lastRoll': 0 });
      actor.removeCondition('panicked');
      ChatMessage.create({ speaker: { actor: actor.id }, content: 'Panic is over', type: CONST.CHAT_MESSAGE_TYPES.OTHER });
    }
  }

  async causePanic(actor) {
    actor.update({ 'data.general.panic.value': actor.data.data.general.panic.value + 1 });
    actor.addCondition('panicked');
  }
  async addCondition(effect) {
    if (typeof effect === 'string') effect = duplicate(ALIENRPG.conditionEffects.find((e) => e.id == effect));
    if (!effect) return 'No Effect Found';

    if (!effect.id) return 'Conditions require an id field';

    let existing = await this.hasCondition(effect.id);

    if (!existing) {
      effect.label = game.i18n.localize(effect.label);
      effect['flags.core.statusId'] = effect.id;
      delete effect.id;
      return this.createEmbeddedDocuments('ActiveEffect', [effect]);
    }
  }

  async removeCondition(effect) {
    if (typeof effect === 'string') effect = duplicate(ALIENRPG.conditionEffects.find((e) => e.id == effect));
    if (!effect) return 'No Effect Found';

    if (!effect.id) return 'Conditions require an id field';

    let existing = await this.hasCondition(effect.id);

    if (existing) {
      return existing.delete();
    }
  }

  async hasCondition(conditionKey) {
    let existing = this.effects.find((i) => i.getFlag('core', 'statusId') == conditionKey);
    return existing;
  }

  async checkMarks(actor, event) {
    const field = $(event.currentTarget).siblings('input[type="hidden"]');
    const max = field.data('max') == undefined ? 4 : field.data('max');
    const statIsItemType = field.data('stat-type') == undefined ? false : field.data('stat-type'); // Get the current level and the array of levels
    const level = parseFloat(field.val());
    let newLevel = ''; // Toggle next level - forward on click, backwards on right

    if (event.type === 'click') {
      newLevel = Math.clamped(level + 1, 0, max);
    } else if (event.type === 'contextmenu') {
      newLevel = Math.clamped(level - 1, 0, max);
      if (field[0].name === 'data.general.panic.value') {
        actor.checkAndEndPanic(actor);
      }
    } // Update the field value and save the form
    field.val(newLevel);
    return event;
  }

  async conCheckMarks(actor, event) {
    const field = $(event.currentTarget).siblings('input[type="hidden"]');
    const max = field.data('max') == undefined ? 4 : field.data('max');
    const statIsItemType = field.data('stat-type') == undefined ? false : field.data('stat-type'); // Get the current level and the array of levels
    const level = parseFloat(field.val());
    let newLevel = ''; // Toggle next level - forward on click, backwards on right
    let aTokens = '';

    if (event.type === 'click') {
      newLevel = Math.clamped(level + 1, 0, max);

      switch (field[0].name) {
        case 'data.general.starving.value':
          actor.addCondition('starving');
          break;

        case 'data.general.dehydrated.value':
          actor.addCondition('dehydrated');
          break;

        case 'data.general.exhausted.value':
          actor.addCondition('exhausted');
          break;

        case 'data.general.freezing.value':
          actor.addCondition('freezing');
          break;

        case 'data.general.radiation.value':
          actor.addCondition('radiation');
          actor.rollAbility(actor, event.currentTarget.dataset);

          break;

        default:
          break;
      }
    } else if (event.type === 'contextmenu') {
      newLevel = Math.clamped(level - 1, 0, max);
      // if (field[0].name === 'data.general.panic.value') {
      //   actor.checkAndEndPanic(actor);
      // }
      switch (field[0].name) {
        case 'data.general.starving.value':
          actor.removeCondition('starving');
          break;

        case 'data.general.dehydrated.value':
          actor.removeCondition('dehydrated');
          break;

        case 'data.general.exhausted.value':
          actor.removeCondition('exhausted');
          break;

        case 'data.general.freezing.value':
          actor.removeCondition('freezing');
          break;

        case 'data.general.radiation.value':
          if (actor.data.data.general.radiation.value <= 1) {
            actor.removeCondition('radiation');
          }
          break;

        default:
          break;
      }
    } // Update the field value and save the form
    field.val(newLevel);
    return event;
  }

  async consumablesCheck(actor, consUme, label, tItem) {
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
      yze.yzeRoll('supply', blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actor.id);
      // debugger;
      if (game.alienrpg.rollArr.r2One) {
        getItems(actor, consUme, tItem);
      }
    }

    async function getItems(aActor, aconsUme, atItem) {
      let bRoll = game.alienrpg.rollArr.r2One;
      let tNum = 0;
      let pValue = '';
      let pItem = '';
      let iConsUme = '';
      let field = `data.attributes.${aconsUme}.value`;
      let aField = `data.consumables.${aconsUme}.value`;

      if (aconsUme === 'power') {
        pItem = aActor.items.get(atItem);

        pValue = pItem.data.data.attributes.power.value ?? 0;
        field = `data.attributes.power.value`;
        if (pValue - game.alienrpg.rollArr.r2One <= '0') {
          await pItem.update({ [field]: '0' });
          await aActor.update({ 'data.consumables.power.value': aActor.data.data.consumables.power.value - pValue });
        } else {
          await pItem.update({ [field]: pValue - game.alienrpg.rollArr.r2One });
          await aActor.update({ 'data.consumables.power.value': aActor.data.data.consumables.power.value - game.alienrpg.rollArr.r2One });
        }
      } else {
        if (aconsUme === 'air') {
          iConsUme = 'airsupply';
          field = `data.attributes.${iConsUme}.value`;
        } else {
          iConsUme = aconsUme;
        }
        // while (bRoll > 0) {
        for (const key in aActor.data.items.contents) {
          if (bRoll <= 0) {
            break;
          }

          if (aActor.data.items.contents[key].type === 'item' && aActor.data.items.contents[key].data.data.header.active) {
            if (Object.hasOwnProperty.call(aActor.data.items.contents, key) && bRoll > 0) {
              let element = aActor.data.items.contents[key];
              if (element.data.data.attributes[iConsUme].value) {
                let mitem = aActor.items.get(element.data._id);
                let iVal = element.data.data.attributes[iConsUme].value;
                if (iVal - bRoll < 0) {
                  tNum = iVal;
                  // bRoll -= iVal;
                } else {
                  tNum = bRoll;
                }
                await mitem.update({ [field]: element.data.data.attributes[iConsUme].value - tNum });
              }
            }
            bRoll -= tNum;
          }

          if (aActor.data.items.contents[key].type === 'armor' && aconsUme === 'air' && aActor.data.items.contents[key].data.data.header.active) {
            if (Object.hasOwnProperty.call(aActor.data.items.contents, key) && bRoll > 0) {
              let element = aActor.data.items.contents[key];
              if (element.data.data.attributes[iConsUme].value) {
                let mitem = aActor.items.get(element.data._id);
                let iVal = element.data.data.attributes[iConsUme].value;
                if (iVal - bRoll < 0) {
                  tNum = iVal;
                  // bRoll -= iVal;
                } else {
                  tNum = bRoll;
                }
                await mitem.update({ [field]: element.data.data.attributes[iConsUme].value - tNum });
              }
            }
            bRoll -= tNum;
          }
        }
        await aActor.update({ [aField]: `data.consumables.${aconsUme}.value` - tNum });
      }
    }
  }

  async creatureAcidRoll(actor, dataset) {
    let template = 'systems/alienrpg/templates/dialog/roll-base-xeno-dialog.html';
    let label = dataset.label;
    let r1Data = parseInt(dataset.roll || 0);
    let r2Data = 0;
    let reRoll = true;
    let hostile = 'creature';
    let blind = false;
    if (dataset.roll != '-') {
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
              let modifier = parseInt(html.find('[name=damage]')[0].value);
              r1Data = r1Data + modifier;
              yze.yzeRoll(hostile, false, reRoll, label, r1Data, 'Black', r2Data, 'Stress', actor.id);
            }
          },
        }).render(true);
      });
    } else {
      // Roll against the panic table and push the roll to the chat log.
      let chatMessage = '';
      chatMessage += '<h2>' + game.i18n.localize('ALIENRPG.AcidAttack') + '</h2>';
      chatMessage += `<h4><i>` + game.i18n.localize('ALIENRPG.AcidBlood') + `</i></h4>`;
      ChatMessage.create({
        user: game.user.data._id,
        speaker: {
          actor: actor.id,
        },
        content: chatMessage,
        whisper: game.users.contents.filter((u) => u.isGM).map((u) => u.data._id),
        blind: true,
      });
    }
  }

  async creatureAttackRoll(actor, dataset) {
    let chatMessage = '';
    const targetTable = dataset.atttype;
    const table = game.tables.contents.find((b) => b.name === targetTable);
    const roll = new Roll('1d6');
    roll.evaluate({ async: false });

    const customResults = await table.roll({ roll });
    chatMessage += '<h2>' + game.i18n.localize('ALIENRPG.AttackRoll') + '</h2>';
    chatMessage += `<h4><i>${table.data.name}</i></h4>`;
    chatMessage += `${customResults.results[0].data.text}`;
    ChatMessage.create({
      user: game.user.data._id,
      speaker: {
        actor: actor.id,
      },
      roll: customResults.roll,
      content: chatMessage,
      // whisper: game.users.contents.filter((u) => u.isGM).map((u) => u._id),
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
    });
  }

  morePanic(pCheck) {
    let con = '';
    switch (pCheck) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
        con = game.i18n.localize('ALIENRPG.Panic1');
        break;
      case 7:
        con = game.i18n.localize('ALIENRPG.Panic7');
        break;
      case 8:
        con = game.i18n.localize('ALIENRPG.Panic8');
        break;
      case 9:
        con = game.i18n.localize('ALIENRPG.Panic9');
        break;
      case 10:
        con = game.i18n.localize('ALIENRPG.Panic10');
        break;
      case 11:
        con = game.i18n.localize('ALIENRPG.Panic11');
        break;
      case 12:
        con = game.i18n.localize('ALIENRPG.Panic12');
        break;
      case 13:
        con = game.i18n.localize('ALIENRPG.Panic13');
        break;
      case 14:
        con = game.i18n.localize('ALIENRPG.Panic14');
        break;
      default:
        con = game.i18n.localize('ALIENRPG.Panic15');
        break;
    }
    return con;
  }

  async rollCrit(type, dataset) {
    // console.log('🚀 ~ file: actor.js ~ line 841 ~ alienrpgActor ~ rollCrit ~ type', type);
    // let label = dataset.label;
    let atable = '';
    let healTime = 0;
    let cFatial = false;
    let factorFour = '';
    let testArray = '';
    switch (type) {
      case 'character':
        atable = game.tables.getName('Critical injuries');
        if (atable === null || atable === undefined) {
          ui.notifications.warn(game.i18n.localize('ALIENRPG.NoCharCrit'));
          return;
        }

        break;
      case 'synthetic':
        atable = game.tables.getName('Critical Injuries on Synthetics');
        if (atable === null || atable === undefined) {
          ui.notifications.warn(game.i18n.localize('ALIENRPG.NoSynCrit'));
          return;
        }
        break;

      default:
        break;
    }

    // const formula = atable.data.formula;
    // const roll = new Roll(formula);
    // roll.evaluate({ async: false });
    // atable.draw({ roll: roll });
    const test1 = await atable.draw();
    let critTable = false;
    try {
      if (game.settings.get('alienrpg-corerules', 'imported') === true) {
        critTable = true;
      }
    } catch (error) {}

    try {
      if (game.settings.get('alienrpg-starterset', 'imported') === true) {
        critTable = true;
      }
    } catch (error) {}

    try {
      if (critTable) {
        // if (game.settings.get('alienrpg-corerules', 'imported') === true || game.settings.get('alienrpg-starterset', 'imported') === true) {
        const messG = JSON.stringify(game.messages.contents.pop());

        switch (type) {
          case 'character':
            {
              let resultImage = messG.slice(messG.indexOf('src=') + 6, messG.indexOf('.svg') + 4);
              factorFour = messG.slice(messG.indexOf('<b>INJURY:'), messG.indexOf('</div>' + 6, messG.indexOf('<b>INJURY:'))).replace(/<a class=(.*?)><\/i>|<\/a>/gi, '');
              testArray = factorFour.match(/<?b>(.*?)(<br>|<\/div>)/g).map(function (val) {
                return val.replace(/<b>(.*?)(: )|<\/b>|(<br>|<\/div>)/g, '');
              });
              let speanex = testArray[3].replace(/(<([^>]+)>)/gi, '');
              if (testArray[4] != 'Permanent') {
                testArray[4].replace(/[^0-9]/g, '');
              }
              switch (testArray[1]) {
                case 'Yes ':
                  cFatial = true;
                  break;
                case 'Yes, –1 ':
                  cFatial = true;
                  break;
                default:
                  cFatial = false;
                  break;
              }

              switch (testArray[2]) {
                case game.i18n.localize('ALIENRPG.None') + ' ':
                  healTime = 0;
                  break;
                case game.i18n.localize('ALIENRPG.OneRound') + ' ':
                  healTime = 1;
                  break;
                case game.i18n.localize('ALIENRPG.OneTurn') + ' ':
                  healTime = 2;
                  break;
                case game.i18n.localize('ALIENRPG.OneShift') + ' ':
                  healTime = 3;
                  break;
                case game.i18n.localize('ALIENRPG.OneDay'):
                  +' ';
                  healTime = 3;
                  break;
                default:
                  healTime = 0;
                  break;
              }
              //
              // Now create the item on the sheet
              //
              await this.createEmbeddedDocuments('Item', [
                {
                  type: 'critical-injury',
                  img: resultImage,
                  name: `#${test1.roll._total} ${testArray[0]}`,
                  'data.attributes.fatal': cFatial,
                  'data.attributes.timelimit.value': testArray[4],
                  'data.attributes.healingtime.value': healTime,
                  'data.attributes.effects': speanex,
                },
              ]);
            }

            break;
          case 'synthetic':
            {
              factorFour = messG.slice(messG.indexOf('result-image'), messG.indexOf('.</div>') + 1);
              let resultImage = factorFour.slice(factorFour.indexOf('src=') + 6, factorFour.indexOf('.svg') + 4);
              let injName = factorFour.slice(factorFour.indexOf('<b>') + 3, factorFour.indexOf(': </b>'));
              let injDesc = factorFour.slice(factorFour.indexOf(': </b>') + 6);
              let injDesc1 = injDesc.replace(/(<([^>]+)>)/gi, '');
              // debugger;
              //
              // Now create the item on the sheet
              //
              await this.createEmbeddedDocuments('Item', [
                {
                  type: 'critical-injury',
                  img: resultImage,
                  name: `#${test1.roll._total} ${injName}`,
                  'data.attributes.effects': injDesc1,
                },
              ]);
            }
            break;
        }
      }
    } catch (error) {}
  }

  async rollCritMan(actor, type, dataset) {
    function myRenderTemplate(template) {
      let confirmed = false;
      renderTemplate(template).then((dlg) => {
        new Dialog({
          title: game.i18n.localize('ALIENRPG.RollManCrit'),
          content: dlg,
          buttons: {
            one: {
              icon: '<i class="fas fa-check"></i>',
              label: game.i18n.localize('ALIENRPG.DialRoll'),
              callback: () => (confirmed = true),
            },
            four: {
              icon: '<i class="fas fa-times"></i>',
              label: game.i18n.localize('ALIENRPG.DialCancel'),
              callback: () => (confirmed = false),
            },
          },
          default: 'one',
          close: (html) => {
            if (confirmed) {
              let manCrit = html.find('[name=manCrit]')[0]?.value;

              if (manCrit == 'undefined') {
                manCrit = '1';
              }
              switch (type) {
                case 'synthetic':
                  if (manCrit > 6) {
                    ui.notifications.warn(game.i18n.localize('ALIENRPG.NoSynCrit'));
                    return;
                  }
                  break;

                case 'character':
                  if (!manCrit.match(/^[1-6]?[1-6]$/gm)) {
                    ui.notifications.warn(game.i18n.localize('ALIENRPG.NoSynCrit'));
                    return;
                  }
                  break;
                default:
                  break;
              }
              actor.ManualCrit(actor, type, dataset, manCrit);
            }
          },
        }).render(true);
      });
    }
    if (actor.data.type === 'character') {
      myRenderTemplate('systems/alienrpg/templates/dialog/roll-char-manual-crit-dialog.html');
    } else if (actor.data.type === 'synthetic') {
      myRenderTemplate('systems/alienrpg/templates/dialog/roll-syn-manual-crit-dialog.html');
    }
  }

  async ManualCrit(actor, type, dataset, manCrit) {
    let atable = '';
    let healTime = 0;
    let cFatial = false;
    let factorFour = '';
    let testArray = '';
    switch (type) {
      case 'character':
        atable = game.tables.getName('Critical injuries');
        if (atable === null || atable === undefined) {
          ui.notifications.warn(game.i18n.localize('ALIENRPG.NoCharCrit'));
          return;
        }
        break;
      case 'synthetic':
        atable = game.tables.getName('Critical Injuries on Synthetics');
        if (atable === null || atable === undefined) {
          ui.notifications.warn(game.i18n.localize('ALIENRPG.NoSynCrit'));
          return;
        }
        break;

      default:
        break;
    }

    const formula = manCrit;
    const roll = new Roll(formula);
    roll.evaluate({ async: false });
    // atable.draw({ roll: roll });
    const test1 = await atable.draw({ roll: roll });
    let critTable = false;
    try {
      if (game.settings.get('alienrpg-corerules', 'imported') === true) {
        critTable = true;
      }
    } catch (error) {}

    try {
      if (game.settings.get('alienrpg-starterset', 'imported') === true) {
        critTable = true;
      }
    } catch (error) {}

    try {
      if (critTable) {
        // if (game.settings.get('alienrpg-corerules', 'imported') === true || game.settings.get('alienrpg-starterset', 'imported') === true) {
        const messG = JSON.stringify(game.messages.contents.pop());

        switch (type) {
          case 'character':
            {
              let resultImage = messG.slice(messG.indexOf('src=') + 6, messG.indexOf('.svg') + 4);
              factorFour = messG.slice(messG.indexOf('<b>INJURY:'), messG.indexOf('</div>' + 6, messG.indexOf('<b>INJURY:'))).replace(/<a class=(.*?)><\/i>|<\/a>/gi, '');
              testArray = factorFour.match(/<?b>(.*?)(<br>|<\/div>)/g).map(function (val) {
                return val.replace(/<b>(.*?)(: )|<\/b>|(<br>|<\/div>)/g, '');
              });
              let speanex = testArray[3].replace(/(<([^>]+)>)/gi, '');
              if (testArray[4] != 'Permanent') {
                testArray[4].replace(/[^0-9]/g, '');
              }
              switch (testArray[1]) {
                case 'Yes ':
                  cFatial = true;
                  break;
                case 'Yes, –1 ':
                  cFatial = true;
                  break;
                default:
                  cFatial = false;
                  break;
              }

              switch (testArray[2]) {
                case game.i18n.localize('ALIENRPG.None') + ' ':
                  healTime = 0;
                  break;
                case game.i18n.localize('ALIENRPG.OneRound') + ' ':
                  healTime = 1;
                  break;
                case game.i18n.localize('ALIENRPG.OneTurn') + ' ':
                  healTime = 2;
                  break;
                case game.i18n.localize('ALIENRPG.OneShift') + ' ':
                  healTime = 3;
                  break;
                case game.i18n.localize('ALIENRPG.OneDay'):
                  +' ';
                  healTime = 3;
                  break;
                default:
                  healTime = 0;
                  break;
              }
              //
              // Now create the item on the sheet
              //
              await this.createEmbeddedDocuments('Item', [
                {
                  type: 'critical-injury',
                  img: resultImage,
                  name: `#${test1.roll._total} ${testArray[0]}`,
                  'data.attributes.fatal': cFatial,
                  'data.attributes.timelimit.value': testArray[4],
                  'data.attributes.healingtime.value': healTime,
                  'data.attributes.effects': speanex,
                },
              ]);
            }

            break;
          case 'synthetic':
            {
              factorFour = messG.slice(messG.indexOf('result-image'), messG.indexOf('.</div>') + 1);
              let resultImage = factorFour.slice(factorFour.indexOf('src=') + 6, factorFour.indexOf('.svg') + 4);
              let injName = factorFour.slice(factorFour.indexOf('<b>') + 3, factorFour.indexOf(': </b>'));
              let injDesc = factorFour.slice(factorFour.indexOf(': </b>') + 6);
              let injDesc1 = injDesc.replace(/(<([^>]+)>)/gi, '');
              // debugger;
              //
              // Now create the item on the sheet
              //
              await this.createEmbeddedDocuments('Item', [
                {
                  type: 'critical-injury',
                  img: resultImage,
                  name: `#${test1.roll._total} ${injName}`,
                  'data.attributes.effects': injDesc1,
                },
              ]);
            }
            break;
        }
      }
    } catch (error) {}
  }
}
export default alienrpgActor;
