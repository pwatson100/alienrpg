import { yze } from '../YZEDiceRoller.js';
import { addSign } from '../utils.js';
import { ALIENRPG } from '../config.js';
import { logger } from '../logger.js';

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */

export class alienrpgActor extends Actor {
	/**
	 * Augment the basic actor data with additional dynamic data.
	 */
	prepareData() {
		super.prepareData();
		// const actorData = this._source;
		const actorData = this.system;
		// console.log('🚀 ~ file: actor.js ~ line 69 ~ alienrpgActor ~ prepareBaseData ~ actorData', actorData);
		const data = actorData.system;
		const flags = this.flags;
		switch (this.type) {
			case 'character':
			case 'synthetic':
				this._prepareCharacterData(actorData);
				break;
			case 'vehicles':
			case 'spacecraft':
				this._prepareVehicleData(actorData, flags);
				break;
			case 'creature':
				this._prepareCreatureData(actorData, flags);
				break;
			case 'territory':
				this._prepareTeritoryData(actorData, flags);
				break;
			case 'colony':
				this._prepareColonyData(actorData, flags);
				break;
			case 'planet':
				this._preparePlanetData(actorData, flags);
				break;

			default:
				break;
		}
	}

	/**
	 * Prepare Character type specific data
	 */

	async _prepareCharacterData(actorData) {
		super.prepareDerivedData();
	}

	_prepareVehicleData(data) {}
	_prepareCreatureData(actorData) {}
	_prepareTeritoryData(data) {
		this.img = 'systems/alienrpg/images/icons/nested-eclipses.webp';
	}
	_prepareColonyData(data) {
		this.img = 'systems/alienrpg/images/icons/digital-trace.webp';
	}
	_preparePlanetData(data) {
		this.img = 'systems/alienrpg/images/icons/double-ringed-orb.webp';
	}

	_prepareTokenImg() {
		if (game.settings.get('alienrpg', 'defaultTokenSettings')) {
			if (this.token.img == 'icons/svg/mystery-man.svg' && this.token.img != this.img) {
				this.token.img = this.img;
			}
		}
	}

	// *************************************************
	// Setupthe prototype token
	// *************************************************
	async _preCreate(data, options, user) {
		await super._preCreate(data, options, user);
		let tokenProto = {
			'prototypeToken.displayName': CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
			'prototypeToken.displayBars': CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
			'prototypeToken.disposition': CONST.TOKEN_DISPOSITIONS.FRIENDLY,
			'prototypeToken.name': `${data.name}`,
			'prototypeToken.bar1': { attribute: 'header.health' },
			'prototypeToken.bar2': { attribute: 'None' },
			// 'prototypeToken.vision': true,
			'prototypeToken.actorLink': true,
			'prototypeToken.sight.enabled': 'true',
			'prototypeToken.sight.range': '12',
		};
		if (game.settings.get('alienrpg', 'defaultTokenSettings')) {
			switch (data.type) {
				case 'character':
					tokenProto['prototypeToken.bar2'] = { attribute: 'header.stress' };
					break;
				case 'vehicles':
					tokenProto['prototypeToken.bar1'] = { attribute: 'None' };
					break;
				case 'creature':
					tokenProto['prototypeToken.actorLink'] = false;
					tokenProto['prototypeToken.disposition'] = CONST.TOKEN_DISPOSITIONS.HOSTILE;
					tokenProto['prototypeToken.sight.enabled'] = false;
					break;
				case 'synthetic':
					break;
				case 'territory':
					tokenProto['prototypeToken.bar1'] = { attribute: 'None' };
					tokenProto['prototypeToken.img'] = 'systems/alienrpg/images/icons/nested-eclipses.svg';
					tokenProto['prototypeToken.texture.src'] = 'systems/alienrpg/images/icons/nested-eclipses.webp';
					tokenProto['prototypeToken.sight.enabled'] = false;
					break;
				case 'spacecraft':
					tokenProto['prototypeToken.bar1'] = { attribute: 'attributes.damage' };
					break;
				case 'colony':
					tokenProto['prototypeToken.bar1'] = { attribute: 'None' };
					tokenProto['prototypeToken.img'] = 'systems/alienrpg/images/icons/digital-trace.webp';
					tokenProto['prototypeToken.texture.src'] = 'systems/alienrpg/images/icons/digital-trace.webp';
					tokenProto['prototypeToken.disposition'] = CONST.TOKEN_DISPOSITIONS.NEUTRAL;
					tokenProto['prototypeToken.sight.enabled'] = false;
					break;
				case 'planet':
					tokenProto['prototypeToken.bar1'] = { attribute: 'None' };
					tokenProto['prototypeToken.img'] = 'systems/alienrpg/images/icons/double-ringed-orb.webp';
					tokenProto['prototypeToken.texture.src'] = 'systems/alienrpg/images/icons/double-ringed-orb.webp';
					tokenProto['prototypeToken.disposition'] = CONST.TOKEN_DISPOSITIONS.NEUTRAL;
					tokenProto['prototypeToken.sight.enabled'] = false;
					break;
			}
		}

		this.updateSource(tokenProto);
		// this.updateSource(createData);
	}

	async _checkOverwatch(actorData) {
		let conDition = await this.hasCondition('overwatch');
		if (conDition != undefined || conDition) {
			foundry.utils.setProperty(actorData, 'system.general.overwatch', true);
		} else {
			foundry.utils.setProperty(actorData, 'system.general.overwatch', false);
		}

		let conDition2 = await this.hasCondition('starving');
		if (conDition2 != undefined || conDition2) {
			foundry.utils.setProperty(actorData, 'system.general.starving.value', true);
		} else {
			foundry.utils.setProperty(actorData, 'system.general.starving.value', false);
		}
		let conDition3 = await this.hasCondition('dehydrated');
		if (conDition3 != undefined || conDition3) {
			foundry.utils.setProperty(actorData, 'system.general.dehydrated.value', true);
		} else {
			foundry.utils.setProperty(actorData, 'system.general.dehydrated.value', false);
		}
		let conDition4 = await this.hasCondition('exhausted');
		if (conDition4 != undefined || conDition4) {
			foundry.utils.setProperty(actorData, 'system.general.exhausted.value', true);
		} else {
			foundry.utils.setProperty(actorData, 'system.general.exhausted.value', false);
		}
		let conDition5 = await this.hasCondition('freezing');
		if (conDition5 != undefined || conDition5) {
			foundry.utils.setProperty(actorData, 'system.general.freezing.value', true);
		} else {
			foundry.utils.setProperty(actorData, 'system.general.freezing.value', false);
		}
		let conDition6 = await this.hasCondition('panicked');
		if (conDition6 != undefined || conDition6) {
			foundry.utils.setProperty(actorData, 'system.general.panic.value', 1);
		} else {
			foundry.utils.setProperty(actorData, 'system.general.panic.value', 0);
		}
	}

	async pushRoll(actor, reRoll, hostile, blind, message) {
		await actor.update({ 'system.header.stress.value': actor.system.header.stress.value + 1 });
		const reRoll1 = game.alienrpg.rollArr.r1Dice - game.alienrpg.rollArr.r1Six;
		const reRoll2 = game.alienrpg.rollArr.r2Dice + 1 - (game.alienrpg.rollArr.r2One + game.alienrpg.rollArr.r2Six);
		await yze.yzeRoll(
			hostile,
			blind,
			reRoll,
			game.alienrpg.rollArr.tLabel,
			reRoll1,
			game.i18n.localize('ALIENRPG.Black'),
			reRoll2,
			game.i18n.localize('ALIENRPG.Yellow'),
			actor.id,
			0,
			message.flags.tactorid
		);
	}

	async rollAbility(actor, dataset, rollMod) {
		let label = dataset.label;
		let r2Data = 0;
		let reRoll = false;
		let actorId = actor.id;
		let effectiveActorType = actor.type;
		let attrib = dataset.attr;
		let blind = false;
		let oldPanic = 0;
		game.alienrpg.rollArr.sCount = 0;
		game.alienrpg.rollArr.multiPush = 0;
		let modifier = parseInt(dataset?.mod ?? 0) + parseInt(dataset?.modifier ?? 0);
		let stressMod = parseInt(dataset?.stressMod ?? 0);

		// the dataset value is returned to the DOM so it should be set to 0 in case a future roll is made without the
		// modifier dialog.

		dataset.modifier = 0;
		dataset.stressMod = 0;

		if (dataset.roll) {
			let r1Data = parseInt(dataset.roll || 0) + parseInt(modifier);
			if (dataset.attr) {
				r1Data = parseInt(modifier);
			}

			reRoll = true;
			r2Data = 0;

			switch (actor.type) {
				case 'character':
					reRoll = false;
					r2Data = actor.getRollData().header.stress.value + parseInt(stressMod);
					break;
				case 'synthetic':
					if (actor.system.header.synthstress) {
						effectiveActorType = 'character'; // make rolls look human
						r2Data = parseInt(stressMod);
						reRoll = false;
					}
					break;

				case 'vehicles':
				case 'spacecraft':
					if (dataset.spbutt != 'armor') {
						actorId = dataset.actorid;
						let pilotData = game.actors.get(dataset.actorid);
						if (pilotData.type === 'synthetic') {
							r2Data = 0;
							reRoll = true;
						} else {
							r2Data = pilotData.getRollData().header.stress.value + parseInt(stressMod) || 0;
							reRoll = false;
						}
					}
					break;

				default:
					break;
			}

			if (dataset.spbutt === 'armor') {
				if (r1Data < 1 && !dataset.armorP && !dataset.armorDou) {
					return;
				}
				label = game.i18n.localize('ALIENRPG.Armor');
				r2Data = 0;
				reRoll = true;
				if (dataset.armorP === 'true') {
					r1Data = parseInt(Math.ceil(r1Data / 2)); // fix to armor so it rounds up instead of down
					dataset.armorP = 'false';
				}
				if (dataset.armorDou === 'true') {
					r1Data = parseInt(r1Data * 2);
					dataset.armorDou = 'false';
				}
			}
			if (label === game.i18n.localize('ALIENRPG.Radiation')) {
				r2Data = 0;
				reRoll = true;
				r1Data += 1;
			}

			if (attrib && actor.type != 'synthetic' && !rollMod) {
				function myRenderTemplate(template) {
					let confirmed = false;
					reRoll = false;
					renderTemplate(template).then((dlg) => {
						new Dialog({
							title: game.i18n.localize('ALIENRPG.Attributes') + ' ' + dataset.label + ' ' + game.i18n.localize('ALIENRPG.DialTitle2'),
							content: dlg,
							buttons: {
								one: {
									icon: '<i class="fas fa-check"></i>',
									label: game.i18n.localize('ALIENRPG.DialRoll'),
									callback: () => (confirmed = true),
								},
								four: {
									icon: '<i class="fas fa-times"></i>',
									label: game.i18n.localize('ALIENRPG.DialCancel'),
									callback: () => (confirmed = false),
								},
							},
							close: (html) => {
								if (confirmed) {
									if (!html.find('#fblind')[0].checked) {
										r2Data = 0;
										reRoll = true;
									}
									yze.yzeRoll(
										effectiveActorType,
										blind,
										reRoll,
										label,
										r1Data,
										game.i18n.localize('ALIENRPG.Black'),
										r2Data,
										game.i18n.localize('ALIENRPG.Yellow'),
										actorId
									);
									game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
								}
							},
						}).render(true);
					});
				}

				if (dataset.roll) {
					if (actor.type === 'character') {
						myRenderTemplate('systems/alienrpg/templates/dialog/roll-attr-dialog.html');
					}
				}
			} else if (actor.type === 'spacecraft' && dataset.spbutt === 'comtech') {
				function myRenderTemplate(template) {
					let confirmed = false;
					// reRoll = false;
					renderTemplate(template).then((dlg) => {
						new Dialog({
							title: game.i18n.localize('ALIENRPG.Attributes') + ' ' + dataset.label + ' ' + game.i18n.localize('ALIENRPG.DialTitle2'),
							content: dlg,
							buttons: {
								one: {
									icon: '<i class="fas fa-check"></i>',
									label: game.i18n.localize('ALIENRPG.DialRoll'),
									callback: () => (confirmed = true),
								},
								four: {
									icon: '<i class="fas fa-times"></i>',
									label: game.i18n.localize('ALIENRPG.DialCancel'),
									callback: () => (confirmed = false),
								},
							},
							default: 'one',
							close: (html) => {
								if (confirmed) {
									let baseModifier = parseInt(html.find('[name=baseModifier]')[0]?.value);
									let stressMod = html.find('[name=stressMod]')[0]?.value;
									let modifier = parseInt(html.find('[name=sigMod]')[0]?.value);
									let targetLock = parseInt(html.find('[name=targetLock]')[0]?.value);
									let targetMod = parseInt(html.find('[name=targetMod]')[0]?.value);
									modifier = parseInt(modifier);
									stressMod = parseInt(stressMod);
									targetLock = parseInt(targetLock);
									targetMod = parseInt(targetMod);
									baseModifier = parseInt(baseModifier);
									if (isNaN(baseModifier)) baseModifier = 0;
									if (isNaN(stressMod)) stressMod = 0;
									if (isNaN(modifier)) modifier = 0;
									if (isNaN(targetLock)) targetLock = 0;
									if (isNaN(targetMod)) targetMod = 0;
									// console.log('🚀 ~ file: actor.js ~ line 575 ~ alienrpgActor ~ renderTemplate ~ stressMod', stressMod);
									r1Data = r1Data + baseModifier + modifier + targetLock + targetMod;
									r2Data = r2Data + stressMod;
									yze.yzeRoll(
										effectiveActorType,
										blind,
										reRoll,
										label,
										r1Data,
										game.i18n.localize('ALIENRPG.Black'),
										r2Data,
										game.i18n.localize('ALIENRPG.Yellow'),
										actorId
									);
									game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
								}
							},
						}).render(true);
					});
				}
				myRenderTemplate('systems/alienrpg/templates/dialog/spacecomtech.html');
			} else {
				yze.yzeRoll(
					effectiveActorType,
					blind,
					reRoll,
					label,
					r1Data,
					game.i18n.localize('ALIENRPG.Black'),
					r2Data,
					game.i18n.localize('ALIENRPG.Yellow'),
					actorId
				);
				game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
			}
		} else {
			if (dataset.panicroll) {
				// Roll against the panic table and push the roll to the chat log.
				let chatMessage = '';
				let table = '';
				if (dataset.shippanicbut) {
					table = game.tables.getName('Space Combat Panic Roll');
					if (!table) {
						return ui.notifications.error(game.i18n.localize('ALIENRPG.NoPanicTable'));
					}
				} else {
					table = game.tables.getName('Panic Table');
					if (!table) {
						return ui.notifications.error(game.i18n.localize('ALIENRPG.NoPanicTable'));
					}
				}

				let rollModifier = parseInt(modifier) + parseInt(stressMod);
				// console.log('🚀 ~ file: actor.js ~ line 432 ~ alienrpgActor ~ rollAbility ~ rollModifier', rollModifier);

				let aStress = 0;

				if (actor.type === 'synthetic') {
					if (!actor.system.header.synthstress) return;

					actor.system.header.stress = new Object({ mod: '0' });
					actor.system.general.panic = new Object({ lastRoll: '0', value: '0' });
					aStress = 0;
				} else aStress = actor.getRollData().header.stress.value + rollModifier;

				let modRoll = '1d6' + '+' + parseInt(aStress);
				const roll = await Roll.create(modRoll).evaluate();
				const customResults = await table.roll({ roll });
				console.warn(
					`Rolling stress, ${modRoll}, Panic Value ${actor.system.general.panic.value}, Last ${actor.system.general.panic.lastRoll}, Roll ${customResults.roll.total}`
				);

				oldPanic = actor.system.general.panic.lastRoll;

				if (customResults.roll.total >= 7 && actor.system.general.panic.value === 0) {
					await actor.update({ 'system.general.panic.value': 1 });
					await this.causePanic(actor);
				}

				chatMessage +=
					'<h2 class="alienchatred ctooltip">' +
					game.i18n.localize('ALIENRPG.PanicCondition') +
					' ' +
					addSign(aStress).toString() +
					'<span class="ctooltiptext">' +
					game.i18n.localize('ALIENRPG.Stress') +
					' + (' +
					(actor.getRollData().header.stress.value || 0) +
					') <br>+ ' +
					game.i18n.localize('ALIENRPG.StressMod') +
					' + (' +
					stressMod +
					') <br>+ ' +
					game.i18n.localize('ALIENRPG.Talent-Crit') +
					' + (' +
					modifier +
					')' +
					'</span></h2>';

				let mPanic = customResults.roll.total < actor.system.general.panic.lastRoll;
				let pCheck = oldPanic + 1;
				console.warn(`More Panic, ${mPanic}, pCheck Value ${pCheck}, old Panic Value ${oldPanic}`);
				if (mPanic && actor.system.general.panic.value === 1) {
					await actor.update({ 'system.general.panic.lastRoll': pCheck });

					chatMessage +=
						'<h4 style="font-weight: bolder"><i><b>' +
						game.i18n.localize('ALIENRPG.Roll') +
						' ' +
						`${customResults.roll.total}` +
						' ' +
						'<span class="alienchatred"><i><b>' +
						game.i18n.localize('ALIENRPG.MorePanic') +
						'</span></b></i></span></h4>';

					chatMessage +=
						'<h4><i>' +
						game.i18n.localize('ALIENRPG.PCPanicLevel') +
						'<b class="alienchatred">' +
						game.i18n.localize('ALIENRPG.Level') +
						' ' +
						`${pCheck}` +
						' ' +
						game.i18n.localize('ALIENRPG.Seepage104') +
						'</b></i></h4>';
					if (dataset.shippanicbut) {
						chatMessage += this.moreShipPanic(pCheck);
					} else {
						chatMessage += this.morePanic(pCheck);
					}
				} else {
					if (actor.type === 'character') await actor.update({ 'system.general.panic.lastRoll': customResults.roll.total });
					pCheck = customResults.roll.total;
					chatMessage += '<h4><i><b>' + game.i18n.localize('ALIENRPG.Roll') + ' ' + `${pCheck}` + ' </b></i></h4>';
					// chatMessage += game.i18n.localize(`ALIENRPG.${customResults.results[0].text}`);
					if (dataset.shippanicbut) {
						chatMessage += this.moreShipPanic(pCheck);
					} else {
						chatMessage += this.morePanic(pCheck);
					}
					if (customResults.roll.total >= 7) {
						chatMessage +=
							`<h4 class="alienchatred"><i><b>` +
							game.i18n.localize('ALIENRPG.YouAreAtPanic') +
							// ` <b>` +
							game.i18n.localize('ALIENRPG.Level') +
							` ${pCheck}</b></i></h4>`;
					}
				}
				let trauma = customResults.roll.total >= 13 || pCheck >= 13;
				if (trauma) {
					chatMessage += `<h4><b>` + game.i18n.localize('ALIENRPG.PermanantTrauma') + `<i>(` + game.i18n.localize('ALIENRPG.Seepage106') + `) </i></b></h4>`;
				}
				if (customResults.roll.total >= 10) {
					chatMessage += `<img src="systems/alienrpg/images/icons/warning-bar.webp" > `;
					chatMessage +=
						`<h4 class="alienchatred" style="font-weight: bolder; margin-bottom: auto; margin-left:10px;"><b>` +
						game.i18n.localize('ALIENRPG.ActionFailed') +
						` ` +
						customResults.roll.total +
						`</b></h4>`;
					chatMessage += `<img src="systems/alienrpg/images/icons/warning-bar.webp"> `;
				}

				let rollMode = game.settings.get('core', 'rollMode');
				let whispertarget = [];

				if (rollMode == 'gmroll' || rollMode == 'blindroll') {
					whispertarget = game.users.contents.filter((u) => u.isGM).map((u) => u._id);
				} else if (rollMode == 'selfroll') {
					whispertarget = game.users.contents.filter((u) => u.isGM).map((u) => u._id);
					whispertarget.push(game.user._id);
				}

				let blind = false;
				if (rollMode == 'blindroll') {
					blind = true;
					if (!game.user.isGM) {
						function SelfMessage(content, sound) {
							let selftarget = [];
							selftarget.push(game.user._id);

							ChatMessage.create({ speaker: { actor: actorId }, content, whisper: selftarget, type: CONST.CHAT_MESSAGE_STYLES.OTHER, sound, blind: false });
						}

						SelfMessage(
							'<h2 class="alienchatred">' + game.i18n.localize('ALIENRPG.PanicCondition') + addSign(aStress).toString() + ' ???</h2>',
							CONFIG.sounds.dice
						);
					}
				}
				if (dataset.shippanicbut) {
					switch (pCheck) {
						case 7:
						case 9:
						case 11:
						case 12:
							// increase
							await actor.update({ 'system.header.stress.value': actor.system.header.stress.value + 1 });
							break;

						case 8:
							// Agility -2
							const allSkillsModName =
								game.i18n.localize('ALIENRPG.PanicCondition') + ' - ' + game.i18n.localize('ALIENRPG.TREMBLE') + ' -2 ' + game.i18n.localize('ALIENRPG.Skills');
							// const allSkillsMod = actor.items.getName(allSkillsModName);
							if (!actor.items.getName(allSkillsModName)) {
								const rollData = {
									type: 'item',
									img: '/systems/alienrpg/images/panic.webp',
									name: allSkillsModName,
									'system.header.type.value': 5,
									'system.attributes.comment.value': game.i18n.localize('ALIENRPG.ShipPanic8'),
									'system.modifiers.skills.agl.value': -2,
									'system.modifiers.skills.heavyMach.value': -2,
									'system.modifiers.skills.closeCbt.value': -2,
									'system.modifiers.skills.stamina.value': -2,
									'system.modifiers.skills.rangedCbt.value': -2,
									'system.modifiers.skills.mobility.value': -2,
									'system.modifiers.skills.piloting.value': -2,
									'system.modifiers.skills.command.value': -2,
									'system.modifiers.skills.manipulation.value': -2,
									'system.modifiers.skills.medicalAid.value': -2,
									'system.modifiers.skills.observation.value': -2,
									'system.modifiers.skills.survival.value': -2,
									'system.modifiers.skills.comtech.value': -2,
									'system.header.active': true,
								};
								await actor.createEmbeddedDocuments('Item', [rollData]);
							}
							break;

						case 10:
						case 13:
							//decrease
							await actor.update({ 'system.header.stress.value': actor.system.header.stress.value - 1 });
							break;

						default:
							break;
					}
				} else {
					switch (pCheck) {
						case 7:
						case 9:
						case 10:
							// increase
							await actor.update({ 'system.header.stress.value': actor.system.header.stress.value + 1 });
							break;

						case 8:
							// Agility -2
							const agilityModName = game.i18n.localize('ALIENRPG.PanicCondition') + ' - ' + game.i18n.localize('ALIENRPG.AbilityAgl') + ' -2';
							// const agilityMod = actor.items.getName(agilityModName);
							if (!actor.items.getName(agilityModName)) {
								const rollData = {
									type: 'item',
									img: '/systems/alienrpg/images/panic.webp',
									name: agilityModName,
									'system.header.type.value': 5,
									'system.attributes.comment.value': game.i18n.localize('ALIENRPG.Panic8'),
									'system.modifiers.attributes.agl.value': -2,
									'system.header.active': true,
								};
								await this.createEmbeddedDocuments('Item', [rollData]);
							}
							break;

						case 11:
						case 12:
						case 13:
							//decrease
							await actor.update({ 'system.header.stress.value': actor.system.header.stress.value - 1 });
							break;

						default:
							break;
					}
				}

				ChatMessage.create({
					speaker: {
						actor: actorId,
					},

					content: chatMessage,
					whisper: whispertarget,
					roll: customResults.roll,
					sound: CONFIG.sounds.dice,
					blind,
				});
			}
		}
	}

	async reduceRadiation(actor, dataset) {
		let rad = actor.system.general.radiation;
		let label = game.i18n.localize('ALIENRPG.RadiationReduced');
		let r1Data = 0;
		let reRoll = true;
		let actorId = actor.id;
		let effectiveActorType = actor.type;
		let blind = false;
		let r2Data = 1;
		let radMax = actor.getRollData().general.radiation.max;
		await yze.yzeRoll(
			effectiveActorType,
			blind,
			reRoll,
			label,
			r1Data,
			game.i18n.localize('ALIENRPG.Black'),
			r2Data,
			game.i18n.localize('ALIENRPG.Yellow'),
			actorId
		);

		if (game.alienrpg.rollArr.r2One === 1) {
			await actor.update({
				'system.general.radiation.permanent': rad.permanent + 1,
				'system.RADfill': actor.system.RADfill + 1,
				'system.RADlost': actor.system.RADlost - 1,
				'system.general.radiation.value': rad.value - 1,
			});
		} else {
			await actor.update({ ['system.general.radiation.value']: rad.value - 1 });
		}
	}

	async rollAbilityMod(actor, dataset) {
		function myRenderTemplate(template) {
			let confirmed = false;
			let armorP = false;
			let armorDou = false;
			switch (dataset.spbutt) {
				case 'armorVfire':
					renderTemplate(template).then((dlg) => {
						new Dialog({
							title: game.i18n.localize('ALIENRPG.DialTitle1') + ' ' + dataset.label + ' ' + game.i18n.localize('ALIENRPG.DialTitle2'),
							content: dlg,
							buttons: {
								one: {
									icon: '<i class="fas fa-check"></i>',
									label: game.i18n.localize('ALIENRPG.DialRoll'),
									callback: () => (confirmed = true),
								},
								four: {
									icon: '<i class="fas fa-times"></i>',
									label: game.i18n.localize('ALIENRPG.DialCancel'),
									callback: () => (confirmed = false),
								},
							},
							default: 'one',
							close: (html) => {
								if (confirmed || armorP || armorDou) {
									let modifier = parseInt(html.find('[name=modifier]')[0]?.value);
									let stressMod = html.find('[name=stressMod]')[0]?.value;

									if (stressMod == 'undefined') {
										stressMod = 0;
									} else stressMod = parseInt(stressMod);
									if (modifier == 'undefined') {
										modifier = 0;
									} else modifier = parseInt(modifier);
									if (isNaN(modifier)) modifier = 0;
									if (isNaN(stressMod)) stressMod = 0;
									// console.log('🚀 ~ file: actor.js ~ line 575 ~ alienrpgActor ~ renderTemplate ~ stressMod', stressMod);

									dataset.modifier = modifier;
									dataset.stressMod = stressMod;
									actor.rollAbility(actor, dataset, confirmed);
								}
							},
						}).render(true);
					});

					break;
				case 'armor':
					renderTemplate(template).then((dlg) => {
						new Dialog({
							title: game.i18n.localize('ALIENRPG.DialTitle1') + ' ' + dataset.label + ' ' + game.i18n.localize('ALIENRPG.DialTitle2'),
							content: dlg,
							buttons: {
								one: {
									icon: '<i class="fas fa-check"></i>',
									label: game.i18n.localize('ALIENRPG.DialRoll'),
									callback: () => (confirmed = true),
								},
								two: {
									label: game.i18n.localize('ALIENRPG.ArmorPiercing'),
									callback: () => (armorP = 'true'),
								},
								three: {
									label: game.i18n.localize('ALIENRPG.ArmorDoubled'),
									callback: () => (armorDou = 'true'),
								},
								four: {
									icon: '<i class="fas fa-times"></i>',
									label: game.i18n.localize('ALIENRPG.DialCancel'),
									callback: () => (confirmed = false),
								},
							},
							default: 'one',
							close: (html) => {
								if (confirmed || armorP || armorDou) {
									let modifier = parseInt(html.find('[name=modifier]')[0]?.value);
									let stressMod = html.find('[name=stressMod]')[0]?.value;

									if (stressMod == 'undefined') {
										stressMod = 0;
									} else stressMod = parseInt(stressMod);
									if (modifier == 'undefined') {
										modifier = 0;
									} else modifier = parseInt(modifier);
									if (isNaN(modifier)) modifier = 0;
									if (isNaN(stressMod)) stressMod = 0;
									// console.log('🚀 ~ file: actor.js ~ line 575 ~ alienrpgActor ~ renderTemplate ~ stressMod', stressMod);

									dataset.modifier = modifier;
									dataset.stressMod = stressMod;
									dataset.armorP = armorP;
									dataset.armorDou = armorDou;
									actor.rollAbility(actor, dataset, confirmed);
								}
							},
						}).render(true);
					});

					break;

				default:
					renderTemplate(template).then((dlg) => {
						new Dialog({
							title: game.i18n.localize('ALIENRPG.DialTitle1') + ' ' + dataset.label + ' ' + game.i18n.localize('ALIENRPG.DialTitle2'),
							content: dlg,
							buttons: {
								one: {
									icon: '<i class="fas fa-check"></i>',
									label: game.i18n.localize('ALIENRPG.DialRoll'),
									callback: () => (confirmed = true),
								},
								four: {
									icon: '<i class="fas fa-times"></i>',
									label: game.i18n.localize('ALIENRPG.DialCancel'),
									callback: () => (confirmed = false),
								},
							},
							default: 'one',
							close: (html) => {
								if (confirmed) {
									let modifier = parseInt(html.find('[name=modifier]')[0]?.value);
									let stressMod = html.find('[name=stressMod]')[0]?.value;

									if (stressMod == 'undefined') {
										stressMod = 0;
									} else stressMod = parseInt(stressMod);
									if (modifier == 'undefined') {
										modifier = 0;
									} else modifier = parseInt(modifier);
									if (isNaN(modifier)) modifier = 0;
									if (isNaN(stressMod)) stressMod = 0;
									// console.log('🚀 ~ file: actor.js ~ line 575 ~ alienrpgActor ~ renderTemplate ~ stressMod', stressMod);

									dataset.modifier = modifier;
									dataset.stressMod = stressMod;
									actor.rollAbility(actor, dataset, confirmed);
								}
							},
						}).render(true);
					});

					break;
			}
		}

		if (dataset.roll) {
			// call pop up box here to get any mods then use standard RollAbility()
			// Check that is a character (and not armor) or a synth pretending to be a character.
			if (
				((actor.type === 'character' || actor.type === 'vehicles' || actor.type === 'spacecraft') && dataset.spbutt != 'armor') ||
				actor.system.header.synthstress
			) {
				myRenderTemplate('systems/alienrpg/templates/dialog/roll-all-dialog.html');
			} else if (actor.type === 'synthetic') {
				myRenderTemplate('systems/alienrpg/templates/dialog/roll-base-dialog.html');
			} else {
				myRenderTemplate('systems/alienrpg/templates/dialog/roll-base-dialog.html');
			}
		} else if (dataset.panicroll) {
			// Roll against the panic table and push the roll to the chat log.

			myRenderTemplate('systems/alienrpg/templates/dialog/roll-stress-dialog.html');
		}
	}

	async nowRollItem(item, event) {
		// if (item.type === 'weapon' || item.type === 'armor') {
		if (item.type === 'weapon' || item.type === 'spacecraftweapons') {
			// Trigger the item roll
			return item.roll(false);
		}
	}

	async rollItemMod(item, event) {
		if (item.type === 'weapon') {
			// Trigger the item roll
			return item.roll(true);
		}
	}

	async stressChange(actor, dataset) {
		switch (dataset.pmbut) {
			case 'minusStress':
				if (actor.system.header.stress.value <= 0) {
					await actor.update({ 'system.header.stress.value': (actor.system.header.stress.value = 0) });
				} else {
					await actor.update({ 'system.header.stress.value': actor.system.header.stress.value - 1 });
				}
				break;
			case 'plusStress':
				await actor.update({ 'system.header.stress.value': actor.system.header.stress.value + 1 });
				break;
			case 'minusHealth':
				if (actor.system.header.health.value <= 0) {
					await actor.update({ 'system.header.health.value': (actor.system.header.health.value = 0) });
				} else {
					await actor.update({ 'system.header.health.value': actor.system.header.health.value - 1 });
				}
				break;
			case 'plusHealth':
				await actor.update({ 'system.header.health.value': actor.system.header.health.value + 1 });
				break;

			default:
				break;
		}
	}

	async checkAndEndPanic(actor) {
		let itemDel = '';
		const agilityModName = game.i18n.localize('ALIENRPG.PanicCondition') + ' - ' + game.i18n.localize('ALIENRPG.AbilityAgl') + ' -2';
		const allSkillsModName =
			game.i18n.localize('ALIENRPG.PanicCondition') + ' - ' + game.i18n.localize('ALIENRPG.TREMBLE') + ' -2 ' + game.i18n.localize('ALIENRPG.Skills');

		if (actor.type != 'character') return;

		if (actor.system.general.panic.lastRoll > 0) {
			await actor.update({
				'system.general.panic.value': 0,
			});
			await actor.update({
				'system.general.panic.lastRoll': 0,
			});

			await actor.removeCondition('panicked');
			ChatMessage.create({ speaker: { actor: actor.id }, content: 'Panic is over', type: CONST.CHAT_MESSAGE_STYLES.OTHER });
			itemDel = actor.items.getName(agilityModName);
			if (itemDel) {
				itemDel.delete();
			}
			itemDel = actor.items.getName(allSkillsModName);
			if (itemDel) {
				itemDel.delete();
			}
		} else {
			await actor.removeCondition('panicked');
			ChatMessage.create({ speaker: { actor: actor.id }, content: 'Panic is over', type: CONST.CHAT_MESSAGE_STYLES.OTHER });
			itemDel = actor.items.getName(agilityModName);
			if (itemDel) {
				itemDel.delete();
			}
			itemDel = actor.items.getName(allSkillsModName);
			if (itemDel) {
				itemDel.delete();
			}
		}
	}
	async causePanic(actor) {
		// await actor.update({ 'system.general.panic.value': 1 });
		await actor.addCondition('panicked');
		return;
	}

	async addCondition(effect) {
		if (typeof effect === 'string') effect = foundry.utils.duplicate(game.alienrpg.config.conditionEffects.find((e) => e.id == effect));
		if (!effect) return 'No Effect Found';
		if (!effect.id) return 'Conditions require an id field';

		let existing = await this.hasCondition(effect.id);

		if (!existing) {
			// if (game.version < '11') {
			effect.label = game.i18n.localize(effect.label).replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
			effect.name = game.i18n.localize(effect.name).replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
			// effect['flags.core.statusId'] = effect.id;
			effect['statuses'] = effect.id;
			delete effect.id;
			return await this.createEmbeddedDocuments('ActiveEffect', [effect]);
		}
	}

	async removeCondition(effect) {
		if (typeof effect === 'string') effect = foundry.utils.duplicate(game.alienrpg.config.conditionEffects.find((e) => e.id == effect));
		if (!effect) return 'No Effect Found';
		if (!effect.id) return 'Conditions require an id field';
		let existing = await this.hasCondition(effect.id);
		if (existing) {
			return await this.deleteEmbeddedDocuments('ActiveEffect', [existing._id]);
		}
	}

	async hasCondition(conditionKey) {
		let existing = '';
		if (game.version < '11') {
			existing = this.effects.find((i) => i.getFlag('core', 'statusId') == conditionKey);
		} else {
			existing = this.effects.find((effect) => effect.statuses.has(conditionKey));
		}

		return existing;
	}

	async consumablesCheck(actor, consUme, label, tItem, supplyModifier) {
		let r1Data = 0;
		let r2Data = 0;
		if (!supplyModifier) {
			supplyModifier = 0;
		}
		r2Data = actor.system.consumables[`${consUme}`].value + supplyModifier;
		let reRoll = true;
		// let hostile = this.actor.system.type;
		let blind = false;
		if (actor.token?.disposition === -1) {
			blind = true;
		}
		if (r2Data <= 0) {
			return ui.notifications.warn(game.i18n.localize('ALIENRPG.NoSupplys'));
		} else {
			await yze.yzeRoll('supply', blind, reRoll, label, r1Data, game.i18n.localize('ALIENRPG.Black'), r2Data, game.i18n.localize('ALIENRPG.Yellow'), actor.id);
			if (game.alienrpg.rollArr.r2One) {
				getItems(actor, consUme, tItem);
			}
		}

		async function getItems(aActor, aconsUme, atItem) {
			let bRoll = game.alienrpg.rollArr.r2One;
			let tNum = 0;
			let pValue = '';
			let pItem = '';
			let iConsUme = '';
			let field = `system.attributes.${aconsUme}.value`;
			let aField = `system.consumables.${aconsUme}.value`;

			if (aconsUme === 'power') {
				pItem = aActor.items.get(atItem);

				pValue = pItem.system.attributes.power.value ?? 0;
				field = `system.attributes.power.value`;
				if (pValue - game.alienrpg.rollArr.r2One <= '0') {
					await pItem.update({ [field]: '0' });
					await aActor.update({ 'system.consumables.power.value': aActor.system.consumables.power.value - pValue });
				} else {
					await pItem.update({ [field]: pValue - game.alienrpg.rollArr.r2One });
					await aActor.update({ 'system.consumables.power.value': aActor.system.consumables.power.value - game.alienrpg.rollArr.r2One });
				}
			} else {
				if (aconsUme === 'air') {
					iConsUme = 'airsupply';
					field = `system.attributes.${iConsUme}.value`;
				} else {
					iConsUme = aconsUme;
				}
				// while (bRoll > 0) {
				for (const key in aActor.items.contents) {
					if (bRoll <= 0) {
						break;
					}

					if (aActor.items.contents[key].type === 'item' && aActor.items.contents[key].system.header.active) {
						if (Object.hasOwnProperty.call(aActor.items.contents, key) && bRoll > 0) {
							let element = aActor.items.contents[key];
							if (element.system.attributes[iConsUme].value) {
								let mitem = aActor.items.get(element.id);
								let iVal = element.system.attributes[iConsUme].value;
								if (iVal - bRoll < 0) {
									tNum = iVal;
									// bRoll -= iVal;
								} else {
									tNum = bRoll;
								}
								await mitem.update({ [field]: element.system.attributes[iConsUme].value - tNum });
							}
						}
						bRoll -= tNum;
					}

					if (aActor.items.contents[key].type === 'armor' && aconsUme === 'air' && aActor.items.contents[key].system.header.active) {
						if (Object.hasOwnProperty.call(aActor.items.contents, key) && bRoll > 0) {
							let element = aActor.items.contents[key];
							if (element.system.attributes[iConsUme].value) {
								let mitem = aActor.items.get(element.id);
								let iVal = element.system.attributes[iConsUme].value;
								if (iVal - bRoll < 0) {
									tNum = iVal;
									// bRoll -= iVal;
								} else {
									tNum = bRoll;
								}
								await mitem.update({ [field]: element.system.attributes[iConsUme].value - tNum });
							}
						}
						bRoll -= tNum;
					}
				}
				await aActor.update({ [aField]: `system.consumables.${aconsUme}.value` - tNum });
			}
		}
	}
	async consumablesCheckMod(actor, consUme, label, tItem) {
		const template = 'systems/alienrpg/templates/dialog/roll-supplymod-dialog.html';
		let confirmed = false;
		let supplyModifier = 0;
		renderTemplate(template).then((dlg) => {
			new Dialog({
				title: game.i18n.localize('ALIENRPG.DialTitle1') + ' ' + label + ' ' + game.i18n.localize('ALIENRPG.DialTitle2'),
				content: dlg,
				buttons: {
					one: {
						icon: '<i class="fas fa-check"></i>',
						label: game.i18n.localize('ALIENRPG.DialRoll'),
						callback: () => (confirmed = true),
					},
					two: {
						icon: '<i class="fas fa-times"></i>',
						label: game.i18n.localize('ALIENRPG.DialCancel'),
						callback: () => (confirmed = false),
					},
				},
				default: 'one',
				close: (html) => {
					if (confirmed) {
						let modifier = parseInt(html.find('[name=modifier]')[0].value);
						if (modifier == 'undefined') {
							modifier = 0;
						} else modifier = parseInt(modifier);

						actor.consumablesCheck(actor, consUme, label, tItem, modifier);
					}
				},
			}).render(true);
		});
	}

	async creatureAcidRoll(actor, dataset) {
		let template = 'systems/alienrpg/templates/dialog/roll-base-xeno-dialog.html';
		let label = dataset.label;
		let r1Data = parseInt(dataset.roll || 0);
		let r2Data = 0;
		let reRoll = true;
		let hostile = 'creature';
		let blind = false;
		if (dataset.roll != '-') {
			if (dataset.spbutt === 'armor' && r1Data < 1) {
				return;
			} else if (dataset.spbutt === 'armor') {
				// label = 'Armor';
				label = game.i18n.localize('ALIENRPG.Armor');
				r2Data = 0;
			}
			if (!actor.token) {
				ui.notifications.notify(game.i18n.localize('ALIENRPG.NoToken'));
				return;
			} else {
				if (actor.prototypeToken.disposition === -1) {
					// hostile = true;
					blind = true;
				}
			}

			// callpop upbox here to get any mods then update r1Data or rData as appropriate.
			let confirmed = false;
			renderTemplate(template).then((dlg) => {
				new Dialog({
					title: game.i18n.localize('ALIENRPG.DialTitle1') + ' ' + label + ' ' + game.i18n.localize('ALIENRPG.DialTitle2'),
					content: dlg,
					buttons: {
						one: {
							icon: '<i class="fas fa-check"></i>',
							label: game.i18n.localize('ALIENRPG.DialRoll'),
							callback: () => (confirmed = true),
						},
						two: {
							icon: '<i class="fas fa-times"></i>',
							label: game.i18n.localize('ALIENRPG.DialCancel'),
							callback: () => (confirmed = false),
						},
					},
					default: 'one',
					close: (html) => {
						if (confirmed) {
							let modifier = parseInt(html.find('[name=damage]')[0].value);
							r1Data = r1Data + modifier;
							yze.yzeRoll(hostile, false, reRoll, label, r1Data, 'Black', r2Data, 'Stress', actor.id);
						}
					},
				}).render(true);
			});
		} else {
			// Roll against the panic table and push the roll to the chat log.
			let chatMessage = '';
			chatMessage += '<h2>' + game.i18n.localize('ALIENRPG.AcidAttack') + '</h2>';
			chatMessage += `<h4><i>` + game.i18n.localize('ALIENRPG.AcidBlood') + `</i></h4>`;
			ChatMessage.create({
				user: game.user._id,
				speaker: {
					actor: actor.id,
				},
				content: chatMessage,
				whisper: game.users.contents.filter((u) => u.isGM).map((u) => u._id),
				blind: true,
			});
		}
	}

	async creatureAttackRoll(actor, dataset, manCrit) {
		let chatMessage = '';
		let customResults = '';
		const targetTable = dataset.atttype;
		if (targetTable === 'None') {
			logger.warn(game.i18n.localize('ALIENRPG.NoCharCrit'));
			return;
		}
		const table = game.tables.contents.find((b) => b.name === targetTable);

		const roll = await Roll.create('1d6').evaluate();

		if (!manCrit) {
			customResults = await table.roll({ roll });
		} else {
			const formula = manCrit;
			const roll = await Roll.create(formula).evaluate();
			customResults = await table.roll({ roll });
		}

		// const customResults = await table.roll({ roll });

		chatMessage += '<h2>' + game.i18n.localize('ALIENRPG.AttackRoll') + '</h2>';
		chatMessage += `<h4><i>${table.name}</i></h4>`;
		chatMessage += `${customResults.results[0].text}`;
		ChatMessage.create({
			user: game.user._id,
			speaker: {
				actor: actor.id,
			},
			roll: customResults.roll,
			content: chatMessage,
			// whisper: game.users.contents.filter((u) => u.isGM).map((u) => u._id),
			// type: CONST.CHAT_MESSAGE_STYLES.ROLL,
		});
	}

	async creatureManAttackRoll(actor, dataset) {
		function myRenderTemplate(template) {
			let confirmed = false;
			renderTemplate(template).then((dlg) => {
				new Dialog({
					title: game.i18n.localize('ALIENRPG.rollManCreatureAttack'),
					content: dlg,
					buttons: {
						one: {
							icon: '<i class="fas fa-check"></i>',
							label: game.i18n.localize('ALIENRPG.DialRoll'),
							callback: () => (confirmed = true),
						},
						four: {
							icon: '<i class="fas fa-times"></i>',
							label: game.i18n.localize('ALIENRPG.DialCancel'),
							callback: () => (confirmed = false),
						},
					},
					default: 'one',
					close: (html) => {
						if (confirmed) {
							let manCrit = html.find('[name=manCrit]')[0]?.value;

							if (manCrit == 'undefined') {
								manCrit = '1';
							}
							if (!manCrit.match(/^[1-6]$/gm)) {
								ui.notifications.warn(game.i18n.localize('ALIENRPG.rollManCreAttMax'));
								return;
							}
							actor.creatureAttackRoll(actor, dataset, manCrit);
						}
					},
				}).render(true);
			});
		}
		myRenderTemplate('systems/alienrpg/templates/dialog/roll-manual-creature-attack-dialog.html');
	}

	morePanic(pCheck) {
		let con = '';
		switch (pCheck) {
			case 1:
			case 2:
			case 3:
			case 4:
			case 5:
			case 6:
				con = game.i18n.localize('ALIENRPG.Panic1');
				break;
			case 7:
				con = game.i18n.localize('ALIENRPG.Panic7');
				break;
			case 8:
				con = game.i18n.localize('ALIENRPG.Panic8');
				break;
			case 9:
				con = game.i18n.localize('ALIENRPG.Panic9');
				break;
			case 10:
				con = game.i18n.localize('ALIENRPG.Panic10');
				break;
			case 11:
				con = game.i18n.localize('ALIENRPG.Panic11');
				break;
			case 12:
				con = game.i18n.localize('ALIENRPG.Panic12');
				break;
			case 13:
				con = game.i18n.localize('ALIENRPG.Panic13');
				break;
			case 14:
				con = game.i18n.localize('ALIENRPG.Panic14');
				break;
			default:
				con = game.i18n.localize('ALIENRPG.Panic15');
				break;
		}
		return con;
	}
	moreShipPanic(pCheck) {
		let con = '';
		switch (pCheck) {
			case 1:
			case 2:
			case 3:
			case 4:
			case 5:
			case 6:
				con = game.i18n.localize('ALIENRPG.Panic1');
				break;
			case 7:
				con = game.i18n.localize('ALIENRPG.ShipPanic7');
				break;
			case 8:
				con = game.i18n.localize('ALIENRPG.ShipPanic8');
				break;
			case 9:
				con = game.i18n.localize('ALIENRPG.ShipPanic9');
				break;
			case 10:
				con = game.i18n.localize('ALIENRPG.ShipPanic10');
				break;
			case 11:
			case 12:
				con = game.i18n.localize('ALIENRPG.ShipPanic11');
				break;
			case 13:
				con = game.i18n.localize('ALIENRPG.ShipPanic13');
				break;
			case 14:
				con = game.i18n.localize('ALIENRPG.ShipPanic14');
				break;
			default:
				con = game.i18n.localize('ALIENRPG.ShipPanic15');
				break;
		}
		return con;
	}

	async rollCrit(actor, type, dataset, manCrit) {
		let atable = '';
		let healTime = 0;
		let cFatal = false;
		let factorFour = '';
		let testArray = '';
		let rollheal = '';
		let newHealTime = '';
		let htmlData = '';
		let resultImage = '';
		let shipcritTable = '';
		let test1 = '';
		let hFatal = '';
		let hHealTime = '';
		let hTimeLimit = '';
		let shipCritType = '';
		let mobility = 0;
		let rangedcombat = 0;
		let observation = 0;
		let manipulation = 0;
		let closecombat = 0;
		let stamina = 0;
		switch (type) {
			case 'character':
				atable = game.tables.getName('Critical injuries');
				if (atable === null || atable === undefined) {
					ui.notifications.warn(game.i18n.localize('ALIENRPG.NoCharCrit'));
					return;
				}

				break;
			case 'synthetic':
				atable = game.tables.getName('Critical Injuries on Synthetics');
				if (atable === null || atable === undefined) {
					ui.notifications.warn(game.i18n.localize('ALIENRPG.NoSynCrit'));
					return;
				}
				break;
			case 'creature':
				atable = game.tables.getName(dataset.atttype);
				if (atable === null || atable === undefined) {
					ui.notifications.warn(game.i18n.localize('ALIENRPG.NoCharCrit'));
					return;
				}
				break;

			case 'spacecraft':
				if (dataset.crbut === 'minor') {
					atable = game.tables.getName('Spaceship Minor Component Damage');
					shipcritTable = '0';
					if (atable === null || atable === undefined) {
						ui.notifications.warn(game.i18n.localize('ALIENRPG.NoCharCrit'));
						return;
					}
				} else {
					atable = game.tables.getName('Spaceship Major Component Damage');
					shipcritTable = '1';
					if (atable === null || atable === undefined) {
						ui.notifications.warn(game.i18n.localize('ALIENRPG.NoCharCrit'));
						return;
					}
				}
				break;

			default:
				return;
		}

		if (!manCrit) {
			test1 = await atable.draw({ displayChat: false });
		} else {
			const formula = manCrit;
			const roll = await Roll.create(formula).evaluate();
			test1 = await atable.draw({ roll: roll, displayChat: false });
		}
		const messG = test1.results[0].text;
		switch (type) {
			case 'character':
				{
					resultImage = test1.results[0].img;
					factorFour = messG.replace(/(<b>)|(<\/b>)/gi, '');
					testArray = factorFour.split(/[:] |<br \/>/gi);
					let speanex = testArray[7];
					if (testArray[9] != 'Permanent') {
						if (testArray[9].length > 0) {
							rollheal = testArray[9].match(/^\[\[([0-9]d[0-9]+)]/)[1];
							newHealTime = testArray[9].match(/^\[\[([0-9]d[0-9]+)\]\] ?(.*)/)[2];
							testArray[9] = (await Roll.create(`${rollheal}`).evaluate()).result + ' ' + newHealTime;
							// testArray[9] = (await Roll.create(`${rollheal}`).evaluate().result) + ' ' + newHealTime;
						} else {
							testArray[9] = 'None';
						}
					}
					switch (testArray[3]) {
						case `Yes `:
							cFatal = true;
							break;
						case `Yes, –1 `:
							{
								cFatal = true;
								speanex += '<br> -1 to <strong>MEDICAL</strong> roll';
							}
							break;
						case `Yes, –2 `:
							{
								cFatal = true;
								speanex += '<br> -2 to <strong>MEDICAL</strong> roll';
							}
							break;
						default:
							cFatal = false;
							break;
					}

					switch (testArray[5]) {
						case game.i18n.localize('ALIENRPG.None') + ' ':
							healTime = 0;
							break;
						case game.i18n.localize('ALIENRPG.OneRound') + ' ':
							healTime = 1;
							break;
						case game.i18n.localize('ALIENRPG.OneTurn') + ' ':
							healTime = 2;
							break;
						case game.i18n.localize('ALIENRPG.OneShift') + ' ':
							healTime = 3;
							break;
						case game.i18n.localize('ALIENRPG.OneDay') + ' ':
							healTime = 4;
							break;
						default:
							healTime = 0;
							break;
					}

					switch (test1.roll._total) {
						case 14:
							mobility = -2;
							break;
						case 15:
							rangedcombat = -2;
							observation = -2;
							break;
						case 16:
							mobility = -2;
							break;
						case 21:
							observation = -2;
							break;
						case 24:
							manipulation = -2;
							break;
						case 31:
							observation = -1;
							manipulation = -1;
							break;
						case 33:
							mobility = -2;
							closecombat = -2;
							break;
						case 34:
							rangedcombat = -2;
							observation = -2;
							break;
						case 44:
							mobility = -2;
							stamina = -2;
							break;
						case 51:
							mobility = -2;
							break;
						case 61:
							stamina = -1;
							break;
						case 62:
							stamina = -2;
							break;

						default:
							break;
					}
					//
					// Now create the item on the sheet
					//
					let rollData = {
						type: 'critical-injury',
						img: resultImage,
						name: `#${test1.roll._total} ${testArray[1]}`,
						'system.attributes.fatal': cFatal,
						'system.attributes.timelimit.value': healTime,
						'system.attributes.healingtime.value': testArray[9],
						'system.attributes.effects': speanex,
						'system.modifiers.skills.mobility.value': mobility,
						'system.modifiers.skills.rangedCbt.value': rangedcombat,
						'system.modifiers.skills.observation.value': observation,
						'system.modifiers.skills.manipulation.value': manipulation,
						'system.modifiers.skills.closeCbt.value': closecombat,
						'system.modifiers.skills.stamina.value': stamina,
					};

					await this.createEmbeddedDocuments('Item', [rollData]);

					//
					// Prepare the data for the chat message
					//

					hFatal = testArray[3] != ' ' ? testArray[3] : 'None';
					hHealTime = testArray[9] != ' ' ? testArray[9] : 'None';
					hTimeLimit = testArray[5] != ' ' ? testArray[5] : 'None';

					htmlData = {
						actorname: actor.name,
						img: resultImage,
						name: `#${test1.roll._total} ${testArray[1]}`,
						fatal: hFatal,
						timelimit: hTimeLimit,
						healingtime: hHealTime,
						effects: speanex,
					};
				}

				break;
			case 'synthetic':
			case 'creature':
				{
					resultImage = test1.results[0].img || 'icons/svg/biohazard.svg';
					if (type === 'creature') {
						resultImage = 'icons/svg/biohazard.svg';
					}
					factorFour = messG.replace(/(<b>)|(<\/b>)/gi, '');
					testArray = factorFour.split(/[:] |<br \/>/gi);

					//
					// Now create the item on the sheet
					//
					await actor.createEmbeddedDocuments('Item', [
						{
							type: 'critical-injury',
							img: resultImage,
							name: `#${test1.roll.total} ${testArray[0]}`,
							'system.attributes.effects': testArray[1],
						},
					]);

					//
					// Prepare the data for the chat message
					//

					htmlData = {
						actorname: actor.name,
						img: resultImage,
						name: `#${test1.roll.total} ${testArray[0]}`,
						effects: testArray[1],
					};
				}
				break;
			case 'spacecraft':
				{
					resultImage = test1.results[0].img || 'icons/svg/biohazard.svg';

					factorFour = messG.replace(/(<strong>)|(<\/strong>)/gi, '');
					testArray = factorFour.split(/[:] |<br \/>/gi);

					//
					// Now create the item on the sheet
					//
					await actor.createEmbeddedDocuments('Item', [
						{
							type: 'spacecraft-crit',
							img: resultImage,
							name: `#${test1.roll.total} ${testArray[0]}`,
							'system.header.type.value': `${shipcritTable}`,
							'system.header.effects': testArray[2],
							'system.header.repairroll': testArray[5],
						},
					]);

					//
					// Prepare the data for the chat message
					//
					if (shipcritTable === '0') {
						shipCritType = 'Minor';
					} else {
						shipCritType = 'Major';
					}
					htmlData = {
						shipCritType: `${shipCritType}`,
						actorname: actor.name,
						img: resultImage,
						name: `#${test1.roll.total} ${testArray[0]}`,
						ceffects: testArray[2],
						crepairroll: testArray[5],
					};
				}
				break;
		}

		// Now push the correct chat message

		// console.log(htmlData);
		const html = await renderTemplate(`systems/alienrpg/templates/chat/crit-roll-${actor.type}.html`, htmlData);

		let chatData = {
			user: game.user.id,
			speaker: {
				actor: actor.id,
			},
			content: html,
			other: game.users.contents.filter((u) => u.isGM).map((u) => u.id),
			sound: CONFIG.sounds.dice,
		};

		switch (type) {
			case 'spacecraft':
				if (shipCritType === 'Minor') {
					await this.addCondition('shipminor');
				} else {
					await this.addCondition('shipmajor');
				}
				break;
			case 'character':
			case 'synthetic':
				await this.addCondition('criticalinj');
				break;
			case 'creature':
				console.log("it's a Creature Crit");
				break;

			default:
				break;
		}

		ChatMessage.applyRollMode(chatData, game.settings.get('core', 'rollMode'));
		return ChatMessage.create(chatData);
	}

	async rollCritMan(actor, type, dataset) {
		function myRenderTemplate(template) {
			let confirmed = false;
			renderTemplate(template).then((dlg) => {
				new Dialog({
					title: game.i18n.localize('ALIENRPG.RollManCrit'),
					content: dlg,
					buttons: {
						one: {
							icon: '<i class="fas fa-check"></i>',
							label: game.i18n.localize('ALIENRPG.DialRoll'),
							callback: () => (confirmed = true),
						},
						four: {
							icon: '<i class="fas fa-times"></i>',
							label: game.i18n.localize('ALIENRPG.DialCancel'),
							callback: () => (confirmed = false),
						},
					},
					default: 'one',
					close: (html) => {
						if (confirmed) {
							let manCrit = html.find('[name=manCrit]')[0]?.value;

							if (manCrit == 'undefined') {
								manCrit = '1';
							}
							switch (type) {
								case 'synthetic':
									if (manCrit > 6) {
										ui.notifications.warn(game.i18n.localize('ALIENRPG.RollManSynCrit'));
										return;
									}
									break;

								case 'character':
									if (!manCrit.match(/^[1-6]?[1-6]$/gm)) {
										ui.notifications.warn(game.i18n.localize('ALIENRPG.RollManCharCrit'));
										return;
									}
									break;
								case 'spacecraft':
									if (dataset.crbut === 'minor') {
										if (!manCrit.match(/^[1-44]?[1-44]$/gm)) {
											ui.notifications.warn(game.i18n.localize('ALIENRPG.RollManShipMajorCrit'));
											return;
										}
									} else {
										if (dataset.crbut === 'major') {
											if (!manCrit.match(/^[1-12]?[1-12]$/gm)) {
												ui.notifications.warn(game.i18n.localize('ALIENRPG.RollManShipMajorCrit'));
												return;
											}
										}
									}
									break;
								default:
									break;
							}
							actor.rollCrit(actor, type, dataset, manCrit);
						}
					},
				}).render(true);
			});
		}
		switch (actor.type) {
			case 'character':
				myRenderTemplate('systems/alienrpg/templates/dialog/roll-char-manual-crit-dialog.html');

				break;
			case 'synthetic':
			case 'creature':
				myRenderTemplate('systems/alienrpg/templates/dialog/roll-syn-manual-crit-dialog.html');
				break;
			case 'spacecraft':
				if (dataset.crbut === 'minor') {
					myRenderTemplate('systems/alienrpg/templates/dialog/roll-spacecraft-minor-crit-dialog.html');
				} else {
					myRenderTemplate('systems/alienrpg/templates/dialog/roll-spacecraft-major-crit-dialog.html');
				}

				break;

			default:
				break;
		}
	}
	/* ------------------------------------------- */
	/*  Vehicle: Crew Management                   */
	/* ------------------------------------------- */

	/**
	 * Adds an occupant to the vehicle.
	 * @param {string}  crewId              The id of the added actor
	 * @param {string}  [position='PASSENGER'] Crew position flag ('PASSENGER', 'DRIVER', 'GUNNER', or 'COMMANDER')
	 * @param {boolean} [isExposed=false]   Whether it's an exposed position
	 * @returns {VehicleOccupant}
	 */
	async addVehicleOccupant(crewId, position = 'PASSENGER') {
		if (this.type !== 'vehicles' && this.type !== 'spacecraft') return;
		if (this.type === 'vehicles') {
			if (!ALIENRPG.vehicle.crewPositionFlags.includes(position)) {
				throw new TypeError(`alienrpg | addVehicleOccupant | Wrong position flag: ${position}`);
			}
		} else if (this.type === 'spacecraft') {
			// position = 'CREW';
			if (!ALIENRPG.spacecraft.crewPositionFlags.includes(position)) {
				throw new TypeError(`alienrpg | addVehicleOccupant | Wrong position flag: ${position}`);
			}
		}
		const system = this.system;
		// if (!(system.crew.occupants instanceof Array)) {
		//   system.crew.occupants = [];
		// }
		const occupant = {
			id: crewId,
			position,
		};
		// Removes duplicates.
		if (system.crew.occupants.some((o) => o.id === crewId)) this.removeVehicleOccupant(crewId);
		// Adds the new occupant.
		system.crew.occupants.push(occupant);
		await this.update({ 'system.crew.occupants': system.crew.occupants });

		await this.update({ 'system.crew.passengerQty': system.crew.occupants.length });

		return occupant;
	}

	/* ------------------------------------------- */

	/**
	 * Removes an occupant from the vehicle.
	 * @param {string} crewId The id of the occupant to remove
	 * @return {VehicleOccupant[]}
	 */
	removeVehicleOccupant(crewId) {
		if (this.type !== 'vehicles' && this.type !== 'spacecraft') return;
		const crew = this.system.crew;
		crew.occupants = crew.occupants.filter((o) => o.id !== crewId);
		return crew.occupants;
	}

	/* ------------------------------------------- */

	/**
	 * Gets a specific occupant in the vehicle.
	 * @param {string} crewId The id of the occupant to find
	 * @returns {VehicleOccupant|undefined}
	 */
	getVehicleOccupant(crewId) {
		if (this.type !== 'vehicles' && this.type !== 'spacecraft') return;
		return this.system.crew.occupants.find((o) => o.id === crewId);
	}

	/* ------------------------------------------- */

	/**
	 * Gets a collection of crewed actors.
	 * @returns {Collection<string, Actor>} [id, actor]
	 */
	getCrew() {
		if (this.type !== 'vehicles' && this.type !== 'spacecraft') return undefined;
		const c = new foundry.utils.Collection();
		for (const o of this.system.crew.occupants) {
			c.set(o.id, game.actors.get(o.id));
		}
		return c;
	}

	async createChatMessage(message, actorID) {
		let chatData = {
			user: game.user.id,
			speaker: {
				actor: actorID,
			},
			content: new Handlebars.SafeString(message),
			other: game.users.contents.filter((u) => u.isGM).map((u) => u.id),
			sound: CONFIG.sounds.lock,
		};

		ChatMessage.applyRollMode(chatData, game.settings.get('core', 'rollMode'));
		return ChatMessage.create(chatData);
	}
}
export default alienrpgActor;
