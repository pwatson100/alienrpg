export class alienrolls extends ActorSheet {
  panicRoll = () => {
    // Roll against the panic table and push the roll to the chat log.
    let chatMessage = '';
    const table = game.tables.getName('Panic Table');
    const roll = new Roll('1d6 + @stress', this.actor.getRollData());
    const customResults = table.roll({ roll });
    chatMessage += '<h2>Panic Condition</h2>';
    chatMessage += `<h4><i>${table.data.description}</i></h4>`;
    chatMessage += `${customResults.results[0].text}`;
    ChatMessage.create({ user: game.user._id, content: chatMessage, other: game.users.entities.filter((u) => u.isGM).map((u) => u._id), type: CONST.CHAT_MESSAGE_TYPES.OTHER });
  };
  /**
   * YZEDice RollFunction.
   * Paramfornumber of dice to roll for each die type/rolls
   * @param {number} r1Dice
   * @param {number} r2Dice
   * @param {number} r3Dice
   */
  async yzeRoll(r1Dice, r2Dice, r3Dice) {
    //   This finally works
    let chatMessage = "";
    const rollArr = { r1One: 0, r1Six: 0, r2One: 0, r2Six: 0, r3One: 0, r3Six: 0, };

    function yzeRoll(numDie, yzeR6, yzeR1) {
      let die = new Die(6);
      die.roll(numDie);
      die.countSuccess(6, "=");
      rollArr[yzeR6] = die.total;
      die.countSuccess(1, "=");
      rollArr[yzeR1] = die.total;
      chatMessage += "Ones: ";
      chatMessage += `${rollArr[yzeR1]}`;
      chatMessage += "  Sixes: ";
      chatMessage += `${rollArr[yzeR6]}`;
      chatMessage += "<div><br></div>";
    }
    if (r1Dice < 1) {
      chatMessage += "You must have at least one dice set to roll";
    } else {
      chatMessage += "<h2>Numbers</h2>";
      chatMessage += "<div>Roll 1</div>";
      yzeRoll(r1Dice, 'r1Six', 'r1One');

      if (r2Dice > 0) {
        chatMessage += "<div>Roll 2</div>";
        yzeRoll(r2Dice, 'r2Six', 'r2One');
      }
      if (r3Dice > 0) {
        chatMessage += "<div>Roll 3</div>";
        yzeRoll(r3Dice, 'r3Six', 'r3One');
      }
    }
    //console.log(rollArr);

    ChatMessage.create({
      user: game.user._id,
      content: chatMessage, other:
        game.users.entities.filter(u => u.isGM).map(u => u._id), type: CONST.CHAT_MESSAGE_TYPES.OTHER
    });
  }
}