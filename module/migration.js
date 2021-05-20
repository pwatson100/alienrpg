/**
 * Perform a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs
 * @return {Promise}      A Promise which resolves once the migration is completed
 */
export const migrateWorld = async function () {
  ui.notifications.info(`Applying AlienRPG System Migration for version ${game.system.data.version}. Please be patient and do not close your game or shut down your server.`, { permanent: true });
  debugger;
  for (let actor of game.actors.contents) {
    try {
      const update = await migrateActorData(actor.data);
      if (!isObjectEmpty(update)) {
        await actor.update(update, { enforceTypes: false });
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Migrate World Actors
  for (let a of game.actors.contents) {
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
  for (let i of game.items.contents) {
    try {
      const updateData = migrateItemData(i.data);
      if (!isObjectEmpty(updateData)) {
        console.warn(`Migrating Item entity ${i.name}`, updateData);
        await i.update(updateData, { enforceTypes: false });
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Migrate Actor Override Tokens
  for (let s of game.scenes.contents) {
    try {
      const updateData = migrateSceneData(s.data);
      if (!isObjectEmpty(updateData)) {
        // console.log(`Migrating Scene entity ${s.name}`);
        await s.update(updateData, { enforceTypes: false });
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Set the migration as complete
  game.settings.set('alienrpg', 'systemMigrationVersion', game.system.data.version);
  ui.notifications.info(`AlienRPG System Migration to version ${game.system.data.version} completed!`, { permanent: true });
};

/* -------------------------------------------- */
const migrateActorData = async (actor) => {
  let updateData = {};
  if (actor.type === 'character' || actor.type === 'synthetic' || actor.type === 'vehicles') {
    // update = setValueIfNotExists(update, actor, 'data.general.sp.value', 0);
    // update = setValueIfNotExists(update, actor, 'data.general.sp.max', 3);
    // update = setValueIfNotExists(update, actor, 'data.general.cash.value', 0);

    if (actor.data.attributes.water != undefined) {
      console.log('there is some water');
      updateData[`data.attributes.-=water`] = null;
    }
    if (actor.data.attributes.food != undefined) {
      console.log('there is some food');
      updateData[`data.attributes.-=food`] = null;
    }
    if (actor.data.attributes.air != undefined) {
      console.log('there is some air');
      updateData[`data.attributes.-=air`] = null;
    }
    if (actor.data.attributes.power != undefined) {
      console.log('there is some power');
      updateData[`data.attributes.-=power`] = null;
    }
    if (actor.data.attributes.rounds != undefined) {
      console.log('there is some rounds');
      updateData[`data.attributes.-=rounds`] = null;
    }
  }
  let itemsChanged = false;
  const items = actor.items.map(async (item) => {
    const itemUpdate = await migrateItemData(item);
    if (!isObjectEmpty(itemUpdate)) {
      itemsChanged = true;
      return await mergeObject(item, itemUpdate, { enforceTypes: false, inplace: false });
    }
    return item;
  });
  if (itemsChanged) {
    updateData.items = items;
  }
  return updateData;
};

/**
 * Migrate a single Item entity to incorporate latest data model changes
 * @param item
 */
export const migrateItemData = function (item) {
  // console.log('migrateItemData -> item', item);
  const updateData = {};

  // Remove deprecated fields
  //_migrateRemoveDeprecated(item, updateData);

  // Return the migrated update data
  return updateData;
};

/**
 * Apply migration rules to all Entities within a single Compendium pack
 * @param pack
 * @return {Promise}
 */
// export const migrateCompendium = async function (pack) {
//   const entity = pack.metadata.entity;
//   if (!['Actor', 'Item', 'Scene'].includes(entity)) return;

//   // Begin by requesting server-side data model migration and get the migrated content
//   await pack.migrate();
//   const content = await pack.getContent();

//   // Iterate over compendium entries - applying fine-tuned migration functions
//   for (let ent of content) {
//     try {
//       let updateData = null;
//       if (entity === 'Item') updateData = migrateItemData(ent.data);
//       else if (entity === 'Actor') updateData = migrateActorData(ent.data);
//       else if (entity === 'Scene') updateData = migrateSceneData(ent.data);
//       // console.warn('ent.data,updateData', ent.data, updateData);
//       if (!isObjectEmpty(updateData)) {
//         expandObject(updateData);
//         updateData['_id'] = ent._id;
//         await pack.updateEntity(updateData);
//         console.log(`Migrated ${entity} entity ${ent.name} in Compendium ${pack.collection}`);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   }
//   // console.log(`Migrated all ${entity} entities from Compendium ${pack.collection}`);
// };

/* -------------------------------------------- */
/*  Entity Type Migration Helpers               */
/* -------------------------------------------- */

/**
 * Migrate a single Actor entity to incorporate latest data model changes
 * Return an Object of updateData to be applied
 * @param {Actor} actor   The actor to Update
 * @return {Object}       The updateData to apply
 */
// const migrateActorData = (actor) => {
//   // console.log('migrateActorData -> actor', actor);
//   const data = actor.data;
//   const updateData = {};

//   if (actor.type === 'character' || actor.type === 'synthetic') {
//     updateData[`data.general.sp.value`] = 0;
//     updateData[`data.general.sp.max`] = 3;
//     updateData[`data.general.cash.value`] = 0;
//     updateData[`data.general.adhocitems`] = '';

//     if (data.adhocitems != undefined) {
//       console.log('there is some ');
//       updateData[`data.general.adhocitems`] = data.adhocitems;
//       updateData[`data.-=adhocitems`] = null;
//     }
//   }

//   // Remove deprecated fields
//   _migrateRemoveDeprecated(actor, updateData);

//   // Migrate Owned Items
//   if (!actor.items) return updateData;
//   let hasItemUpdates = false;
//   const items = actor.items.map((i) => {
//     // Migrate the Owned Item
//     let itemUpdate = migrateItemData(i);

//     // Update the Owned Item
//     if (!isObjectEmpty(itemUpdate)) {
//       hasItemUpdates = true;
//       return mergeObject(i, itemUpdate, { enforceTypes: false, inplace: false });
//     } else return i;
//   });
//   if (hasItemUpdates) updateData.items = items;
//   return updateData;
// };

/* -------------------------------------------- */

/**
 * Scrub an Actor's system data, removing all keys which are not explicitly defined in the system template
 * @param {Object} actorData    The data object for an Actor
 * @return {Object}             The scrubbed Actor data
 */
// function cleanActorData(actorData) {
//   // Scrub system data
//   const model = game.system.model.Actor[actorData.type];
//   actorData.data = filterObject(actorData.data, model);

//   // Scrub system flags
//   const allowedFlags = CONFIG.ALIENRPG.allowedActorFlags.reduce((obj, f) => {
//     obj[f] = null;
//     return obj;
//   }, {});
//   if (actorData.flags.alienrpg) {
//     actorData.flags.alienrpg = filterObject(actorData.flags.alienrpg, allowedFlags);
//   }

//   // Return the scrubbed data
//   return actorData;
// }

/* -------------------------------------------- */

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
// const _migrateRemoveDeprecated = function (ent, updateData) {
//   const flat = flattenObject(ent.data);
//   // console.warn('flat', flat);
//   // Identify objects to deprecate
//   const toDeprecate = Object.entries(flat)
//     .filter((e) => e[0].endsWith('_deprecated') && e[1] === true)
//     .map((e) => {
//       let parent = e[0].split('.');
//       parent.pop();
//       return parent.join('.');
//     });

//   // Remove them
//   for (let k of toDeprecate) {
//     let parts = k.split('.');
//     parts[parts.length - 1] = '-=' + parts[parts.length - 1];
//     updateData[`data.${parts.join('.')}`] = null;
//   }
// };

const setValueIfNotExists = (update, object, property, newValue) => {
  if (typeof getProperty(object, property) === 'undefined') {
    update[property] = newValue;
  }
  return update;
};
