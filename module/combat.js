export default class AlienRPGCombat extends Combat {
  /**
   * Define how the array of Combatants is sorted in the displayed list of the tracker.
   * This method can be overridden by a system or module which needs to display combatants in an alternative order.
   * By default sort by initiative, falling back to name
   * @private
   */
  _sortCombatants(a, b) {
    const ia = Number.isNumeric(a.initiative) ? a.initiative : -9999;
    const ib = Number.isNumeric(b.initiative) ? b.initiative : -9999;
    let ci = ia - ib;
    if ( ci !== 0 ) return ci;
    let [an, bn] = [a.token?.name || "", b.token?.name || ""];
    let cn = an.localeCompare(bn);
    if ( cn !== 0 ) return cn;
    return a.tokenId - b.tokenId;
  }
  
  async rollInitiative(ids, {formula=null, updateTurn=true, messageOptions={}}={}) {
    
    // Structure input data
    ids = typeof ids === "string" ? [ids] : ids;
    const currentId = this.combatant._id;
    const draw = {1:false,2:false,3:false,4:false,5:false,6:false,7:false,8:false,9:false,10:false};

    // Iterate over Combatants, performing an initiative roll for each
    const [updates, messages] = ids.reduce((results, id, i) => {
      if (i>9) {
        ui.notifications.error(
          `You can only automatically roll Initiative for 10 PCs/NPCs.  Roll initiative manually for the remaining actors or split in to multiple encounters in the Combat Tracker`,
        );
        return results;
      }
      
      let [updates, messages] = results;

      // Get Combatant data
      const c = this.getCombatant(id);
      if ( !c || !c.owner ) return results;

      // Roll initiative
      const cf = formula || this._getInitiativeFormula(c);

    let roll = this.getInit(c, cf, updates);
      while (draw[roll.total]){
        roll = this.getInit(c, cf, updates);
      }
      draw[roll.total] = true;
      updates.push({_id: id, initiative: roll.total});

      // Determine the roll mode
      let rollMode = messageOptions.rollMode || game.settings.get("core", "rollMode");
      if (( c.token.hidden || c.hidden ) && (rollMode === "roll") ) rollMode = "gmroll";
{/* <img width="125" height="175" src="systems/alienrpg/images/cards/card-${roll.total}.png" style="horizontal-align:centre"> */}
      let cardPath = `<div style="text-align: center;"><img width="125" height="175" src="systems/alienrpg/images/cards/card-${roll.total}.png"></div>`;
      // if (!game.settings.get(ssmoduleKey, 'imported' || !game.settings.get(crmoduleKey, 'imported')){
      try {
              if (game.settings.get(crmoduleKey, 'imported')){
        cardPath = `<div style="text-align: center;"><img width="125" height="175" src="modules/alienrpg-corerules/images/cards/card-${roll.total}.png"></div>`;
      }
      } catch (error) {
        try {
          if (game.settings.get(ssmoduleKey, 'imported')){
    cardPath = `<div style="text-align: center;"><img width="125" height="175" src="modules/alienrpg-starterset/images/cards/card-${roll.total}.png"></div>`;
  }
  } catch (error) {
  }  
      }  

      // Construct chat message data
      let messageData = mergeObject({
        speaker: {
          scene: canvas.scene._id,
          actor: c.actor ? c.actor._id : null,
          token: c.token._id,
          alias: c.token.name
        },
        flavor: `${c.token.name} rolls for Initiative! <br> ${cardPath}`,
        flags: {"core.initiativeRoll": true}
      }, messageOptions);
      const chatData = roll.toMessage(messageData, {create:false, rollMode});

      // Play 1 sound for the whole rolled set
      if ( i > 0 ) chatData.sound = null;
      messages.push(chatData);

      // Return the Roll and the chat data
      return results;
    }, [[], []]);
    if ( !updates.length ) return this;

    // Update multiple combatants
    await this.updateEmbeddedEntity("Combatant", updates);

    // Ensure the turn order remains with the same combatant
    if ( updateTurn ) {
      await this.update({turn: this.turns.findIndex(t => t._id === currentId)});
    }

    // Create multiple chat messages
    await CONFIG.ChatMessage.entityClass.create(messages);

    // Return the updated Combat
    return this;
    
  }


    getInit(c, cf, updates, roll) {
        roll = this._getInitiativeRoll(c, cf);
        if (updates.some(updates => updates["initiative"] === roll.total ) ) {
            this.getInit( c, cf, updates);
        } else {
            return roll;
            }
            return roll;
     
    }

}