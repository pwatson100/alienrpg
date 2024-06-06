export class yze {
	/**
	 * YZEDice RollFunction.
	 * Param for number of dice to roll for each die type/rolls
	 * @param {Text} actor - Passed actor data
	 * @param {Text} actortype - Passed actor type
	 * @param {Boolean} blind - True or False
	 * @param {Boolean} reRoll - True or False
	 * @param {Text} label - The skill/item being rolled against
	 * @param {number} r1Dice - Number of dice
	 * @param {Text} col1 - The Colour
	 * @param {number} r2Dice  - Number of dice
	 * @param {Text} col2 - The Colour
	 * @param {Text} tLabel - Spare label for future use
	 * @param {number} sCount - Count of last number of successes to add to the push reroll
	 *
	 * rollArr is a globally defined array to store all one's and sixes and number of dice rolled for each type
	 *   game.alienrpg.rollArr = { r1Dice: 0, r1One: 0, r1Six: 0, r2Dice: 0, r2One: 0, r2Six: 0, tLabel: '' , sCount: 0 };
	 *
	 * Call Example:
	 * const element = event.currentTarget;
	 * const dataset = element.dataset;
	 * let label = dataset.label;
	 * let r1Data = parseInt(dataset.roll || 0);
	 * let r2Data = this.actor.getRollData().header.stress.value;
	 * let reRoll = false;
	 * yze.yzeRoll(actortype, blind, reRoll, label, r1Data, 'Black', r2Data, 'Yellow');
	 *
	 */
	static async yzeRoll(actortype, blind, reRoll, label, r1Dice, col1, r2Dice, col2, actorid, itemid, tactorid) {
		// console.log('yze -> yzeRoll -> actortype, blind, reRoll, label, r1Dice, col1, r2Dice, col2', actortype, blind, reRoll, label, r1Dice, col1, r2Dice, col2);
		// *******************************************************
		// Store the version number of FVTT
		// *******************************************************
		// const sysVer = game.data.version;

		// *******************************************************
		// Is Dice So Nice enabled ?
		// *******************************************************
		let niceDice = '';
		let myActor = '';
		let dataset = '';

		try {
			niceDice = true;
			game.settings.get('dice-so-nice', 'settings').enabled;
		} catch {
			niceDice = false;
		}
		let spud = false;

		// *******************************************************
		//  Initialise the chat message
		// *******************************************************
		let chatMessage = `<div class="chatBG" data-item-id="` + itemid + `" data-actor-id="` + actorid + `">`;

		// *******************************************************
		//  Data structure for DsN V3
		// *******************************************************
		let mr = '';
		let roll1;

		// *******************************************************
		// Set up text for a roll or push
		// *******************************************************
		let rType = '';
		// if (reRoll && (hostile === true) === 'character') {
		if (
			(reRoll &&
				actortype === 'character' &&
				actortype != 'item' &&
				label != game.i18n.localize('ALIENRPG.Armor') &&
				label != game.i18n.localize('ALIENRPG.Radiation') &&
				label != game.i18n.localize('ALIENRPG.RadiationReduced') &&
				label != game.i18n.localize('ALIENRPG.AbilityStr') &&
				label != game.i18n.localize('ALIENRPG.AbilityAgl') &&
				label != game.i18n.localize('ALIENRPG.AbilityEmp') &&
				label != game.i18n.localize('ALIENRPG.AbilityWit')) ||
			reRoll === 'mPush'
		) {
			// if ((reRoll && actortype === 'character' && label != 'Armor' && label != 'Radiation') || reRoll === 'mPush') {
			rType = game.i18n.localize('ALIENRPG.Push');
		} else {
			if (label === game.i18n.localize('ALIENRPG.RadiationReduced')) {
				rType = '';
			} else {
				rType = game.i18n.localize('ALIENRPG.Rolling');
			}
		}

		// *******************************************************
		// Save the successes from the last roll
		// *******************************************************
		let oldRoll = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
		// game.alienrpg.rollArr.multiPush += game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;

		// *******************************************************
		// Clear the global dice array
		// *******************************************************
		// game.alienrpg.rollArr = { r1Dice: 0, r1One: 0, r1Six: 0, r2Dice: 0, r2One: 0, r2Six: 0, tLabel: '' };
		game.alienrpg.rollArr.r1Dice = 0;
		game.alienrpg.rollArr.r1One = 0;
		game.alienrpg.rollArr.r1Six = 0;
		game.alienrpg.rollArr.r2Dice = 0;
		game.alienrpg.rollArr.r2One = 0;
		game.alienrpg.rollArr.r2Six = 0;
		game.alienrpg.rollArr.sCount = 0;
		game.alienrpg.rollArr.tLabel = '';

		// *******************************************************
		// Setup the constants for the 3D dice roll V2 method
		// *******************************************************
		const data = {
			formula: '',
			results: [],
		};
		if (!r1Dice && !r2Dice) {
			return ui.notifications.warn(game.i18n.localize('ALIENRPG.NoAttribute'));
		}
		// *******************************************************
		// Handle Base Dice Roll
		// *******************************************************
		chatMessage += '<h2 class="alienchatwhite">' + rType + ' ' + label + ' </h2>';
		if (r1Dice >= 1) {
			roll1 = `${r1Dice}` + 'db';
			if (r2Dice <= 0) {
				mr = await Roll.create(`${roll1}`).evaluate();
				buildChat(mr, r1Dice, game.i18n.localize('ALIENRPG.Base'));
				// console.log('yze -> yzeRoll -> mr', mr);
			}
		} else {
			if (r1Dice < 0) {
				r2Dice = r2Dice + r1Dice;
				if (r2Dice < 1) {
					return ui.notifications.warn(game.i18n.localize('ALIENRPG.NoDice'));
				}
			}
			roll1 = 0 + 'db';
		}

		// *******************************************************
		// Handle Stress Dice Roll
		// *******************************************************

		if (r2Dice >= 1) {
			let roll2 = `${r2Dice}` + 'ds';
			let com;
			if (actortype === 'supply' || label === game.i18n.localize('ALIENRPG.RadiationReduced')) {
				if (r2Dice > 6) {
					r2Dice = 6;
					com = `${r2Dice}` + 'ds';
				} else {
					// // console.log('yze -> yzeRoll -> hostile', hostile);
					com = `${roll2}`;
				}
			} else {
				com = `${roll1}` + '+' + `${roll2}`;
				// mr = '';
			}
			mr = await Roll.create(`${com}`).evaluate();

			// mr = new Roll(`${com}`).evaluate({ async: false });
			// await mr.evaluate({ async: true });
			// console.log('yze -> yzeRoll -> mr', mr);
			buildChat(mr, r1Dice, 'Stress');

			// *******************************************************
			// Set reroll
			// *******************************************************
			if (game.alienrpg.rollArr.r2One > 0) {
				if (reRoll === 'push' || reRoll === 'mPush') {
					spud = true;
				}
				reRoll = true;
			}

			// *******************************************************
			// Display message if there is a 1> on the stress dice.  Display appropriate message if its a Supply roll.
			// *******************************************************
			if (actortype != 'supply' && game.alienrpg.rollArr.r2One >= 1 && label != game.i18n.localize('ALIENRPG.RadiationReduced')) {
				logger.warn('! Supply ', 'r2One ', game.alienrpg.rollArr.r2One, 'Label', label, 'reRoll', reRoll, 'spud', spud);
				// if (game.alienrpg.rollArr.r2One >= 1 && label != game.i18n.localize('ALIENRPG.RadiationReduced')) {
				chatMessage +=
					'<div class="warnblink alienchatred"; style="font-weight: bold; font-size: larger">' + game.i18n.localize('ALIENRPG.rollStress') + '</div>';
				if (game.settings.get('alienrpg', 'autopanic')) {
					if (tactorid != 'spacecraft') {
						myActor = game.actors.get(actorid);
						console.log('PC Panic');
						dataset = {
							panicroll: myActor.getRollData().header.stress.value,
							mod: myActor.getRollData().header.stress.mod,
							label: game.i18n.localize('ALIENRPG.Stress'),
						};
						myActor.rollAbility(myActor, dataset);
					} else {
						myActor = game.actors.get(actorid);
						console.log('Crew Panic');
						dataset = {
							panicroll: myActor.getRollData().header.stress.value,
							mod: myActor.getRollData().header.stress.mod,
							label: game.i18n.localize('ALIENRPG.Stress'),
							shippanicbut: 'true',
						};
						myActor.rollAbility(myActor, dataset);
					}
				}
				// }
			} else if (game.alienrpg.rollArr.r2One >= 1 && label != game.i18n.localize('ALIENRPG.RadiationReduced')) {
				chatMessage +=
					'<div class="alienchatblue warnblink"; style="font-weight: bold; font-size: larger">' + game.i18n.localize('ALIENRPG.supplyDecreases') + '</div>';
			}
		}
		// *******************************************************
		// Calculate the total successes and display as long as it's not a Supply roll.
		// *******************************************************

		function localizedCountOfSuccesses(sTotal) {
			switch (label) {
				case game.i18n.localize('ALIENRPG.Radiation'): {
					if (sTotal >= 1) {
						return (
							sTotal +
							' ' +
							'<span class="warnblink alienchatred"; style="font-weight: bold; font-size: larger">' +
							game.i18n.localize('ALIENRPG.healthDamage') +
							'</span>'
						);
						// return sTotal + ' ' + game.i18n.localize('ALIENRPG.healthDamage');
					} else {
						return sTotal + ' ' + game.i18n.localize('ALIENRPG.healthDamage');
					}
				}
				case game.i18n.localize('ALIENRPG.RadiationReduced'): {
					if (game.alienrpg.rollArr.r2One) {
						return (
							'<span class="warnblink alienchatred"; style="font-weight: bold; font-size: larger">' +
							game.i18n.localize('ALIENRPG.PermanentRadiation') +
							'</span>'
						);
					} else {
						return game.i18n.localize('ALIENRPG.RadiationReduced');
					}
				}

				default:
					if (sTotal === 1) return '1 ' + game.i18n.localize('ALIENRPG.sucess');
					else return sTotal + ' ' + game.i18n.localize('ALIENRPG.sucesses');
			}
		}

		if (actortype != 'supply') {
			switch (label) {
				case game.i18n.localize('ALIENRPG.Radiation'):
					{
						if (game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six + game.alienrpg.rollArr.sCount >= 1) {
							chatMessage +=
								'<div class="warnblink alienchatred"; style="font-weight: bold; font-size: larger">' +
								game.i18n.localize('ALIENRPG.youTake') +
								' ' +
								localizedCountOfSuccesses(game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six + game.alienrpg.rollArr.sCount) +
								' </div>';
						} else {
							chatMessage +=
								'<div class="alienchatlightblue">' +
								game.i18n.localize('ALIENRPG.youTake') +
								' ' +
								localizedCountOfSuccesses(game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six + game.alienrpg.rollArr.sCount) +
								' </div>';
						}
					}
					break;
				case game.i18n.localize('ALIENRPG.RadiationReduced'):
					{
						if (game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six + game.alienrpg.rollArr.sCount === 6) {
							chatMessage +=
								'<div class="warnblink alienchatred"; style="font-weight: bold; font-size: larger">' +
								localizedCountOfSuccesses(game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six + game.alienrpg.rollArr.sCount) +
								' </div>';
						} else {
							chatMessage +=
								'<div class="alienchatlightblue">' +
								localizedCountOfSuccesses(game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six + game.alienrpg.rollArr.sCount) +
								' </div>';
						}
					}
					break;

				default:
					break;
			}
		}

		// *******************************************************
		//  If it's a Push roll and display the total for both rolls.
		// *******************************************************
		// if (reRoll === 'push' || (reRoll === 'mPush' && actortype === 'character' && label != 'Armor')) {
		if (reRoll === 'push' || (reRoll === 'mPush' && actortype === 'character' && label != game.i18n.localize('ALIENRPG.Armor'))) {
			chatMessage +=
				'<hr>' +
				'<div class="alienchatlightblue">' +
				game.i18n.localize('ALIENRPG.followingPush') +
				'<br>' +
				game.i18n.localize('ALIENRPG.totalOf') +
				' ' +
				localizedCountOfSuccesses(oldRoll + game.alienrpg.rollArr.multiPush + game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six) +
				' </div>';
			game.alienrpg.rollArr.multiPush = oldRoll;
			// console.log('spud');
		}
		if (spud) {
			chatMessage +=
				'<hr>' +
				'<div class="alienchatlightblue">' +
				game.i18n.localize('ALIENRPG.followingPush') +
				'<br>' +
				game.i18n.localize('ALIENRPG.totalOf') +
				' ' +
				localizedCountOfSuccesses(oldRoll + game.alienrpg.rollArr.multiPush + game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six) +
				' </div>';
			// game.alienrpg.rollArr.multiPush = oldRoll;
			// console.log('spud');
		}

		// *******************************************************
		// Render the reroll button
		// *******************************************************

		if (!reRoll || reRoll === 'mPush') {
			if (reRoll != 'mPush') {
				chatMessage +=
					`<span style="font-size:larger">` +
					game.i18n.localize('ALIENRPG.MultiPush') +
					` ` +
					`</span> <input class="multiPush" name="multiPush" type="checkbox" {{checked false}} /> `;
			}
			// chatMessage += `<button class="alien-Push-button" title="PUSH Roll?" style="color: #adff2f; font-weight: bold; font-size: xxx-large">` + game.i18n.localize('ALIENRPG.Push') + `</button>`;
			chatMessage += `<button class="alien-Push-button" title="PUSH Roll?">` + game.i18n.localize('ALIENRPG.Push') + `</button>`;
			chatMessage += `<span class="dmgBtn-container" style="position:absolute; right:0; bottom:1px;"></span>`;
			chatMessage += `<span class="dmgBtn-container" style="position:absolute; top:0; right:0; bottom:1px;"></span>`;
		}
		// *******************************************************
		// For FVTT v0.7.x and DsN V3 set the appropriate chat config
		// *******************************************************

		if (!blind) {
			ChatMessage.create({
				user: game.user.id,
				speaker: {
					actor: actorid,
					// alias: tactorid,
				},
				content: chatMessage,
				other: game.users.contents.filter((u) => u.isGM).map((u) => u.id),
				sound: CONFIG.sounds.dice,
				// type: CONST.CHAT_MESSAGE_STYLES.ROLL,
				roll: mr,
				rollMode: game.settings.get('core', 'rollMode'),
				flags: { tactorid },
			});
		} else {
			ChatMessage.create({
				user: game.user.id,
				speaker: {
					actor: actorid,
				},
				content: chatMessage,
				whisper: game.users.contents.filter((u) => u.isGM).map((u) => u.id),
				blind: true,
				// type: CONST.CHAT_MESSAGE_STYLES.ROLL,
				roll: mr,
				rollMode: game.settings.get('core', 'rollMode'),
				flags: { tactorid },
			});
		}
		// }

		// *******************************************************
		// Function to build chat and dice for DsN V3
		// *******************************************************
		function buildChat(mr, numDie, dType) {
			let numbers = [];
			let numbers2 = [];
			let R6 = 0;
			let R1 = 0;
			let RB6 = 0;
			let RB1 = 0;
			let RY6 = 0;
			let RY1 = 0;
			let mrterms;
			game.alienrpg.rollArr.tLabel = label;

			if (dType != 'Stress') {
				for (let index = 0; index < mr.terms[0].results.length; index++) {
					let spanner = flattenObj(mr.terms[0].results[index]);
					numbers.push(spanner.result);
				}
				R6 = numbers.filter(myFunSix);
				R1 = numbers.filter(myFunOne);
				game.alienrpg.rollArr.r1Dice = numDie;
				game.alienrpg.rollArr.r1Six = R6.length;
				game.alienrpg.rollArr.r1One = R1.length;
				let numOf6s = R6.length; // added by Steph
				let numOf1s = R1.length; // added by Steph
				chatMessage +=
					'<div <span class="alienchatlightgreen" style="font-size:larger">' + col1 + '  ' + r1Dice + ' ' + game.i18n.localize('ALIENRPG.Dice') + '</div>';
				chatMessage += '<span <span class="alienchatlightgreen" style="font-size:larger"> ' + game.i18n.localize('ALIENRPG.Sixes') + '</span>';
				chatMessage += `${R6.length}`;
				chatMessage += '<div>';
				// added by Steph (for loop, and moved div close)
				for (var _d = 0; _d < numDie; _d++) {
					if (numOf6s > 0) {
						chatMessage += "<span class='alien-diceface-b6'></span>";
						numOf6s--;
					} else {
						chatMessage += "<span class='alien-diceface-b0'></span>";
					}
				}
				chatMessage += '</div>';
			} else {
				if (actortype != 'supply' && label != game.i18n.localize('ALIENRPG.RadiationReduced')) {
					for (let index = 0; index < mr.terms[0].results.length; index++) {
						let spanner = flattenObj(mr.terms[0].results[index]);
						numbers.push(spanner.result);
					}
					RB6 = numbers.filter(myFunSix);
					RB1 = numbers.filter(myFunOne);
					game.alienrpg.rollArr.r1Dice = mr.terms[0].number;
					game.alienrpg.rollArr.r1Six = RB6.length;
					game.alienrpg.rollArr.r1One = RB1.length;
					let numOfB6s = RB6.length; // added by Steph
					let numOfB1s = RB1.length; // added by Steph
					// Base Dice
					chatMessage +=
						'<div <span class="alienchatlightgreen" style="font-size:larger"> ' + col1 + '  ' + r1Dice + ' ' + game.i18n.localize('ALIENRPG.Dice') + '</div>';
					chatMessage += '<span class="alienchatlightgreen" style="font-size:larger"> ' + game.i18n.localize('ALIENRPG.Sixes') + '</span>';
					chatMessage += `${RB6.length}`;
					chatMessage += '<div>';
					// added by Steph (for loop, and moved div close)
					for (var _d = 0; _d < mr.terms[0].number; _d++) {
						if (numOfB6s > 0) {
							chatMessage += "<span class='alien-diceface-b6'></span>";
							numOfB6s--;
						} else {
							chatMessage += "<span class='alien-diceface-b0'></span>";
						}
					}
					chatMessage += '</div>';
				}
				if (actortype === 'supply' || (actortype != 'supply' && label === game.i18n.localize('ALIENRPG.RadiationReduced'))) {
					for (let index = 0; index < mr.terms[0].results.length; index++) {
						let spanner = flattenObj(mr.terms[0].results[index]);
						numbers.push(spanner.result);
					}
					game.alienrpg.rollArr.r2Dice = mr.terms[0].number;
					mrterms = mr.terms[0].number;
					RY6 = numbers.filter(myFunSix);
					RY1 = numbers.filter(myFunOne);
				} else {
					for (let index = 0; index < mr.terms[2].results.length; index++) {
						let spanner = flattenObj(mr.terms[2].results[index]);
						numbers2.push(spanner.result);
					}
					game.alienrpg.rollArr.r2Dice = mr.terms[2].number;
					mrterms = mr.terms[2].number;
					RY6 = numbers2.filter(myFunSix);
					RY1 = numbers2.filter(myFunOne);
				}

				game.alienrpg.rollArr.r2Six = RY6.length;
				game.alienrpg.rollArr.r2One = RY1.length;

				let numOfY6s = RY6.length; // added by Steph
				let numOfY1s = RY1.length; // added by Steph

				// Yellow Dice
				chatMessage +=
					'<div class="alienchatgoldenrod" style="font-size:larger">' + col2 + '  ' + r2Dice + ' ' + game.i18n.localize('ALIENRPG.Dice') + '</div>';
				chatMessage += '<span class="alienchatred">' + game.i18n.localize('ALIENRPG.Ones') + ' </span>';
				chatMessage += `<span>${RY1.length}&nbsp;&nbsp;&nbsp;</span>`;
				chatMessage += '<span class="alienchatlightgreen" style="font-size:larger">' + game.i18n.localize('ALIENRPG.Sixes') + '</span>';
				chatMessage += `${RY6.length}`;
				chatMessage += '<div>';
				// added by Steph (for loops, and moved div close)
				for (var _d = 0; _d < numOfY6s; _d++) {
					chatMessage += "<span class='alien-diceface-y6'></span>";
				}
				for (var _d = 0; _d < numOfY1s; _d++) {
					chatMessage += "<span class='alien-diceface-y1'></span>";
				}
				let _theRest = mrterms - (numOfY6s + numOfY1s);
				for (var _d = 0; _d < _theRest; _d++) {
					chatMessage += "<span class='alien-diceface-y0'></span>";
				}
				chatMessage += '</div>';
			}
			function myFunSix(value, index, array) {
				return value === 6;
			}
			function myFunOne(value, index, array) {
				return value === 1;
			}
		}

		// *******************************************************
		// Function to flatten Arrays to make them easier to parse
		// *******************************************************
		function flattenObj(obj, parent, res = {}) {
			for (let key in obj) {
				let propName = parent ? parent + '_' + key : key;
				if (typeof obj[key] == 'object') {
					flattenObj(obj[key], propName, res);
				} else {
					res[propName] = obj[key];
				}
			}
			return res;
		}
	}
}
