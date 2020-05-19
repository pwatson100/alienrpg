export class yze {
  // static async panicRoll() {
  //   // Roll against the panic table and push the roll to the chat log.
  //   let chatMessage = '';
  //   const table = game.tables.getName('Panic Table');
  //   const roll = new Roll('1d6 + @stress', actor.getRollData());
  //   const customResults = table.roll({ roll });
  //   chatMessage += '<h2>Panic Condition</h2>';
  //   chatMessage += `<h4><i>${table.data.description}</i></h4>`;
  //   chatMessage += `${customResults.results[0].text}`;
  //   ChatMessage.create({ user: game.user._id, content: chatMessage, other: game.users.entities.filter((u) => u.isGM).map((u) => u._id), type: CONST.CHAT_MESSAGE_TYPES.OTHER });
  // };

  /**
   * YZEDice RollFunction.
   * Paramfornumber of dice to roll for each die type/rolls
   * @param {number} r1Dice
   * @param {number} r2Dice
   * @param {number} r3Dice
   */
  static async yzeRoll(label, r1Dice, col1, r2Dice, col2, r3Dice, col3) {
    //  So lets start...

    let chatMessage = '';
    const rollArr = { r1One: 0, r1Six: 0, r2One: 0, r2Six: 0, r3One: 0, r3Six: 0 };
    const data = {
      formula: '',
      results: [],
      whisper: [],
      blind: false,
    };
    const dResults = [];

    function yzeDRoll(numDie, yzeR6, yzeR1) {
      let die = new Die(6);
      die.roll(numDie);
      die.results.forEach((el) => {
        data.results.push(el);
      });

      die.countSuccess(6, '=');
      rollArr[yzeR6] = die.total;
      die.countSuccess(1, '=');
      rollArr[yzeR1] = die.total;
      chatMessage += 'Ones: ';
      chatMessage += `${rollArr[yzeR1]}`;
      chatMessage += '  Sixes: ';
      chatMessage += `${rollArr[yzeR6]}`;
      chatMessage += '<div><br></div>';
    }
    if (r1Dice < 1) {
      chatMessage += 'You must have at least one dice set to roll';
    } else {
      chatMessage += '<h2>' + game.i18n.localize('ALIENRPG.Rolling') + ' ' + label + ' </h2>';
      chatMessage += '<div>' + col1 + ' - ' + r1Dice + '</div>';
      yzeDRoll(r1Dice, 'r1Six', 'r1One');
      data.formula = r1Dice + 'd6';

      if (r2Dice > 0) {
        chatMessage += '<div>' + col2 + ' - ' + r2Dice + '</div>';
        yzeDRoll(r2Dice, 'r2Six', 'r2One');
        data.formula = r1Dice + r2Dice + 'd6';
      }
      if (r3Dice > 0) {
        chatMessage += '<div>' + col3 + ' - ' + r3Dice + '</div>';
        yzeDRoll(r3Dice, 'r3Six', 'r3One');
        data.formula = r1Dice + r2Dice + r3Dice + 'd6';
      }
      const btnStyling = 'width:65px; height:50px; font-size:45px;line-height:1px';
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
