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
  prepareData() {
    super.prepareData();

    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    if (actorData.type === 'character') this._prepareCharacterData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    const data = actorData.data;

    // Make modifications to data here. For example:
    // this.actor.update({ 'data.general.air.value': this.actor.data.data.general.air.value - game.alienrpg.rollArr.r2One });
    // this.actor.update({ 'data.general.food.value': this.actor.data.data.general.food.value - game.alienrpg.rollArr.r2One });
    // this.actor.update({ 'data.general.power.value': this.actor.data.data.general.power.value - game.alienrpg.rollArr.r2One });
    // this.actor.update({ 'data.general.water.value': this.actor.data.data.general.water.value - game.alienrpg.rollArr.r2One });

    //   // Loop through ability scores, and add their modifiers to our sheet output.
    //   for (let [key, ability] of Object.entries(data.abilities)) {
    //     // Calculate the modifier using d20 rules.
    //     ability.mod = Math.floor((ability.value - 10) / 2);
    //   }
    // }

    // Loop through Skill scores, and add their attribute modifiers to our sheet output.
    for (let [key, skill] of Object.entries(data.skills)) {
      // Calculate the modifier using d20 rules.
      const conAtt = skill.ability;
      skill.mod = skill.value + data.attributes[conAtt].value;
    }
  }
}
