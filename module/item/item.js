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

    // Get the Item's data
    const itemData = this.data;
    const actorData = this.actor ? this.actor.data : {};
    const data = itemData.data;
  }
  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */

  async roll() {
    // Basic template rendering data
    const token = this.actor.token;
    const item = this.data;
    const actorData = this.actor ? this.actor.data.data : {};
    const itemData = item.data;
    // let roll;
    let r2Data = this.actor.getRollData().stress;
    let label = `${item.name}`;
    // Define the roll formula.
    if (item.data.header.type.value === "Ranged") {
      let r1Data = (actorData.skills.rangedCbt.mod + itemData.attributes.bonus.value);
      this.yzeRoll(label, r1Data, 'Black', r2Data, 'Yellow');
    } else if (item.data.header.type.value === "Melee") {
      let r1Data = (actorData.skills.closeCbt.mod + itemData.attributes.bonus.value);
      this.yzeRoll(label, r1Data, 'Black', r2Data, 'Yellow');
    } else { console.log('No type on item'); };
  }


  yzeRoll(label, r1Dice, col1, r2Dice, col2, r3Dice, col3) {
    //   This finally works
    let chatMessage = "";
    const rollArr = { r1One: 0, r1Six: 0, r2One: 0, r2Six: 0, r3One: 0, r3Six: 0, };
    const data = {
      formula: '',
      results: [],
      whisper: [],
      blind: false
    }
    const dResults = [];

    function yzeDRoll(numDie, yzeR6, yzeR1) {
      let die = new Die(6);
      die.roll(numDie);
      die.results.forEach(el => { data.results.push(el); });
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
      chatMessage += "<h2>Rolling " + label + " </h2>";
      chatMessage += "<div>" + col1 + " - " + r1Dice + "</div>";
      yzeDRoll(r1Dice, 'r1Six', 'r1One');
      data.formula = r1Dice + "d6";

      if (r2Dice > 0) {
        chatMessage += "<div>" + col2 + " - " + r2Dice + "</div>";
        yzeDRoll(r2Dice, 'r2Six', 'r2One');
        data.formula = r1Dice + r2Dice + "d6";
      }
      if (r3Dice > 0) {
        chatMessage += "<div>" + col3 + " - " + r3Dice + "</div>";
        yzeDRoll(r3Dice, 'r3Six', 'r3One');
        data.formula = r1Dice + r2Dice + r3Dice + "d6";
      }
    }
    game.dice3d.show(data).then(displayed => { });
    ChatMessage.create({
      user: game.user._id,
      content: chatMessage, other:
        game.users.entities.filter(u => u.isGM).map(u => u._id), type: CONST.CHAT_MESSAGE_TYPES.OTHER
    })
  }

}
