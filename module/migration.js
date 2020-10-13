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
        await a.update(updateData, { enforceTypes: true });
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Migrate World Items
  for (let i of game.items.entities) {
    try {
      const updateData = migrateItemData(i.data);
      if (!isObjectEmpty(updateData)) {
        console.log(`Migrating Item entity ${i.name}`);
        await i.update(updateData, { enforceTypes: false });
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Migrate Actor Override Tokens
  for (let s of game.scenes.entities) {
    try {
      const updateData = migrateSceneData(s.data);
      if (!isObjectEmpty(updateData)) {
        console.log(`Migrating Scene entity ${s.name}`);
        await s.update(updateData, { enforceTypes: false });
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Migrate World Compendium Packs
  const packs = game.packs.filter((p) => {
    return p.metadata.package === 'world' && ['Actor', 'Item', 'Scene'].includes(p.metadata.entity);
  });
  for (let p of packs) {
    await migrateCompendium(p);
  }

  // Migrate Chariot of the Gods Compendium Packs
  const cGpacks = game.packs.filter((cp) => {
    return cp.metadata.package === 'ChariotsOfTheGods' && ['Actor', 'Item', 'Scene'].includes(cp.metadata.entity);
  });
  for (let cp of cGpacks) {
    await migrateCompendium(cp);
  }

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
  // if (!['Actor', 'Item', 'Scene'].includes(entity)) return;

  // Begin by requesting server-side data model migration and get the migrated content
  await pack.migrate();
  const content = await pack.getContent();

  // Iterate over compendium entries - applying fine-tuned migration functions
  for (let ent of content) {
    try {
      let updateData = null;
      if (entity === 'Item') updateData = migrateItemData(ent.data);
      else if (entity === 'Actor') updateData = migrateActorData(ent.data);
      else if (entity === 'Scene') updateData = migrateSceneData(ent.data);
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
  console.log(`Migrated all ${entity} entities from Compendium ${pack.collection}`);
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
  // console.log("migrateActorData -> actor", actor)
  const updateData = {};
  if (actor.type === 'creature') {
    if (actor.token.actorLink === true) {
      actor.token.actorLink = false;
    }
  } else if (actor.type === 'character' || 'synthetic') {
    if (actor.data.skills.comtech.ability === 'emp') {
      updateData['data.skills.comtech.ability'] = 'wit';
    }
    if (actor.data.skills.survival.ability === 'emp') {
      updateData['data.skills.survival.ability'] = 'wit';
    }
    if (actor.data.skills.observation.ability === 'emp') {
      updateData['data.skills.observation.ability'] = 'wit';
    }
    if (actor.data.skills.command.ability === 'wit') {
      updateData['data.skills.command.ability'] = 'emp';
    }
    if (actor.data.skills.manipulation.ability === 'wit') {
      updateData['data.skills.manipulation.ability'] = 'emp';
    }
    if (actor.data.skills.medicalAid.ability === 'wit') {
      updateData['data.skills.medicalAid.ability'] = 'emp';
    }
    if (actor.data.general.panic.value === null) {
      updateData['actor.data.general.panic.value'] = 0;
      updateData['actor.data.general.panic.max'] = 1;
    }
  }
  const data = actor.data;
  // Loop through Skill scores, and add their attribute modifiers to our sheet output.
  for (let [key, skill] of Object.entries(data.skills)) {
    // Calculate the modifier using d20 rules.
    const conAtt = skill.ability;
    skill.mod = skill.value + data.attributes[conAtt].value;
    // console.warn('skill.mod', skill.mod);
  }

  // Remove deprecated fields
  _migrateRemoveDeprecated(actor, updateData);

  // Migrate Owned Items
  if (!actor.items) return updateData;
  let hasItemUpdates = false;
  const items = actor.items.map((i) => {
    // Migrate the Owned Item
    let itemUpdate = migrateItemData(i);

    // Update the Owned Item
    if (!isObjectEmpty(itemUpdate)) {
      hasItemUpdates = true;
      return mergeObject(i, itemUpdate, { enforceTypes: false, inplace: false });
    } else return i;
  });
  if (hasItemUpdates) updateData.items = items;
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
  const updateData = {};

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
