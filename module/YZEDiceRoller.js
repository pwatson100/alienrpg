export class yze {
  /**
   * YZEDice RollFunction.
   * Paramfornumber of dice to roll for each die type/rolls
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
   * yze.yzeRoll(reRoll, label, r1Data, 'Black', r2Data, 'Yellow');
   *
   */
  static async yzeRoll(reRoll, label, r1Dice, col1, r2Dice, col2, r3Dice, col3) {
    //  Initialse the chat message
    let chatMessage = '';

    // Set uptext for a roll or push
    let rType = '';
    if (reRoll) {
      rType = game.i18n.localize('ALIENRPG.Push');
    } else {
      rType = game.i18n.localize('ALIENRPG.Rolling');
    }

    // Clear the global dice array
    game.alienrpg.rollArr = { r1Dice: 0, r1One: 0, r1Six: 0, r2Dice: 0, r2One: 0, r2Six: 0, r3Dice: 0, r3One: 0, r3Six: 0, tLabel: '' };

    // Setup the constants for the 3D dice roll method
    const data = {
      formula: '',
      results: [],
      whisper: [],
      blind: false,
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
      chatMessage += 'Ones: ';
      chatMessage += `${game.alienrpg.rollArr[yzeR1]}`;
      chatMessage += '  Sixes: ';
      chatMessage += `${game.alienrpg.rollArr[yzeR6]}`;
      chatMessage += '<div><br></div>';
    }

    if (r1Dice >= 1) {
      chatMessage += '<h2>' + rType + ' ' + label + ' </h2>';
      chatMessage += '<div>' + col1 + ' - ' + r1Dice + '</div>';
      yzeDRoll('r1Dice', r1Dice, 'r1Six', 'r1One');
      data.formula = r1Dice + 'd6';
    }
    if (r2Dice >= 1) {
      chatMessage += '<div>' + col2 + ' - ' + r2Dice + '</div>';
      yzeDRoll('r2Dice', r2Dice, 'r2Six', 'r2One');
      data.formula = r1Dice + r2Dice + 'd6';
      if (game.alienrpg.rollArr.r2One > 0) {
        reRoll = true;
      }
    }
    if (r3Dice >= 1) {
      chatMessage += '<div>' + col3 + ' - ' + r3Dice + '</div>';
      yzeDRoll('r3Dice', r3Dice, 'r3Six', 'r3One');
      data.formula = r1Dice + r2Dice + r3Dice + 'd6';
    }

    if (!reRoll) {
      const btnStyling = 'height:50px; font-size:45px;line-height:1px;background-color: #413131; color:#adff2f;border-color: #000000';
      chatMessage += `<button class="dice-total-shield-btn" style="${btnStyling}"><i class="fas fa-dice" title="PUSH Roll?"></i></button>`;
      chatMessage += `<span class="dmgBtn-container" style="position:absolute; right:0; bottom:1px;"></span>`;
      chatMessage += `<span class="dmgBtn-container" style="position:absolute; top:0; right:0; bottom:1px;"></span>`;
    }

    game.dice3d.show(data).then((displayed) => {});
    ChatMessage.create({
      user: game.user._id,
      content: chatMessage,
      other: game.users.entities.filter((u) => u.isGM).map((u) => u._id),
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
    });
  }
}
