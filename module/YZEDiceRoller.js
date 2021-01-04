export class yze {
  /**
   * YZEDice RollFunction.
   * Paramfornumber of dice to roll for each die type/rolls
   * @param {Text} actor - Passed actor data
   * @param {Text} hostile - Passed actor type
   * @param {Boolean} blind - True or False
   * @param {Boolean} reRoll - True or False
   * @param {Text} label - The skill/item being rolled agains
   * @param {number} r1Dice - Number of dice
   * @param {Text} col1 - The Colour
   * @param {number} r2Dice  - Number of dice
   * @param {Text} col2 - The Colour
   * @param {Text} tLabel - Spare label for future use
   * @param {number} sCount - Count of last number of sucesses to addtothe push reroll
   *
   * rollArr is a globally defined array to store all one'sand sixes and number of dice rolled for each type
   *   game.alienrpg.rollArr = { r1Dice: 0, r1One: 0, r1Six: 0, r2Dice: 0, r2One: 0, r2Six: 0, tLabel: '' , sCount: 0 };
   *
   * Call Example:
   * const element = event.currentTarget;
   * const dataset = element.dataset;
   * let label = dataset.label;
   * let r1Data = parseInt(dataset.roll || 0);
   * let r2Data = this.actor.getRollData().stress;
   * let reRoll = false;
   * yze.yzeRoll(hostile, blind, reRoll, label, r1Data, 'Black', r2Data, 'Yellow');
   *
   */
  static async yzeRoll(hostile, blind, reRoll, label, r1Dice, col1, r2Dice, col2,actorid) {
    // console.log('yze -> yzeRoll -> hostile, blind, reRoll, label, r1Dice, col1, r2Dice, col2', hostile, blind, reRoll, label, r1Dice, col1, r2Dice, col2);

    // *******************************************************
    // Store the version number of FVTT
    // *******************************************************
    const sysVer = game.data.version;

    // *******************************************************
    // Is Dice So Nice enabled ?
    // *******************************************************
    let niceDice = '';

    try {
      niceDice = true;
      game.settings.get('dice-so-nice', 'settings').enabled;
    } catch {
      niceDice = false;
    }
    let spud = 'true';

    // *******************************************************
    //  Initialse the chat message
    // *******************************************************
    let chatMessage = `<div class="chatBG">`;

    // *******************************************************
    //  Data structure for DsN V3
    // *******************************************************
    let mr = '';
    let roll1;

    // *******************************************************
    // Set uptext for a roll or push
    // *******************************************************
    let rType = '';
    if (reRoll && (hostile === true) === 'character') {
      rType = game.i18n.localize('ALIENRPG.Push');
    } else {
      rType = game.i18n.localize('ALIENRPG.Rolling');
    }

    // *******************************************************
    // Save the sucesses from the last roll
    // *******************************************************
    let oldRoll = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;

    // *******************************************************
    // Clear the global dice array
    // *******************************************************
    // game.alienrpg.rollArr = { r1Dice: 0, r1One: 0, r1Six: 0, r2Dice: 0, r2One: 0, r2Six: 0, tLabel: '' };
    game.alienrpg.rollArr.r1Dice = 0;
    game.alienrpg.rollArr.r1One = 0;
    game.alienrpg.rollArr.r1Six = 0;
    game.alienrpg.rollArr.r2Dice = 0;
    game.alienrpg.rollArr.r2One = 0;
    game.alienrpg.rollArr.r2Six = 0;
    game.alienrpg.rollArr.sCount = 0;
    game.alienrpg.rollArr.tLabel = '';

    // *******************************************************
    // Setup the constants for the 3D dice roll V2 method
    // *******************************************************
    const data = {
      formula: '',
      results: [],
    };

    if (!r1Dice && !r2Dice) {
      return ui.notifications.warn(game.i18n.localize('ALIENRPG.NoAttribute'));
    }
    // *******************************************************
    // Handle Base Dice Roll
    // *******************************************************
    chatMessage += '<h2 style="color:  #fff">' + rType + ' ' + label + ' </h2>';
    if (r1Dice >= 1) {
      // chatMessage += '<div>' + col1 + '  ' + r1Dice + ' Dice</div>';
      if (sysVer < '0.7.3') {
        yzeDRoll('r1Dice', r1Dice, 'r1Six', 'r1One');
        data.formula = r1Dice + 'd6';
      } else {
        roll1 = `${r1Dice}` + 'db';
        if (r2Dice <= 0) {
          mr = new Roll(`${roll1}`).roll();
          buildChat(mr, r1Dice, game.i18n.localize('ALIENRPG.Base'));
          // console.log('yze -> yzeRoll -> mr', mr);
        }
      }
    }

    // *******************************************************
    // Handle Stress Dice Roll
    // *******************************************************

    if (r2Dice >= 1) {
      // chatMessage += '<div style="color: goldenrod; font-weight: bold">' + col2 + '  ' + r2Dice + ' Dice</div>';
      if (sysVer < '0.7.3') {
        yzeDRoll('r2Dice', r2Dice, 'r2Six', 'r2One');
        data.formula = r1Dice + r2Dice + 'd6';
      } else {
        let roll2 = `${r2Dice}` + 'ds';
        let com;
        if (hostile === 'supply') {
          // // console.log('yze -> yzeRoll -> hostile', hostile);
          com = `${roll2}`;
        } else {
          com = `${roll1}` + '+' + `${roll2}`;
          // mr = '';
        }
        mr = new Roll(`${com}`).roll();
        // // console.log('yze -> yzeRoll -> mr', mr);
        buildChat(mr, r1Dice, game.i18n.localize('ALIENRPG.Stress'));
      }

      // *******************************************************
      // Set reroll
      // *******************************************************
      if (game.alienrpg.rollArr.r2One > 0 && !reRoll) {
        reRoll = true;
        spud = false;
      }

      // *******************************************************
      // Display message if there is a 1> on the stress dice.  Display appropriate message if its a Supply roll.
      // *******************************************************
      if (hostile != 'supply') {
        if (game.alienrpg.rollArr.r2One >= 1) {
          chatMessage += '<div class="blink"; style="color: red; font-weight: bold; font-size: larger">' + game.i18n.localize('ALIENRPG.rollStress') + '</div>';
        } 
        // else if (game.alienrpg.rollArr.r2One > 1) {
        //   chatMessage +=
        //     '<div class="blink"; style="color: red; font-weight: bold; font-size: larger">' +
        //     game.i18n.localize('ALIENRPG.rollStress') +
        //     ' ' +
        //     game.alienrpg.rollArr.r2One +
        //     game.i18n.localize('ALIENRPG.worstResult') +
        //     '</div>';
        // }
        
      } else if (game.alienrpg.rollArr.r2One >= 1) {
        chatMessage += '<div class="blink"; style="color: blue; font-weight: bold; font-size: larger">' + game.i18n.localize('ALIENRPG.supplyDecreases') + '</div>';
      }
    }
    // *******************************************************
    // Calulate the total successes and displayas long asit's not a Supply roll.
    // *******************************************************
    let succEss = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six + game.alienrpg.rollArr.sCount;

    if (hostile != 'supply') {
      if (succEss === 1) {
        chatMessage +=
          '<div style="color: #6868fc; font-weight: bold; font-size: larger">' + game.i18n.localize('ALIENRPG.youHave') + ' ' + succEss + ' ' + game.i18n.localize('ALIENRPG.sucess') + ' </div>';
      } else {
        chatMessage +=
          '<div style="color: #6868fc; font-weight: bold; font-size: larger">' + game.i18n.localize('ALIENRPG.youHave') + ' ' + succEss + ' ' + game.i18n.localize('ALIENRPG.sucesses') + '</div>';
      }
    }

    // *******************************************************
    //  If it's a Push roll and dispaly the total for both rolls.
    // *******************************************************
    if (reRoll && spud && hostile === 'character') {
      chatMessage += '<hr>';
      let sTotal = oldRoll + game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
      if (sTotal === 1) {
        chatMessage +=
          '<div style="color: #6868fc; font-weight: bold; font-size: larger">' +
          game.i18n.localize('ALIENRPG.followingPush') +
          '<br>' +
          game.i18n.localize('ALIENRPG.totalOf') +
          ' ' +
          sTotal +
          ' ' +
          game.i18n.localize('ALIENRPG.sucess') +
          ' </div>';
      } else {
        chatMessage +=
          '<div style="color: #6868fc; font-weight: bold; font-size: larger">' +
          game.i18n.localize('ALIENRPG.followingPush') +
          '<br> ' +
          game.i18n.localize('ALIENRPG.totalOf') +
          ' ' +
          sTotal +
          ' ' +
          game.i18n.localize('ALIENRPG.sucesses') +
          '</div>';
      }
    }

    // *******************************************************
    // Render the reroll button
    // *******************************************************

    if (!reRoll) {
      chatMessage += `<button class="alien-Push-button" title="PUSH Roll?"></button>`;
      chatMessage += `<span class="dmgBtn-container" style="position:absolute; right:0; bottom:1px;"></span>`;
      chatMessage += `<span class="dmgBtn-container" style="position:absolute; top:0; right:0; bottom:1px;"></span>`;
    }
    // *******************************************************
    // Only if Dice So Nice V2 is enabled.  For V3 weare using the chat hook.
    // *******************************************************
    if (niceDice && !blind && sysVer < '0.7.3') {
      game.dice3d.show(data, game.user, true, null, false).then((displayed) => {});
    }

    // *******************************************************
    // For FVTT v0.6.6 and DsN v2 set the appropriate chat config
    // *******************************************************

    if (sysVer < '0.7.3') {
      if (!blind) {
        ChatMessage.create({
          user: game.user._id,
          content: chatMessage,
          other: game.users.entities.filter((u) => u.isGM).map((u) => u._id),
          sound: CONFIG.sounds.dice,
        });
      } else {
        ChatMessage.create({
          user: game.user._id,
          content: chatMessage,
          whisper: game.users.entities.filter((u) => u.isGM).map((u) => u._id),
          blind: true,
        });
      }
    } else {
      // *******************************************************
      // For FVTT v0.7.x and DsN V3 set the appropriate chat config
      // *******************************************************

      if (!blind) {
        ChatMessage.create({
          user: game.user._id,
          speaker: {
            actor: actorid,
          },
          content: chatMessage,
          other: game.users.entities.filter((u) => u.isGM).map((u) => u._id),
          sound: CONFIG.sounds.dice,
          type: CHAT_MESSAGE_TYPES.ROLL,
          roll: mr,
          rollMode: game.settings.get('core', 'rollMode'),
        });
      } else {
        ChatMessage.create({
          user: game.user._id,
          speaker: {
            actor: actorid,
          },
          content: chatMessage,
          whisper: game.users.entities.filter((u) => u.isGM).map((u) => u._id),
          blind: true,
          type: CHAT_MESSAGE_TYPES.ROLL,
          roll: mr,
          rollMode: game.settings.get('core', 'rollMode'),
        });
      }
    }

    // *******************************************************
    // Function to rolldice using the DsN v2 method and data structure
    // *******************************************************
    function yzeDRoll(sLot, numDie, yzeR6, yzeR1) {
      let i;
      let numbers = [];
      let mArr = {};
      if (sysVer < '0.7.3') {
        // Foundry v0.6.6 code
        let die = new Die(6);
        die.roll(numDie);
        game.alienrpg.rollArr[sLot] = numDie;
        die.results.forEach((el) => {
          data.results.push(el);
        });

        game.alienrpg.rollArr.tLabel = label;
        die.countSuccess(6, '=');
        game.alienrpg.rollArr[yzeR6] = die.total;
        die.countSuccess(1, '=');
        game.alienrpg.rollArr[yzeR1] = die.total;

        let numOf6s = game.alienrpg.rollArr[yzeR6];
        let numOf1s = game.alienrpg.rollArr[yzeR1];

        if (sLot === 'r1Dice') {
          chatMessage += '<div>' + col1 + '  ' + r1Dice + ' Dice</div>';
          chatMessage += '<span style="color: green ">  Sixes: </span>';
          chatMessage += `${game.alienrpg.rollArr[yzeR6]}`;
          chatMessage += '<div>';

          // added by Steph (for loop, and moved div close)
          for (var _d = 0; _d < numDie; _d++) {
            if (numOf6s > 0) {
              chatMessage += "<span class='alien-diceface-b6'></span>";
              numOf6s--;
            } else {
              chatMessage += "<span class='alien-diceface-b0'></span>";
            }
          }
          chatMessage += '</div>';
        } else {
          chatMessage += '<div style="color: goldenrod; font-weight: bold">' + col2 + '  ' + r2Dice + ' Dice</div>';
          chatMessage += '<span style="color: red">Ones: </span>';
          chatMessage += `<span>${game.alienrpg.rollArr[yzeR1]}</span>`;
          chatMessage += '<span style="color: green">  Sixes: </span>';
          chatMessage += `${game.alienrpg.rollArr[yzeR6]}`;
          chatMessage += '<div>';

          // added by Steph (for loops, and moved div close)
          for (var _d = 0; _d < numOf6s; _d++) {
            chatMessage += "<span class='alien-diceface-y6'></span>";
          }
          for (var _d = 0; _d < numOf1s; _d++) {
            chatMessage += "<span class='alien-diceface-y1'></span>";
          }
          let _theRest = numDie - (numOf6s + numOf1s);
          for (var _d = 0; _d < _theRest; _d++) {
            chatMessage += "<span class='alien-diceface-y0'></span>";
          }
          chatMessage += '</div>';
        }
      }
    }

    // *******************************************************
    // Function to buildchat and dice for DsN V3
    // *******************************************************
    function buildChat(mr, numDie, dType) {
      let numbers = [];
      let numbers2 = [];
      let R6 = 0;
      let R1 = 0;
      let RB6 = 0;
      let RB1 = 0;
      let RY6 = 0;
      let RY1 = 0;
      let mrterms;
      game.alienrpg.rollArr.tLabel = label;

      if (dType != 'Stress') {
        for (let index = 0; index < mr.terms[0].results.length; index++) {
          let spanner = flattenObj(mr.terms[0].results[index]);
          numbers.push(spanner.result);
        }
        R6 = numbers.filter(myFunSix);
        R1 = numbers.filter(myFunOne);
        game.alienrpg.rollArr.r1Dice = numDie;
        game.alienrpg.rollArr.r1Six = R6.length;
        game.alienrpg.rollArr.r1One = R1.length;
        let numOf6s = R6.length; // added by Steph
        let numOf1s = R1.length; // added by Steph
        chatMessage += '<div style="color: #03cf03">' + col1 + '  ' + r1Dice + ' Dice</div>';
        chatMessage += '<span style="color: #03cf03">  Sixes: </span>';
        chatMessage += `${R6.length}`;
        chatMessage += '<div>';
        // added by Steph (for loop, and moved div close)
        for (var _d = 0; _d < numDie; _d++) {
          if (numOf6s > 0) {
            chatMessage += "<span class='alien-diceface-b6'></span>";
            numOf6s--;
          } else {
            chatMessage += "<span class='alien-diceface-b0'></span>";
          }
        }
        chatMessage += '</div>';
      } else {
        if (hostile != 'supply') {
          for (let index = 0; index < mr.terms[0].results.length; index++) {
            let spanner = flattenObj(mr.terms[0].results[index]);
            numbers.push(spanner.result);
          }
          RB6 = numbers.filter(myFunSix);
          RB1 = numbers.filter(myFunOne);
          game.alienrpg.rollArr.r1Dice = mr.terms[0].number;
          game.alienrpg.rollArr.r1Six = RB6.length;
          game.alienrpg.rollArr.r1One = RB1.length;
          let numOfB6s = RB6.length; // added by Steph
          let numOfB1s = RB1.length; // added by Steph
          // Base Dice
          chatMessage += '<div style="color: #03cf03">' + col1 + '  ' + r1Dice + ' Dice</div>';
          chatMessage += '<span style="color: #03cf03">  Sixes: </span>';
          chatMessage += `${RB6.length}`;
          chatMessage += '<div>';
          // added by Steph (for loop, and moved div close)
          for (var _d = 0; _d < mr.terms[0].number; _d++) {
            if (numOfB6s > 0) {
              chatMessage += "<span class='alien-diceface-b6'></span>";
              numOfB6s--;
            } else {
              chatMessage += "<span class='alien-diceface-b0'></span>";
            }
          }
          chatMessage += '</div>';
        }
        if (hostile === 'supply') {
          for (let index = 0; index < mr.terms[0].results.length; index++) {
            let spanner = flattenObj(mr.terms[0].results[index]);
            numbers.push(spanner.result);
          }
          game.alienrpg.rollArr.r2Dice = mr.terms[0].number;
          mrterms = mr.terms[0].number;
          RY6 = numbers.filter(myFunSix);
          RY1 = numbers.filter(myFunOne);
        } else {
          for (let index = 0; index < mr.terms[2].results.length; index++) {
            let spanner = flattenObj(mr.terms[2].results[index]);
            numbers2.push(spanner.result);
          }
          game.alienrpg.rollArr.r2Dice = mr.terms[2].number;
          mrterms = mr.terms[2].number;
          RY6 = numbers2.filter(myFunSix);
          RY1 = numbers2.filter(myFunOne);
        }

        game.alienrpg.rollArr.r2Six = RY6.length;
        game.alienrpg.rollArr.r2One = RY1.length;

        let numOfY6s = RY6.length; // added by Steph
        let numOfY1s = RY1.length; // added by Steph

        // Yellow Dice
        chatMessage += '<div style="color: goldenrod; font-weight: bold">' + col2 + '  ' + r2Dice + ' Dice</div>';
        chatMessage += '<span style="color: red">Ones: </span>';
        chatMessage += `<span>${RY1.length}</span>`;
        chatMessage += '<span style="color: #03cf03">  Sixes: </span>';
        chatMessage += `${RY6.length}`;
        chatMessage += '<div>';
        // added by Steph (for loops, and moved div close)
        for (var _d = 0; _d < numOfY6s; _d++) {
          chatMessage += "<span class='alien-diceface-y6'></span>";
        }
        for (var _d = 0; _d < numOfY1s; _d++) {
          chatMessage += "<span class='alien-diceface-y1'></span>";
        }
        let _theRest = mrterms - (numOfY6s + numOfY1s);
        for (var _d = 0; _d < _theRest; _d++) {
          chatMessage += "<span class='alien-diceface-y0'></span>";
        }
        chatMessage += '</div>';
      }
      function myFunSix(value, index, array) {
        return value === 6;
      }
      function myFunOne(value, index, array) {
        return value === 1;
      }
    }

    // *******************************************************
    // Function to flatten Arrays to make them easier to parse
    // *******************************************************
    function flattenObj(obj, parent, res = {}) {
      for (let key in obj) {
        let propName = parent ? parent + '_' + key : key;
        if (typeof obj[key] == 'object') {
          flattenObj(obj[key], propName, res);
        } else {
          res[propName] = obj[key];
        }
      }
      return res;
    }
  }
}
