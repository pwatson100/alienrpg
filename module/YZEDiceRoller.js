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
   * @param {number} r3Dice  - Number of dice
   * @param {Text} col3 - The Colour
   *
   * rollArr is a globally defined array to store all one'sand sixes and number of dice rolled for each type
   *   game.alienrpg.rollArr = { r1Dice: 0, r1One: 0, r1Six: 0, r2Dice: 0, r2One: 0, r2Six: 0, r3Dice: 0, r3One: 0, r3Six: 0, tLabel: '' };
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
  static async yzeRoll(hostile, blind, reRoll, label, r1Dice, col1, r2Dice, col2, r3Dice, col3) {
    // Store the version number of FVTT
    const sysVer = game.data.version;

    // Is Dice So Nice enabled ?
    let niceDice = '';

    try {
      niceDice = true;
      game.settings.get('dice-so-nice', 'settings').enabled;
    } catch {
      niceDice = false;
    }
    let spud = 'true';
    //  Initialse the chat message
    let chatMessage = '';
    console.warn('YZE', hostile, blind, reRoll, label, r1Dice, col1, r2Dice, col2, r3Dice, col3);

    // Set uptext for a roll or push
    let rType = '';
    if (reRoll && (hostile === true) === 'character') {
      rType = game.i18n.localize('ALIENRPG.Push');
    } else {
      rType = game.i18n.localize('ALIENRPG.Rolling');
    }

    // Save the sucesses from the last roll
    let oldRoll = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
    // Clear the global dice array
    // game.alienrpg.rollArr = { r1Dice: 0, r1One: 0, r1Six: 0, r2Dice: 0, r2One: 0, r2Six: 0, r3Dice: 0, r3One: 0, r3Six: 0, tLabel: '' };
    game.alienrpg.rollArr.r1Dice = 0;
    game.alienrpg.rollArr.r1One = 0;
    game.alienrpg.rollArr.r1Six = 0;
    game.alienrpg.rollArr.r2Dice = 0;
    game.alienrpg.rollArr.r2One = 0;
    game.alienrpg.rollArr.r2Six = 0;
    game.alienrpg.rollArr.r3Dice = 0;
    game.alienrpg.rollArr.r3One = 0;
    game.alienrpg.rollArr.r3Six = 0;
    game.alienrpg.rollArr.sCount = 0;
    game.alienrpg.rollArr.tLabel = '';

    // Setup the constants for the 3D dice roll method
    const data = {
      formula: '',
      results: [],
    };

    function yzeDRoll(sLot, numDie, yzeR6, yzeR1) {
      let i;
      let numbers = [];
      let roll = new Roll(`${numDie}d6`);
      let result = roll.roll();
      game.alienrpg.rollArr[sLot] = numDie;

      if (sysVer > '0.6.6') {
        for (let index = 0; index < roll.terms[0].results.length; index++) {
          let spanner = flattenObj(roll.terms[0].results[index]);
          numbers.push(spanner.result);
        }
        // console.warn('numbers', numbers);
        game.alienrpg.rollArr.tLabel = label;
        let R6 = numbers.filter(myFunSix);
        let R1 = numbers.filter(myFunOne);

        game.alienrpg.rollArr[yzeR6] = R6.length;
        game.alienrpg.rollArr[yzeR1] = R1.length;

        function myFunSix(value, index, array) {
          return value === 6;
        }
        function myFunOne(value, index, array) {
          return value === 1;
        }
      } else {
        // Foundry v0.6.6 code
        die.results.forEach((el) => {
          data.results.push(el);
        });
        // console.warn('data', data, die);

        game.alienrpg.rollArr.tLabel = label;
        die.countSuccess(6, '=');
        game.alienrpg.rollArr[yzeR6] = die.result;
        die.countSuccess(1, '=');
        game.alienrpg.rollArr[yzeR1] = die.result;
      }

      let numOf6s = game.alienrpg.rollArr[yzeR6]; // added by Steph
      let numOf1s = game.alienrpg.rollArr[yzeR1]; // added by Steph

      if (sLot === 'r1Dice') {
        chatMessage += '<span style="color: green">  Sixes: </span>';
        chatMessage += `${game.alienrpg.rollArr[yzeR6]}`;
        chatMessage += '<div>';
        // chatMessage += `<span class="blink" style="font-weight: bold; font-size: larger">${game.alienrpg.rollArr[r1Dice]}</span>`;
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
      // chatMessage += `<span class="blink">${game.alienrpg.rollArr[yzeR1]}</span>`;
    }

    chatMessage += '<h2>' + rType + ' ' + label + ' </h2>';
    if (r1Dice >= 1) {
      chatMessage += '<div>' + col1 + '  ' + r1Dice + ' Dice</div>';
      yzeDRoll('r1Dice', r1Dice, 'r1Six', 'r1One');
      data.formula = r1Dice + 'd6';
    }
    if (r2Dice >= 1) {
      chatMessage += '<div style="color: goldenrod; font-weight: bold">' + col2 + '  ' + r2Dice + ' Dice</div>';
      yzeDRoll('r2Dice', r2Dice, 'r2Six', 'r2One');
      data.formula = r1Dice + r2Dice + 'd6';
      if (game.alienrpg.rollArr.r2One > 0 && !reRoll) {
        reRoll = true;
        spud = false;
      }
      if (hostile != 'supply') {
        if (game.alienrpg.rollArr.r2One === 1) {
          chatMessage += '<div class="blink"; style="color: red; font-weight: bold; font-size: larger">Roll Stress Once</div>';
        } else if (game.alienrpg.rollArr.r2One > 1) {
          chatMessage += '<div class="blink"; style="color: red; font-weight: bold; font-size: larger">Roll Stress ' + game.alienrpg.rollArr.r2One + ' times. Use worst result.</div>';
        }
      } else if (game.alienrpg.rollArr.r2One >= 1) {
        chatMessage += '<div class="blink"; style="color: blue; font-weight: bold; font-size: larger">Your supply decreses</div>';
      }
    }
    if (r3Dice >= 1) {
      chatMessage += '<div>' + col3 + '  ' + r3Dice + ' Dice</div>';
      yzeDRoll('r3Dice', r3Dice, 'r3Six', 'r3One');
      data.formula = r1Dice + r2Dice + r3Dice + 'd6';
    }

    // Show total successes
    let succEss = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six + game.alienrpg.rollArr.r3Six + game.alienrpg.rollArr.sCount;
    if (hostile != 'supply') {
      if (succEss === 1) {
        chatMessage += '<div style="color: blue; font-weight: bold; font-size: larger"> You have ' + succEss + ' Success</div>';
      } else {
        chatMessage += '<div style="color: blue; font-weight: bold; font-size: larger"> You have ' + succEss + ' Successes</div>';
      }
    }
    // console.warn('YZE 2', game.alienrpg.rollArr.sCount);
    if (reRoll && spud && hostile != 'synthetic' && hostile != 'supply') {
      chatMessage += '<hr>';
      let sTotal = oldRoll + game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
      if (sTotal === 1) {
        chatMessage += '<div style="color: darkblue; font-weight: bold; font-size: larger"> Following the Push,<br> You have a Total of ' + sTotal + ' Success</div>';
      } else {
        chatMessage += '<div style="color: darkblue; font-weight: bold; font-size: larger"> Following the Push,<br> You have a Total of ' + sTotal + ' Successes</div>';
      }
    }

    // Render the reroll button
    if (!reRoll) {
      const btnStyling = '<span class="alien-Push-button"</span>';
      chatMessage += `<button class="alien-Push-button" ><i class="alien-Push-button" title="PUSH Roll?"></i></button>`;
      chatMessage += `<span class="dmgBtn-container" style="position:absolute; right:0; bottom:1px;"></span>`;
      chatMessage += `<span class="dmgBtn-container" style="position:absolute; top:0; right:0; bottom:1px;"></span>`;
    }

    // Only if Dice So Nice is enabled.
    if (niceDice && !blind) {
      game.dice3d.show(data, game.user, true, null, false).then((displayed) => {});
    }
    if (!blind) {
      ChatMessage.create({
        user: game.user._id,
        content: chatMessage,
        other: game.users.entities.filter((u) => u.isGM).map((u) => u._id),
        sound: CONFIG.sounds.dice,
        type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      });
    } else {
      ChatMessage.create({
        user: game.user._id,
        content: chatMessage,
        whisper: game.users.entities.filter((u) => u.isGM).map((u) => u._id),
        blind: true,
        type: CONST.CHAT_MESSAGE_TYPES.WHISPER,
      });
    }
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
