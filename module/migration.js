/**
 * Perform a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs
 * @return {Promise}      A Promise which resolves once the migration is completed
 */
export const migrateWorld = async function () {
  ui.notifications.info(`Applying AlienRPG System Migration for version ${game.system.data.version}. Please be patient and do not close your game or shut down your server.`, { permanent: true });

  // Migrate World Actors
  for (let a of game.actors.entities) {
    try {
      console.warn('Tyring to migrate actors');
      // console.warn('Pre actor', a.data);
      const updateData = migrateActorData(a.data);
      // console.warn('updateData', updateData, a.data);
      if (!isObjectEmpty(updateData)) {
        console.log(`Migrating Actor entity ${a.name}`);
        await a.update(updateData, { enforceTypes: false });
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Migrate World Items
  // for (let i of game.items.entities) {
  //   try {
  //     const updateData = migrateItemData(i.data);
  //     if (!isObjectEmpty(updateData)) {
  //       console.warn(`Migrating Item entity ${i.name}`, updateData);
  //       await i.update(updateData, { enforceTypes: false });
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }

  // Migrate Actor Override Tokens
  // for (let s of game.scenes.entities) {
  //   try {
  //     const updateData = migrateSceneData(s.data);
  //     if (!isObjectEmpty(updateData)) {
  //       // console.log(`Migrating Scene entity ${s.name}`);
  //       await s.update(updateData, { enforceTypes: false });
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }

  // Migrate World Compendium Packs
  const packs = game.packs.filter((p) => {
    return p.metadata.package === 'world' && ['Actor', 'Item', 'Scene'].includes(p.metadata.entity);
  });
  for (let p of packs) {
    await migrateCompendium(p);
  }

  // // Migrate Base Rules Compendium Packs
  // const bRpacks = game.packs.filter((cp) => {
  //   return cp.metadata.package === 'AlienRPG-CoreRules' && ['Actor', 'Item'].includes(cp.metadata.entity);
  // });
  // for (let cp of bRpacks) {
  //   await migrateCompendium(cp);
  // }

  // // Migrate Chariot of the Gods Compendium Packs
  // const cGpacks = game.packs.filter((cg) => {
  //   return cg.metadata.package === 'AlienRPG-ChariotOfTheGods' && ['Actor', 'Item'].includes(cg.metadata.entity);
  // });
  // for (let cg of cGpacks) {
  //   await migrateCompendium(cg);
  // }

  // Set the migration as complete
  game.settings.set('alienrpg', 'systemMigrationVersion', game.system.data.version);
  ui.notifications.info(`AlienRPG System Migration to version ${game.system.data.version} completed!`, { permanent: true });
};

/* -------------------------------------------- */

/**
 * Apply migration rules to all Entities within a single Compendium pack
 * @param pack
 * @return {Promise}
 */
export const migrateCompendium = async function (pack) {
  const entity = pack.metadata.entity;
  if (!['Actor', 'Item', 'Scene'].includes(entity)) return;

  // Begin by requesting server-side data model migration and get the migrated content
  await pack.migrate();
  const content = await pack.getContent();

  // Iterate over compendium entries - applying fine-tuned migration functions
  for (let ent of content) {
    try {
      let updateData = null;
      // if (entity === 'Item') updateData = migrateItemData(ent.data);
      if (entity === 'Actor') updateData = migrateActorData(ent.data);
      // else if (entity === 'Scene') updateData = migrateSceneData(ent.data);
      // console.warn('ent.data,updateData', ent.data, updateData);
      if (!isObjectEmpty(updateData)) {
        expandObject(updateData);
        updateData['_id'] = ent._id;
        await pack.updateEntity(updateData);
        console.log(`Migrated ${entity} entity ${ent.name} in Compendium ${pack.collection}`);
      }
    } catch (err) {
      console.error(err);
    }
  }
  // console.log(`Migrated all ${entity} entities from Compendium ${pack.collection}`);
};

/* -------------------------------------------- */
/*  Entity Type Migration Helpers               */
/* -------------------------------------------- */

/**
 * Migrate a single Actor entity to incorporate latest data model changes
 * Return an Object of updateData to be applied
 * @param {Actor} actor   The actor to Update
 * @return {Object}       The updateData to apply
 */
const migrateActorData = (actor) => {
  // console.log('migrateActorData -> actor', actor);
  const data = actor.data;
  const updateData = {};
  // if (actor.type === 'creature') {
  //   if (actor.token.actorLink === true) {
  //     actor.token.actorLink = false;
  //   }
  // }
  if (actor.type === 'character' || actor.type === 'synthetic') {
    updateData[`data.general.sp.value`] = '0';
    updateData[`data.general.sp.max`] = '3';
    updateData[`data.general.cash.value`] = 0;
    updateData[`data.general.adhocitems`] = '';
    if (data.adhocitems) {
      updateData[`data.general.adhocitems`] = data.adhocitems;
      updateData[`data.-=adhocitems`] = null;
    }
    // Loop through Skill scores, and add their attribute modifiers to our sheet output.
    // for (let [key, skill] of Object.entries(data.skills)) {
    //   // Calculate the modifier using d20 rules.
    //   const conAtt = skill.ability;
    //   skill.mod = skill.value + data.attributes[conAtt].value;
    // console.warn('skill.mod', skill.mod);
    // }
    // switch (data.general.career.value) {
    //   case 'Colonial Marine':
    //     updateData[`data.general.career.value`] = '1';
    //     // data.general.career.value = 1;
    //     break;
    //   case 'Colonial Marshal':
    //     updateData[`data.general.career.value`] = '2';
    //     // data.general.career.value = 2;
    //     break;
    //   case 'Company Agent':
    //     updateData[`data.general.career.value`] = '3';
    //     // data.general.career.value = 3;
    //     break;
    //   case 'Kid':
    //     updateData[`data.general.career.value`] = '4';
    //     // data.general.career.value = 4;
    //     break;
    //   case 'Medic':
    //     updateData[`data.general.career.value`] = '5';
    //     // data.general.career.value = 5;
    //     break;
    //   case 'Mercenary':
    //     updateData[`data.general.career.value`] = '6';
    //     // data.general.career.value = 6;
    //     break;
    //   case 'Officer':
    //     updateData[`data.general.career.value`] = '7';
    //     // data.general.career.value = 7;
    //     break;
    //   case 'Pilot':
    //     updateData[`data.general.career.value`] = '8';
    //     // data.general.career.value = 8;
    //     break;
    //   case 'Roughneck':
    //     updateData[`data.general.career.value`] = '9';
    //     // data.general.career.value = 9;
    //     break;
    //   case 'Scientist':
    //     updateData[`data.general.career.value`] = '10';
    //     // data.general.career.value = 10;
    //     break;
    //   case 'Synthetic':
    //     updateData[`data.general.career.value`] = '11';
    //     // data.general.career.value = 11;
    //     break;

    //   default:
    //     break;
    // }
    // data.skills.heavyMach.description = 'Heavy Machinery';
    // updateData[`data.skills.heavyMach.description.-=value`] = null;
    // updateData[`data.skills.heavyMach`] = { description: 'Heavy Machinery' };
    // // data.skills.closeCbt.description = 'Close Combat';
    // updateData[`data.skills.closeCbt.description.-=value`] = null;
    // updateData[`data.skills.closeCbt`] = { description: 'Close Combat' };

    // // data.skills.stamina.description = 'Stamina';
    // updateData[`data.skills.stamina.description.-=value`] = null;
    // updateData[`data.skills.stamina`] = { description: 'Stamina' };

    // // data.skills.rangedCbt.description = 'Ranged Combat';
    // updateData[`data.skills.rangedCbt.description.-=value`] = null;
    // updateData[`data.skills.rangedCbt`] = { description: 'Ranged Combat' };

    // // data.skills.mobility.description = 'Mobility';
    // updateData[`data.skills.mobility.description.-=value`] = null;
    // updateData[`data.skills.mobility`] = { description: 'Mobility' };

    // // data.skills.piloting.description = 'Piloting';
    // updateData[`data.skills.piloting.description.-=value`] = null;
    // updateData[`data.skills.piloting`] = { description: 'Piloting' };

    // // data.skills.command.description = 'Command';
    // updateData[`data.skills.command.description.-=value`] = null;
    // updateData[`data.skills.command`] = { description: 'Command' };

    // // data.skills.manipulation.description = 'Manipulation';
    // updateData[`data.skills.manipulation.description.-=value`] = null;
    // updateData[`data.skills.manipulation`] = { description: 'Manipulation' };

    // // data.skills.medicalAid.description = 'Medical Aid';
    // updateData[`data.skills.medicalAid.description.-=value`] = null;
    // updateData[`data.skills.medicalAid`] = { description: 'Medical Aid' };

    // // data.skills.observation.description = 'Observation';
    // updateData[`data.skills.observation.description.-=value`] = null;
    // updateData[`data.skills.observation`] = { description: 'Observation' };

    // // data.skills.survival.description = 'Survival';
    // updateData[`data.skills.survival.description.-=value`] = null;
    // updateData[`data.skills.survival`] = { description: 'Survival' };

    // // data.skills.comtech.description = 'Comtech';
    // updateData[`data.skills.comtech.description.-=value`] = null;
    // updateData[`data.skills.comtech`] = { description: 'Comtech' };
  }

  // Remove deprecated fields
  // _migrateRemoveDeprecated(actor, updateData);

  // Migrate Owned Items
  // if (!actor.items) return updateData;
  // let hasItemUpdates = false;
  // const items = actor.items.map((i) => {
  //   // Migrate the Owned Item
  //   let itemUpdate = migrateItemData(i);

  //   // Update the Owned Item
  //   if (!isObjectEmpty(itemUpdate)) {
  //     hasItemUpdates = true;
  //     return mergeObject(i, itemUpdate, { enforceTypes: false, inplace: false });
  //   } else return i;
  // });
  // if (hasItemUpdates) updateData.items = items;
  return updateData;
};

/* -------------------------------------------- */

/**
 * Scrub an Actor's system data, removing all keys which are not explicitly defined in the system template
 * @param {Object} actorData    The data object for an Actor
 * @return {Object}             The scrubbed Actor data
 */
function cleanActorData(actorData) {
  // Scrub system data
  const model = game.system.model.Actor[actorData.type];
  actorData.data = filterObject(actorData.data, model);

  // Scrub system flags
  const allowedFlags = CONFIG.ALIENRPG.allowedActorFlags.reduce((obj, f) => {
    obj[f] = null;
    return obj;
  }, {});
  if (actorData.flags.alienrpg) {
    actorData.flags.alienrpg = filterObject(actorData.flags.alienrpg, allowedFlags);
  }

  // Return the scrubbed data
  return actorData;
}

/* -------------------------------------------- */

/**
 * Migrate a single Item entity to incorporate latest data model changes
 * @param item
 */
export const migrateItemData = function (item) {
  // console.log('migrateItemData -> item', item);
  const updateData = {};
  if (item.type === 'item') {
    console.log('migrateItemData -> item.data.header.type', item, item.data.header.type.value);
    // Item.update({"_id": 'V4Mp3mFnLxSrtbYX', "data.data.header.type.value": 1});

    switch (item.data.header.type.value) {
      case 'Data Storage':
        // updateData[`data.header.type.-=value`] = null;
        updateData[`data.header.type`] = { value: '1' };

        // updateData[`item.data.header.type`] = { value: 1 };
        break;
      case 'Diagnostics and Display':
        // updateData[`data.header.type.-=value`] = null;
        updateData[`data.header.type`] = { value: '2' };

        // updateData[`item.data.header.type`] = { value: 2 };
        // console.log('migrateItemData -> updateData', updateData);
        break;
      case 'Vision Devices':
        // updateData[`data.header.type.-=value`] = null;
        updateData[`data.header.type`] = { value: '3' };

        // updateData[`item.data.header.type`] = { value: 3 };
        // console.log('migrateItemData -> updateData', updateData);
        break;
      case 'Tools':
        // updateData[`item.data.header.type.-=value`] = null;
        updateData[`data.header.type`] = { value: '4' };

        // updateData[`item.data.header.type`] = { value: 4 };
        // console.log('migrateItemData -> updateData', updateData);
        break;
      case 'Medical Supplies':
        // updateData[`item.data.header.type.-=value`] = null;
        updateData[`data.header.type`] = { value: '5' };

        // updateData[`item.data.header.type`] = { value: 5 };
        // console.log('migrateItemData -> updateData', updateData);
        break;
      case 'Pharmaceuticals':
        // updateData[`item.data.header.type.-=value`] = null;
        updateData[`data.header.type`] = { value: '6' };

        // updateData[`item.data.header.type`] = { value: 6 };
        // console.log('migrateItemData -> updateData', updateData);
        break;
      case 'Food and Drink':
        // updateData[`item.data.header.type.-=value`] = null;
        updateData[`data.header.type`] = { value: '7' };

        // updateData[`item.data.header.type`] = { value: 7 };
        // console.log('migrateItemData -> updateData', updateData);
        break;

      default:
        break;
    }
  }

  if (item.type === 'weapon') {
    switch (item.data.header.type.value) {
      case 'Ranged':
        // updateData[`item.data.header.type.-=value`] = null;
        updateData[`data.header.type`] = { value: '1' };

        // updateData[`item.data.header.type.value`] = { value: 1 };
        break;
      case 'Melee':
        // updateData[`item.data.header.type.-=value`] = null;
        updateData[`data.header.type`] = { value: '2' };

        // updateData[`item.data.header.type.value`] = { value: 2 };
        break;

      default:
        break;
    }
  }
  if (item.type === 'talent') {
    switch (item.data.general.career.value) {
      case 'General Talent':
        // updateData[`item.data.general.career.-=value`] = null;
        updateData[`data.general.career`] = { value: '1' };

        // updateData[`item.data.general.career.value`] = { value: 1 };
        break;
      case 'Colonial Marine':
        // updateData[`item.data.general.career.-=value`] = null;
        updateData[`data.general.career`] = { value: '2' };

        // updateData[`item.data.general.career.value`] = { value: 2 };
        break;
      case 'Colonial Marshal':
        // updateData[`item.data.general.career.-=value`] = null;
        updateData[`data.general.career`] = { value: '3' };

        // updateData[`item.data.general.career.value`] = { value: 3 };
        break;
      case 'Company Agent':
        // updateData[`item.data.general.career.-=value`] = null;
        updateData[`data.general.career`] = { value: '4' };

        // updateData[`item.data.general.career.value`] = { value: 4 };
        break;
      case 'Kid':
        // updateData[`item.data.general.career.-=value`] = null;
        updateData[`data.general.career`] = { value: '5' };

        // updateData[`data.general.career.value`] = { value: 5 };
        break;
      case 'Medic':
        // updateData[`data.general.career.-=value`] = null;
        updateData[`data.general.career`] = { value: '6' };

        // updateData[`data.general.career.value`] = { value: 6 };
        break;
      case 'Mercenary':
        // updateData[`data.general.career.-=value`] = null;
        updateData[`data.general.career`] = { value: '7' };

        // updateData[`data.general.career.value`] = { value: 7 };
        break;
      case 'Officer':
        // updateData[`data.general.career.-=value`] = null;
        updateData[`data.general.career`] = { value: '8' };

        // updateData[`data.general.career.value`] = { value: 8 };
        break;
      case 'Pilot':
        // updateData[`data.general.career.-=value`] = null;
        updateData[`data.general.career`] = { value: '9' };

        // updateData[`data.general.career.value`] = { value: 9 };
        break;
      case 'Roughneck':
        // updateData[`data.general.career.-=value`] = null;
        updateData[`data.general.career`] = { value: '10' };

        // updateData[`data.general.career.value`] = { value: 10 };
        break;
      case 'Scientist':
        // updateData[`data.general.career.-=value`] = null;
        updateData[`data.general.career`] = { value: '11' };

        // updateData[`data.general.career.value`] = { value: 11 };
        break;

      default:
        break;
    }
  }

  // Remove deprecated fields
  _migrateRemoveDeprecated(item, updateData);

  // Return the migrated update data
  return updateData;
};

/* -------------------------------------------- */

/**
 * Migrate a single Scene entity to incorporate changes to the data model of it's actor data overrides
 * Return an Object of updateData to be applied
 * @param {Object} scene  The Scene data to Update
 * @return {Object}       The updateData to apply
 */
export const migrateSceneData = function (scene) {
  const tokens = duplicate(scene.tokens);
  return {
    tokens: tokens.map((t) => {
      if (!t.actorId || t.actorLink || !t.actorData.data) {
        t.actorData = {};
        return t;
      }
      const token = new Token(t);
      if (!token.actor) {
        t.actorId = null;
        t.actorData = {};
      } else if (!t.actorLink) {
        const updateData = migrateActorData(token.data.actorData);
        t.actorData = mergeObject(token.data.actorData, updateData);
      }
      return t;
    }),
  };
};

/* -------------------------------------------- */
/*  Low level migration utilities
/* -------------------------------------------- */

/* -------------------------------------------- */

/**
 * A general migration to remove all fields from the data model which are flagged with a _deprecated tag
 * @private
 */
const _migrateRemoveDeprecated = function (ent, updateData) {
  const flat = flattenObject(ent.data);
  // console.warn('flat', flat);
  // Identify objects to deprecate
  const toDeprecate = Object.entries(flat)
    .filter((e) => e[0].endsWith('_deprecated') && e[1] === true)
    .map((e) => {
      let parent = e[0].split('.');
      parent.pop();
      return parent.join('.');
    });

  // Remove them
  for (let k of toDeprecate) {
    let parts = k.split('.');
    parts[parts.length - 1] = '-=' + parts[parts.length - 1];
    updateData[`data.${parts.join('.')}`] = null;
  }
};
