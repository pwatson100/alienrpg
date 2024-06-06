/**
 * Perform a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs
 * @return {Promise}      A Promise which resolves once the migration is completed
 */
export const migrateWorld = async function () {
	ui.notifications.info(
		`Applying AlienRPG System Migration for version ${game.system.version}. Please be patient and do not close your game or shut down your server.`,
		{ permanent: true }
	);
	// debugger;
	// Migrate World Compendium Packs
	for (let p of game.packs) {
		if (!['alienrpg', 'alienrpg-corerules', 'alienrpg-destroyerofworlds', 'alienrpg-starterset', 'alienrpg-cmom'].includes(p.metadata.package)) continue;

		await migrateCompendium(p);

		// V9 check if entity exists otherwise use type
		// try {
		//   if (!['Actor', 'Item'].includes(p.metadata.entity));
		//   await migrateCompendium(p);
		// } catch (error) {
		//   if (!['Actor', 'Item'].includes(p.metadata.type));
		//   await migrateCompendium(p);
		// }
	}

	// Migrate World Actors
	for (let a of game.actors.contents) {
		try {
			console.warn('Tyring to migrate actors');
			// console.warn('Pre actor', a.data);
			const updateData = await migrateActorData(a.data);
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
	// for (let i of game.items.contents) {
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
	// for (let s of game.scenes.contents) {
	//   try {
	//     const updateData = migrateSceneData(s.data);
	//     if (!foundry.utils.isObjectEmpty(updateData)) {
	//       console.log(`Migrating Scene entity ${s.name}`);
	//       await s.update(updateData, { enforceTypes: false });
	//       // If we do not do this, then synthetic token actors remain in cache
	//       // with the un-updated actorData.
	//       s.tokens.contents.forEach((t) => (t._actor = null));
	//     }
	//   } catch (err) {
	//     err.message = `Failed AlienRPG system migration for Scene ${s.name}: ${err.message}`;
	//     console.error(err);
	//   }
	// }

	// Set the migration as complete
	game.settings.set('alienrpg', 'systemMigrationVersion', game.system.version);
	ui.notifications.info(`AlienRPG System Migration to version ${game.system.version} completed!`, { permanent: true });
};

/* -------------------------------------------- */
const migrateActorData = function (actor) {
	let updateData = {};
	let update = {};
	if (actor.type === 'character' || actor.type === 'synthetic') {
		// update = setValueIfNotExists(update, actor, 'data.general.sp.value', 0);
		// update = setValueIfNotExists(update, actor, 'data.general.xp.max', 20);
		// update = setValueIfNotExists(update, actor, 'data.general.cash.value', 0);

		// Catch clause (?) for Unlinked token stats that don't exist so it at least processes the items.

		if (actor.data?.general?.xp?.max === 10) {
			// console.log('data.general.xp.max', actor.data.general.xp.max);
			updateData[`data.general.xp.max`] = 20;
		}
		// if (actor.data?.attributes?.food != undefined) {
		//   console.log('there is some food');
		//   updateData[`data.attributes.-=food`] = null;
		// }
		// if (actor.data?.attributes?.air != undefined) {
		//   console.log('there is some air');
		//   updateData[`data.attributes.-=air`] = null;
		// }
		// if (actor.data?.attributes?.power != undefined) {
		//   console.log('there is some power');
		//   updateData[`data.attributes.-=power`] = null;
		// }
		// if (actor.data?.attributes?.rounds != undefined) {
		//   console.log('there are some rounds');
		//   updateData[`data.attributes.-=rounds`] = null;
		// }
	}
	if (actor.type === 'vehicles') {
		// update = setValueIfNotExists(update, actor, 'data.attributes.hull.max', actor.data.attributes.hull.value);

		if (actor.data?.attributes?.hull?.max === 0) {
			// console.log('data.general.xp.max', actor.data.general.xp.max);
			updateData[`data.attributes.hull.max`] = actor.data.attributes.hull.value;
		}
	}

	// Migrate Owned Items
	if (!actor.items) return updateData;
	const items = actor.items.reduce((arr, i) => {
		// Migrate the Owned Item
		const itemData = i instanceof CONFIG.Item.documentClass ? i.toObject() : i;
		let itemUpdate = migrateItemData(itemData);
		// debugger;
		// Update the Owned Item
		if (!isObjectEmpty(itemUpdate)) {
			itemUpdate._id = itemData._id;
			arr.push(expandObject(itemUpdate));
		}

		return arr;
	}, []);

	if (items.length > 0) updateData.items = items;
	// return update;
	return updateData;
};

/**
 * Migrate a single Item entity to incorporate latest data model changes
 * @param item
 */
const migrateItemData = function (item) {
	// console.log('migrateItemData -> item', item);
	const updateData = {};
	// if (item.type === 'armor') {
	//   updateData[`data.modifiers.attributes.agl.value`] = item.data.modifiers.agl.value;
	//   updateData[`data.modifiers.skills.survival.value`] = item.data.modifiers.survival.value;
	//   updateData[`data.modifiers.skills.heavyMach.value`] = item.data.modifiers.heavyMach.value;
	//   updateData[`data.modifiers.skills.closeCbt.value`] = item.data.modifiers.closeCbt.value;
	// }
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
export const migrateCompendium = async function (pack) {
	let entity = '';
	//   if (isNewerVersion(game.version,"0.8.9"))
	// {
	entity = pack.metadata.type;

	// } else {
	//       entity = pack.metadata.entity;

	// }
	// V9 check if entity exists otherwise use type
	// try {
	//   // debugger;
	//   entity = pack.metadata.entity;
	// } catch (error) {
	//   // debugger;
	//   entity = pack.metadata.type;
	// }

	if (!['Actor', 'Item'].includes(entity)) return;

	// Unlock the pack for editing
	const wasLocked = pack.locked;
	await pack.configure({ locked: false });

	// Begin by requesting server-side data model migration and get the migrated content
	await pack.migrate();
	const documents = await pack.getDocuments();

	// Iterate over compendium entries - applying fine-tuned migration functions
	for (let doc of documents) {
		let updateData = {};
		try {
			switch (entity) {
				case 'Actor':
					updateData = migrateActorData(doc.data);
					break;
				// case 'Item':
				//   updateData = migrateItemData(doc.toObject());
				//   break;
				// case "Scene":
				//   updateData = migrateSceneData(doc.data);
				//   break;
			}

			// Save the entry, if data was changed
			if (foundry.utils.isObjectEmpty(updateData)) continue;
			await doc.update(updateData);
			console.log(`Migrated ${entity} entity ${doc.name} in Compendium ${pack.collection}`);
		} catch (err) {
			// Handle migration failures
			err.message = `Failed AlienRPG system migration for entity ${doc.name} in pack ${pack.collection}: ${err.message}`;
			console.error(err);
		}
	}

	// Apply the original locked status for the pack
	await pack.configure({ locked: wasLocked });
	console.log(`Migrated all ${entity} entities from Compendium ${pack.collection}`);
};

/**
 * Migrate a single Scene entity to incorporate changes to the data model of it's actor data overrides
 * Return an Object of updateData to be applied
 * @param {Object} scene  The Scene data to Update
 * @return {Object}       The updateData to apply
 */
// export const migrateSceneData = function (scene) {
//   const tokens = scene.tokens.map((token) => {
//     const t = token.toJSON();
//     if (!t.actorId || t.actorLink) {
//       t.actorData = {};
//     } else if (!game.actors.has(t.actorId)) {
//       t.actorId = null;
//       t.actorData = {};
//     } else if (!t.actorLink) {
//       const actorData = duplicate(t.actorData);
//       actorData.type = token.actor?.type;
//       const update = migrateActorData(actorData);
//       ['items'].forEach((embeddedName) => {
//         if (!update[embeddedName]?.length) return;
//         const updates = new Map(update[embeddedName].map((u) => [u._id, u]));
//         t.actorData[embeddedName].forEach((original) => {
//           const update = updates.get(original._id);
//           if (update) mergeObject(original, update);
//         });
//         delete update[embeddedName];
//       });

//       mergeObject(t.actorData, update);
//     }
//     return t;
//   });
//   return { tokens };
// };

const setValueIfNotExists = (update, object, property, newValue) => {
	if (typeof foundry.utils.getProperty(object, property) === 'undefined') {
		update[property] = newValue;
	}
	return update;
};
