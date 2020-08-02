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
    // Is Dice So Nice enabled ?
    let niceDice = '';

    try {
      niceDice = true;
      game.settings.get('dice-so-nice', 'settings').enabled;
    } catch {
      niceDice = false;
    }

    //  Initialse the chat message
    let chatMessage = '';
    // console.warn('YZE', reRoll, label, r1Dice, col1, r2Dice, col2, r3Dice, col3);

    // Set uptext for a roll or push
    let rType = '';
    if (reRoll && (hostile === true) === 'character') {
      rType = game.i18n.localize('ALIENRPG.Push');
    } else {
      rType = game.i18n.localize('ALIENRPG.Rolling');
    }

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

      if (sLot === 'r1Dice') {
        chatMessage += '<span style="color: green">  Sixes: </span>';
        chatMessage += `${game.alienrpg.rollArr[yzeR6]}`;
        chatMessage += '<div><br></div>';
        // chatMessage += `<span class="blink" style="font-weight: bold; font-size: larger">${game.alienrpg.rollArr[yzeR1]}</span>`;
      } else {
        chatMessage += '<span style="color: red">Ones: </span>';
        chatMessage += `<span>${game.alienrpg.rollArr[yzeR1]}</span>`;
        chatMessage += '<span style="color: green">  Sixes: </span>';
        chatMessage += `${game.alienrpg.rollArr[yzeR6]}`;
        chatMessage += '<div><br></div>';
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
        reRoll = 'true';
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
    chatMessage += '<div style="color: blue; font-weight: bold; font-size: larger"> You have ' + succEss + ' Success</div>';
    // console.warn('YZE 2', game.alienrpg.rollArr.sCount);

    // Render the reroll button
    if (!reRoll) {
      const btnStyling = 'height:50px; font-size:45px;line-height:1px;background-color: #413131; color:#adff2f;border-color: #000000';
      chatMessage += `<button class="dice-total-shield-btn" style="${btnStyling}"><i class="fas fa-dice" title="PUSH Roll?"></i></button>`;
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
  }
}
