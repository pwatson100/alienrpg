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
		if (ci !== 0) return ci;
		let [an, bn] = [a.token?.name || '', b.token?.name || ''];
		let cn = an.localeCompare(bn);
		if (cn !== 0) return cn;
		return a.tokenId - b.tokenId;
	}

	async rollInitiative(ids, { formula = null, updateTurn = true, messageOptions = {} } = {}) {
		// Structure input data
		ids = typeof ids === 'string' ? [ids] : ids;
		const currentId = this.id;
		const draw = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false, 9: false, 10: false };
		let drawn = 0;
		// Iterate over Combatants, performing an initiative roll for each
		// const [updates, messages] = ids.reduce(
		if (this.combatants.contents > 0) {
			this.combatants.contents.forEach((inIt) => {
				if (inIt.initiative) {
					draw[inIt.initiative] = true;
					drawn++;
				}
			});
		}
		const updates = [];
		const messages = [];
		for (let [i, id] of ids.entries()) {
			// Get Combatant data
			if (drawn < 10) {
				const combatant = this.combatants.get(id);
				if (!combatant?.isOwner) return results;

				const cf = formula || combatant._getInitiativeFormula();
				let broll = await this.getInit(combatant, cf, updates);
				while (draw[broll.total]) {
					broll = await this.getInit(combatant, cf, updates);
				}

				draw[broll.total] = true;
				drawn++;
				// updates.push({ _id: id, initiative: roll.total });
				// let broll = this.getInit(combatant, cf, updates);
				updates.push({ _id: id, initiative: broll.total });

				if (!game.settings.get('alienrpg', 'alienrpgHideInitChat')) {
					// Determine the roll mode
					let rollMode = messageOptions.rollMode || game.settings.get('core', 'rollMode');
					if ((combatant.token.hidden || combatant.hidden) && rollMode === 'roll') {
						rollMode = 'gmroll';
					}
					let cardPath = `<div style="text-align: center;"><img width="125" height="175" src="systems/alienrpg/images/cards/card-${broll.total}.png"></div>`;
					try {
						if (game.settings.get('alienrpg-corerules', 'imported')) {
							cardPath = `<div style="text-align: center;"><img width="125" height="175" src="modules/alienrpg-corerules/images/cards/card-${broll.total}.png"></div>`;
						}
					} catch (error) {
						try {
							if (game.settings.get('alienrpg-starterset', 'imported')) {
								cardPath = `<div style="text-align: center;"><img width="125" height="175" src="modules/alienrpg-starterset/images/cards/card-${broll.total}.png"></div>`;
							}
						} catch (error) {}
					}

					// Construct chat message data
					let messageData = mergeObject(
						{
							speaker: {
								scene: canvas.scene.id,
								actor: combatant.actor ? combatant.actor.id : null,
								token: combatant.token.id,
								alias: combatant.token.name,
							},
							flavor: `${combatant.token.name} rolls for Initiative! <br> ${cardPath}`,
							flags: { 'core.initiativeRoll': true },
						},
						messageOptions
					);

					const chatData = await broll.toMessage(messageData, { create: false, rollMode });

					// Play 1 sound for the whole rolled set
					if (i > 0) chatData.sound = null;
					messages.push(chatData);
				}
			} else {
				const combatant = this.combatants.get(id);
				if (!combatant?.isOwner) return results;
				let pNum = 10 / Math.floor(Math.random() * 100);
				while (pNum === 0 || pNum >= 1) {
					pNum = 10 / Math.floor(Math.random() * 100);
				}

				const cf = `1d9+( ${pNum})`;
				let broll = await this.getInit(combatant, cf, updates);
				updates.push({ _id: id, initiative: broll.total });

				let rollMode = messageOptions.rollMode || game.settings.get('core', 'rollMode');
				if ((combatant.token.hidden || combatant.hidden) && rollMode === 'roll') {
					rollMode = 'gmroll';
				}
				if (!game.settings.get('alienrpg', 'alienrpgHideInitChat')) {
					let messageData = mergeObject(
						{
							speaker: {
								scene: canvas.scene.id,
								actor: combatant.actor ? combatant.actor.id : null,
								token: combatant.token.id,
								alias: combatant.token.name,
							},
							flavor: `${combatant.token.name} rolls for Initiative! <br> `,
							flags: { 'core.initiativeRoll': true },
						},
						messageOptions
					);

					const chatData = await broll.toMessage(messageData, { create: false, rollMode });

					// Play 1 sound for the whole rolled set
					if (i > 0) chatData.sound = null;
					messages.push(chatData);
				}
				// ui.notifications.error(
				//   `You can only automatically roll Initiative for 10 PCs/NPCs.  Roll initiative manually for the remaining actors or split in to multiple encounters in the Combat Tracker`
				// );
			}
		}
		if (!updates.length) return this;

		// Update multiple combatants
		await this.updateEmbeddedDocuments('Combatant', updates);

		// Ensure the turn order remains with the same combatant
		if (updateTurn) {
			await this.update({ turn: this.turns.findIndex((t) => t.id === currentId) });
		}
		// Create multiple chat messages
		await CONFIG.ChatMessage.documentClass.create(messages);

		// Return the updated Combat
		return this;
	}

	async getInit(c, cf, updates, roll) {
		if (isNewerVersion(game.version, '0.8.9')) {
			roll = await c.getInitiativeRoll(cf).evaluate({ async: true });
		} else {
			roll = await c.getInitiativeRoll(cf);
		}

		// roll.options.hidden = true;
		if (updates.some((updates) => updates['initiative'] === roll.total)) {
			await this.getInit(c, cf, updates);
		} else {
			return roll;
		}
		return roll;
	}

	createEmbeddedDocuments(embeddedName, data, options) {
		// data will be an array when combatants are created by the combat token icon.
		// therefore only call ExtraSpeedCombatants if data is an array.
		// this ensures cloning from inside the combattracker will make 1 clone only.
		// toggling combat via the token can create extra speed combatants if needed.
		// the token combat toggle is only available if the token is not already in combat.

		for (let i of data) {
			const aType = game.actors.get(i.actorId);
			if (aType.type === 'creature') {
				const cData = this._getExtraSpeedCombatants(i, aType);
				if (cData) {
					data = data.concat(cData);
				}
			} else {
				data = data;
			}
		}
		return super.createEmbeddedDocuments(embeddedName, data, options);
	}

	_getExtraSpeedCombatants(combatant, data) {
		let creationData = {};
		let clones = [];
		let token = canvas.scene.tokens.get(combatant.tokenId);
		let creatureSpeed = 0;
		try {
			creatureSpeed = token.actor.system.attributes.speed.value;
		} catch (error) {
			let bob = game.actors.get(combatant.actorId);
			creatureSpeed = bob.system.attributes.speed.value;
		}
		if (creatureSpeed > 1) {
			let x;
			for (x = 1; x < creatureSpeed; x++) {
				clones.push(token);
			}
		}
		// Add extra clones to the Combat encounter for the actor's heightened speed
		creationData = clones.map((v) => {
			return { tokenId: v.id, hidden: v.hidden };
		});
		return creationData;
	}

	// async _swapInitiative(combatant, donerInit, combatants, content) {
	// 	const targetId = await Dialog.prompt({
	// 		title: game.i18n.localize('ALIENRPG.SwapInitiative'),
	// 		content,
	// 		callback: (html) => html.find('#initiative-swap')[0]?.value,
	// 	});

	// 	let confirmed = false;
	// 	renderTemplate(content).then((dlg) => {
	// 		new Dialog({
	// 			title: game.i18n.localize('ALIENRPG.SwapInitiative'),
	// 			content: dlg,
	// 			buttons: {
	// 				one: {
	// 					icon: '<i class="fas fa-check"></i>',
	// 					label: 'OK',
	// 					callback: () => (confirmed = true),
	// 				},
	// 				four: {
	// 					icon: '<i class="fas fa-times"></i>',
	// 					label: game.i18n.localize('ALIENRPG.DialCancel'),
	// 					callback: () => (confirmed = false),
	// 				},
	// 			},
	// 			close: (html) => {
	// 				if (confirmed) {
	// 					const targetActor = combatants.get(targetId);
	// 					const targetInit = targetActor.initiative;
	// 					const updates = [
	// 						{
	// 							_id: combatant.id,
	// 							initiative: targetInit,
	// 						},
	// 						{
	// 							_id: targetId,
	// 							initiative: donerInit,
	// 						},
	// 					];
	// 					return game.combat.updateEmbeddedDocuments('Combatant', updates);
	// 				}
	// 			},
	// 		}).render(true);
	// 	});
	// }
}
