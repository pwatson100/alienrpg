import { yze } from "../helpers/YZEDiceRoller.mjs"

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class alienrpgItem extends Item {
	/**
	 * Augment the basic Item data model with additional dynamic data.
	 */
	prepareData() {
		// As with the actor class, items are documents that can have their data
		// preparation methods overridden (such as prepareBaseData()).
		super.prepareData()
	}

	/**
	 * Prepare a data object which defines the data schema used by dice roll commands against this Item
	 * @override
	 */
	getRollData() {
		// Starts off by populating the roll data with a shallow copy of `this.system`
		const rollData = { ...this.system }

		// Quit early if there's no parent actor
		if (!this.actor) return rollData

		// If present, add the actor's roll data
		rollData.actor = this.actor.getRollData()

		return rollData
	}

	/**
	 * Handle clickable rolls.
	 * @param {Event} event   The originating click event
	 * @private
	 */
	async roll(right, dataset) {
		// Basic template rendering data
		let confirmed = false

		let myReturn = ""
		const config = CONFIG.ALIENRPG
		let content = ""
		let response = ""
		let carefullaimMod = 0
		let aimforweakspotMod = 0
		let shootrangeMod = 0
		let modifier = ""
		let stressMod = ""
		let hostile = this.actor.type
		let blind = false
		const actorData = this.actor ? this.actor.system : {}
		let actorid = this.actor.id
		const itemData = this.system
		// const item = this
		const itemid = this.id
		game.alienrpg.rollArr.sCount = 0
		game.alienrpg.rollArr.multiPush = 0
		let r1Data = 0
		let r2Data = 0
		let reRoll = false
		let label = `${this.name} (` + game.i18n.localize("ALIENRPG.Damage") + ` : ${itemData.attributes.damage.value})`
		const title =
			game.i18n.localize("ALIENRPG.DialTitle1") + " " + label + " " + game.i18n.localize("ALIENRPG.DialTitle2")

		if (this.type === "armor") {
			return
		}
		if (this.actor.type === "character") {
			r2Data = this.actor.getRollData().header.stress.value
			reRoll = false
		} else {
			r2Data = 0
			reRoll = true
		}
		if (this.actor.prototypeToken?.disposition === -1) {
			blind = true
		}
		if (right) {
			// ************************************
			// Right Click Roll so display modboxes
			// ************************************

			// call pop up box here to get any mods then update r1Data or rData as appropriate.
			// Check that is a character or a synth pretending to be a character.
			if (this.actor.type === "character" || actorData.header.synthstress) {
				content = await foundry.applications.handlebars.renderTemplate(
					"systems/alienrpg/templates/dialog/roll-all-dialog.hbs",
					{ config, actorData, dataset },
				)

				response = await foundry.applications.api.DialogV2.wait({
					window: { title: title },
					content,
					rejectClose: false,
					buttons: [
						{
							label: "ALIENRPG.DialRoll",
							callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object,
						},
						{
							label: "ALIENRPG.DialCancel",
							action: "cancel",
						},
					],
				})
				if (!response || response === "cancel") return "cancelled"

				if (response) {
					modifier = Number(response.modifier)
					stressMod = Number(response.stressMod)
					// Define the roll formula.
					if (itemData.header.type.value === "1") {
						const r1Data = actorData.skills.rangedCbt.mod + itemData.attributes.bonus.value + modifier
						r2Data = r2Data + stressMod
						yze.yzeRoll(
							hostile,
							blind,
							reRoll,
							label,
							r1Data,
							game.i18n.localize("ALIENRPG.Black"),
							r2Data,
							game.i18n.localize("ALIENRPG.Yellow"),
							actorid,
							itemid,
						)
						game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six
					} else if (itemData.header.type.value === "2") {
						const r1Data = actorData.skills.closeCbt.mod + itemData.attributes.bonus.value + modifier
						r2Data = r2Data + stressMod
						yze.yzeRoll(
							hostile,
							blind,
							reRoll,
							label,
							r1Data,
							game.i18n.localize("ALIENRPG.Black"),
							r2Data,
							game.i18n.localize("ALIENRPG.Yellow"),
							actorid,
							itemid,
						)
						game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six
					} else {
						console.warn("No type on item")
					}
				}
			} else {
				// Its not got stress so don't display the stress mod box
				content = await foundry.applications.handlebars.renderTemplate(
					"systems/alienrpg/templates/dialog/roll-base-dialog.hbs",
					config,
					actorData,
					dataset,
				)
				response = await foundry.applications.api.DialogV2.wait({
					window: { title: title },
					content,
					rejectClose: false,
					buttons: [
						{
							label: "ALIENRPG.DialRoll",
							callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object,
						},
						{
							label: "ALIENRPG.DialCancel",
							action: "cancel",
						},
					],
				})
				if (!response || response === "cancel") return "cancelled"
				if (response) {
					modifier = Number(response.modifier)
					stressMod = 0
					if (this.actor.type !== "vehicles" && this.actor.type !== "spacecraft") {
						// it's not a vehicle so add the correct attribute bonus
						// Define the roll formula.
						if (itemData.header.type.value === "1") {
							const r1Data = actorData.skills.rangedCbt.mod + itemData.attributes.bonus.value + modifier
							r2Data = r2Data + stressMod
							yze.yzeRoll(
								hostile,
								blind,
								reRoll,
								label,
								r1Data,
								game.i18n.localize("ALIENRPG.Black"),
								r2Data,
								game.i18n.localize("ALIENRPG.Yellow"),
								actorid,
								itemid,
							)
							game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six
						} else if (itemData.header.type.value === "2") {
							const r1Data = actorData.skills.closeCbt.mod + itemData.attributes.bonus.value + modifier
							r2Data = r2Data + stressMod
							yze.yzeRoll(
								hostile,
								blind,
								reRoll,
								label,
								r1Data,
								game.i18n.localize("ALIENRPG.Black"),
								r2Data,
								game.i18n.localize("ALIENRPG.Yellow"),
								actorid,
								itemid,
							)
							game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six
						} else {
							console.warn("No type on item")
						}
					}
				}
			}
		} else {
			// ************************************
			// Normal Left Click Roll
			// ************************************
			// Define the roll formula.
			if (this.actor.type !== "vehicles" && this.actor.type !== "spacecraft") {
				// it's not a vehicle so add the correct attribute bonus
				// Define the roll formula.
				switch (itemData.header.type.value) {
					case "1":
						if (game.settings.get("alienrpg", "evolved")) {
							if (this.system.header.fullauto) {
								dataset.fullauto = true
							}
							content = await foundry.applications.handlebars.renderTemplate(
								"systems/alienrpg/templates/dialog/roll-ranged-weapon-dialog.hbs",
								{ config, actorData, dataset },
							)
							response = await foundry.applications.api.DialogV2.wait({
								window: { title: title },
								content,
								rejectClose: false,
								buttons: [
									{
										label: "ALIENRPG.DialRoll",
										callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object,
									},
									{
										label: "ALIENRPG.DialCancel",
										action: "cancel",
									},
								],
							})
							if (!response || response === "cancel") return "cancelled"

							if (response) {
								dataset.weapontype = itemData.header.type.value
								dataset.conserveammo = response.conserveammo
								dataset.modifier = Number(response.modifier)
								dataset.stressMod = Number(response.stressMod)
								dataset.shootrangeMod = Number(response.rangeChoice)
								dataset.sizeMod = Number(response.sizeChoice)
								dataset.targetCoverMod = Number(response.targetCover)
								dataset.firingFullAuto = response.firingFullAuto
								if (response.carefullaim) {
									carefullaimMod = 2
								}
								if (response.aimforweakspot) {
									aimforweakspotMod = -2
								}
								// Is the target at a greater range?  If so Say Out Of Range
								if (Number(itemData.attributes.range.value - dataset.shootrangeMod) < 0) {
										return ui.notifications.warn(game.i18n.localize("ALIENRPG.OutofRange"))

								}
								// Is Target < min range.  If so -2 for each range level.
								if (Number(dataset.shootrangeMod) - itemData.attributes.minrange.value < 0) {
									shootrangeMod = 2 * (Number(dataset.shootrangeMod) - itemData.attributes.minrange.value)
								}
								if (dataset.shootrangeMod === '1') {
									console.log(`Using Close Combat, ${actorData.skills.closeCbt.mod}`)
									r1Data =
									actorData.skills.closeCbt.mod +
									itemData.attributes.bonus.value +
									Number(dataset.modifier) +
									Number(dataset.targetCoverMod) +
									Number(dataset.sizeMod) +
									carefullaimMod +
									aimforweakspotMod +
									Number(shootrangeMod)
									} else {
									console.log(`Using Ranged Combat, ${actorData.skills.rangedCbt.mod}`)
									r1Data =
									actorData.skills.rangedCbt.mod +
									itemData.attributes.bonus.value +
									Number(dataset.modifier) +
									Number(dataset.targetCoverMod) +
									Number(dataset.sizeMod) +
									carefullaimMod +
									aimforweakspotMod +
									Number(shootrangeMod)
								}
								console.log("r1Data", r1Data)
								r2Data = r2Data + Number(dataset.stressMod)
								myReturn = await yze.yzeRoll(
									hostile,
									blind,
									reRoll,
									label,
									r1Data,
									game.i18n.localize("ALIENRPG.Black"),
									r2Data,
									game.i18n.localize("ALIENRPG.Yellow"),
									actorid,
									itemid,
									"",
									dataset,
								)
							}
						} else {
							r1Data = actorData.skills.rangedCbt.mod + itemData.attributes.bonus.value + modifier
							r2Data = r2Data + stressMod
							yze.yzeRoll(
								hostile,
								blind,
								reRoll,
								label,
								r1Data,
								game.i18n.localize("ALIENRPG.Black"),
								r2Data,
								game.i18n.localize("ALIENRPG.Yellow"),
								actorid,
								itemid,
							)
						}
						game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six
						break
					case "2":
						r1Data = actorData.skills.closeCbt.mod + itemData.attributes.bonus.value + modifier
						r2Data = r2Data + stressMod
						yze.yzeRoll(
							hostile,
							blind,
							reRoll,
							label,
							r1Data,
							game.i18n.localize("ALIENRPG.Black"),
							r2Data,
							game.i18n.localize("ALIENRPG.Yellow"),
							actorid,
							itemid,
						)
						game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six
						break
					default:
						console.warn("No type on item")
						break
				}
			} else {
				// it's a vehicle so no attribute bonus
				switch (this.actor.type) {
					case "vehicles":
						{
							if (itemData.header.type.value === "1" || itemData.header.type.value === "2") {
								const fCrew = []
								const options = {}
								for (const [index] of actorData.crew.occupants.entries()) {
									if (actorData.crew.occupants[index].position !== "PASSENGER") {
										const firer = game.actors.get(actorData.crew.occupants[index].id)
										const fIndex =
											fCrew.push({
												firerName: firer.name,
												firerID: firer.id,
												position: actorData.crew.occupants[index].position,
											}) - 1
										// options = options.concat(`<option value="${fIndex}">${firer.name}</option>`)
										options[`${fIndex}`] = `${firer.name}`
										console.log("Options", options)
									}
								}
								if (fCrew.length === 0) {
									return ui.notifications.warn(game.i18n.localize("ALIENRPG.noCrewAssigned"))
								}
								content = await foundry.applications.handlebars.renderTemplate(
									"systems/alienrpg/templates/dialog/roll-vehicle-weapon.hbs",
									{ config, actorData, dataset, options },
								)

								response = await foundry.applications.api.DialogV2.wait({
									window: { title: title },
									content,
									rejectClose: false,
									buttons: [
										{
											label: "ALIENRPG.DialRoll",
											callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object,
										},
										{
											label: "ALIENRPG.DialCancel",
											action: "cancel",
										},
									],
								})
								if (!response || response === "cancel") return "cancelled"

								if (response) {
									const shooter = Number(response.FirerSelect)
									actorid = fCrew[shooter].firerID
									const tactorid = fCrew[shooter].firerID
									const modifier = Number(response.modifier)
									stressMod = Number(response.stressMod)
									const aStressVal = Number(game.actors.get(tactorid).system.header?.stress?.value || 0)
									let rangeMod = Number(response.rangeMod)
									// if (Number.isNaN(rangeMod)) rangeMod = 0

								// Is the target at a greater range?  If so Say Out Of Range
								if (Number(itemData.attributes.range.value - rangeMod) < 0) {
										return ui.notifications.warn(game.i18n.localize("ALIENRPG.OutofRange"))

								}
								// Is Target < min range.  If so -2 for each range level.
								if (Number(rangeMod) - itemData.attributes.minrange.value < 0) {
									rangeMod = 2 * (Number(rangeMod) - itemData.attributes.minrange.value)
								} else {
									rangeMod = 0
								}

									const r1Data = Number(
										game.actors.get(tactorid).system.skills.rangedCbt.mod +
										itemData.attributes.bonus.value +
											modifier +
											rangeMod
									)
									const r2Data = Number(aStressVal + stressMod)
									label += ` (${this.actor.name}) `
									// label += ` (${fCrew[shooter].firerName}) `;
									if (game.actors.get(tactorid).type === "synthetic") {
										reRoll = true
										hostile = "synthetic"
									} else {
										reRoll = false
										hostile = "character"
									}
									yze.yzeRoll(
										hostile,
										blind,
										reRoll,
										label,
										r1Data,
										game.i18n.localize("ALIENRPG.Black"),
										r2Data,
										game.i18n.localize("ALIENRPG.Yellow"),
										actorid,
										itemid,
									)

									game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six
								}
							}
						}
						break
					case "spacecraft":
						{
							if (itemData.header.type.value === "1") {
								const fCrew = []
								const options = {}
								for (const [index] of actorData.crew.occupants.entries()) {
									if (actorData.crew.occupants[index].position !== "PASSENGER") {
										const firer = game.actors.get(actorData.crew.occupants[index].id)
										const fIndex =
											fCrew.push({
												firerName: firer.name,
												firerID: firer.id,
												position: actorData.crew.occupants[index].position,
											}) - 1
										// options = options.concat(`<option value="${fIndex}">${firer.name}</option>`)
										options[`${fIndex}`] = `${firer.name}`
										console.log("Options", options)
									}
								}
								if (fCrew.length === 0) {
									return ui.notifications.warn(game.i18n.localize("ALIENRPG.noCrewAssigned"))
								}
								content = await foundry.applications.handlebars.renderTemplate(
									"systems/alienrpg/templates/dialog/roll-vehicle-weapon.hbs",
									{ config, actorData, dataset, options },
								)

								response = await foundry.applications.api.DialogV2.wait({
									window: { title: title },
									content,
									rejectClose: false,
									buttons: [
										{
											label: "ALIENRPG.DialRoll",
											callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object,
										},
										{
											label: "ALIENRPG.DialCancel",
											action: "cancel",
										},
									],
								})
								if (!response || response === "cancel") return "cancelled"

								if (response) {
									const shooter = Number(response.FirerSelect)
									actorid = fCrew[shooter].firerID
									const tactorid = fCrew[shooter].firerID
									const modifier = Number(response.modifier)
									stressMod = Number(response.stressMod)
									const aStressVal = Number(game.actors.get(tactorid).system.header?.stress?.value || 0)
									let rangeMod = Number(response.rangeMod)
									if (Number.isNaN(rangeMod)) rangeMod = 0

									const r1Data = Number(
										itemData.attributes.bonus.value +
											modifier +
											rangeMod +
											game.actors.get(tactorid).system.skills.rangedCbt.mod,
									)
									// let r2Data = parseInt(aStressVal + aStressMod + stressMod);
									const r2Data = Number(aStressVal + stressMod)
									label += ` (${this.actor.name}) `
									// label += ` (${fCrew[shooter].firerName}) `;
									if (game.actors.get(tactorid).type === "synthetic") {
										reRoll = true
										hostile = "synthetic"
									} else {
										reRoll = false
										hostile = "character"
									}
									yze.yzeRoll(
										hostile,
										blind,
										reRoll,
										label,
										r1Data,
										game.i18n.localize("ALIENRPG.Black"),
										r2Data,
										game.i18n.localize("ALIENRPG.Yellow"),
										actorid,
										itemid,
									)

									game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six
								}
							} else if (itemData.header.type.value === "2") {
								const fCrew = []
								let options = ""
								for (const [index] of actorData.crew.occupants.entries()) {
									if (actorData.crew.occupants[index].position === "GUNNER") {
										const firer = game.actors.get(actorData.crew.occupants[index].id)
										const fIndex =
											fCrew.push({
												firerName: firer.name,
												firerID: firer.id,
												position: actorData.crew.occupants[index].position,
											}) - 1
										options = options.concat(`<option value="${fIndex}">${firer.name}</option>`)
									}
								}
								if (fCrew.length === 0) {
									return ui.notifications.warn(game.i18n.localize("ALIENRPG.noCrewAssigned"))
								}
								// TODO use proper templates and convert to DialogV2

								const template = `
      <form>
      <div class="form-group">
      <label>${game.i18n.localize("ALIENRPG.SelectFirer")}</label>
      <select id="FirerSelect" name="FirerSelect">${options}</select>
      </div>
       <div class="form-group">
      <label>${game.i18n.localize("ALIENRPG.BaseMod")}</label>
      <input type="text" id="modifier" name="modifier" value="0" autofocus="autofocus" />
      </div>
      <div class="form-group">
      <label>${game.i18n.localize("ALIENRPG.StressMod")}</label>
      <input type="text" id="stressMod" name="stressMod" value="0" autofocus="autofocus" />
      </div>
    
    </form>`
								new Dialog({
									title:
										game.i18n.localize("ALIENRPG.DialTitle1") +
										" " +
										label +
										" " +
										game.i18n.localize("ALIENRPG.DialTitle2"),
									content: template,
									buttons: {
										one: {
											icon: '<i class="fas fa-check"></i>',
											label: game.i18n.localize("ALIENRPG.DialRoll"),
											callback: () => (confirmed = true),
										},
										two: {
											icon: '<i class="fas fa-times"></i>',
											label: game.i18n.localize("ALIENRPG.DialCancel"),
											callback: () => (confirmed = false),
										},
									},
									default: "one",
									close: (html) => {
										if (confirmed) {
											const shooter = Number(html.find("[name=FirerSelect]")[0].value)
											actorid = fCrew[shooter].firerID
											const tactorid = hostile
											const modifier = Number(html.find("[name=modifier]")[0].value)
											const stressMod = Number(html.find("[name=stressMod]")[0].value)
											const aStressVal = Number(game.actors.get(actorid).system.header?.stress?.value || 0)

											const r1Data = Number(
												itemData.attributes.bonus.value +
													modifier +
													game.actors.get(actorid).system.skills.rangedCbt.mod,
											)
											// let r2Data = parseInt(aStressVal + aStressMod + stressMod);
											const r2Data = Number(aStressVal + stressMod)
											label += ` (${this.actor.name}) `
											// label += ` (${fCrew[shooter].firerName}) `;

											if (game.actors.get(actorid).type === "synthetic") {
												reRoll = true
												hostile = "synthetic"
											} else {
												reRoll = false
												hostile = "character"
											}
											yze.yzeRoll(
												hostile,
												blind,
												reRoll,
												label,
												r1Data,
												game.i18n.localize("ALIENRPG.Black"),
												r2Data,
												game.i18n.localize("ALIENRPG.Yellow"),
												actorid,
												itemid,
												tactorid,
											)
											game.alienrpg.rollArr.sCount = game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six
										}
									},
								}).render(true)
							} else {
								console.warn("No type on item")
							}
						}
						break

					default:
						break
				}
			}
			return myReturn
		}
	}
	async rollAmmo(tItem, dataset) {
		const lTemp = "ALIENRPG.Rounds"
		const r1Data = 0
		const item = this.actor.items.get(tItem)
		const label = game.i18n.localize(lTemp) + " " + game.i18n.localize("ALIENRPG.Supply")
		const supplyModifier = 0
		const r2Data = item.system.attributes.rounds.value + supplyModifier

		const reRoll = true
		// let hostile = this.actor.system.type;
		let blind = false
		if (this.actor.token?.disposition === -1) {
			blind = true
		}
		if (r2Data <= 0) {
			return ui.notifications.warn(game.i18n.localize("ALIENRPG.NoSupplys"))
		}
		await yze.yzeRoll(
			"supply",
			blind,
			reRoll,
			label,
			r1Data,
			game.i18n.localize("ALIENRPG.Black"),
			r2Data,
			game.i18n.localize("ALIENRPG.Yellow"),
			this.actor.id,
		)

		if (game.alienrpg.rollArr.r2One) {
			await item.update({
				"system.attributes.rounds.value": item.system.attributes.rounds.value - game.alienrpg.rollArr.r2One,
			})
		}
	}
	async rollComputer(item, dataset) {
		const label = dataset.label + " " + item.name
		let r2Data = 0
		let reRoll = true
		const actorId = item.id
		const blind = false
		const effectiveActorType = "item" // make rolls look human

		if (dataset.roll) {
			const r1Data = Number(dataset.roll || 0) + Number(dataset?.modifier ?? 0)
			reRoll = true
			r2Data = 0
			yze.yzeRoll(
				effectiveActorType,
				blind,
				reRoll,
				label,
				r1Data,
				game.i18n.localize("ALIENRPG.Black"),
				r2Data,
				game.i18n.localize("ALIENRPG.Yellow"),
				actorId,
			)
		}
	}

	async rollComputerMod(item, dataset) {
		let modifier = ""
		const title = `${game.i18n.localize("ALIENRPG.DialTitle1")} ${dataset.label} ${game.i18n.localize("ALIENRPG.DialTitle2")}`

		const content = await foundry.applications.handlebars.renderTemplate(
			"systems/alienrpg/templates/dialog/roll-base-dialog.hbs",
			{ item, dataset },
		)

		const response = await foundry.applications.api.DialogV2.wait({
			window: { title: title },
			content,
			rejectClose: false,
			buttons: [
				{
					label: "ALIENRPG.DialRoll",
					callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object,
				},
				{
					label: "ALIENRPG.DialCancel",
					action: "cancel",
				},
			],
		})
		if (!response || response === "cancel") return "cancelled"
		if (response) {
			modifier = Number(response.modifier)
			dataset.modifier = modifier
			item.rollComputer(item, dataset, response)
		}
	}
}
