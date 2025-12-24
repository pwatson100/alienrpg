import alienrpgActorBase from "./base-actor.mjs"

export default class alienrpgCharacter extends alienrpgActorBase {
	static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "ALIENRPG.Actor.Character"]

	static defineSchema() {
		const fields = foundry.data.fields
		const requiredInteger = { required: true, nullable: false, integer: true }
		const schema = alienrpgActorBase.defineSchema()

		// header
		schema.header = new fields.SchemaField({
			health: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
				max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				mod: new fields.NumberField({ ...requiredInteger, initial: 0 }),
				calculatedMax: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
				label: new fields.StringField({
					required: true,
					blank: true,
					initial: "ALIENRPG.Health",
				}),
			}),
			stress: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
				max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
				mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				label: new fields.StringField({
					required: true,
					blank: true,
					initial: "ALIENRPG.Stress",
				}),
			}),
			resolve: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
				max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
				mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				label: new fields.StringField({
					required: true,
					blank: true,
					initial: "ALIENRPG.Resolve",
				}),
			}),
			npc: new fields.BooleanField({ initial: false }),
		})

		// attributes
		schema.attributes = new fields.SchemaField(
			Object.keys(CONFIG.ALIENRPG.attributes).reduce((obj, attribute) => {
				obj[attribute] = new fields.SchemaField({
					value: new fields.NumberField({
						...requiredInteger,
						initial: 0,
						min: 0,
					}),
					mod: new fields.NumberField({ ...requiredInteger, initial: 0 }),
					max: new fields.NumberField({
						...requiredInteger,
						initial: 0,
						min: 0,
					}),
					label: new fields.StringField({ required: true, blank: true }),
				})
				return obj
			}, {}),
		)

		// Skills
		schema.skills = new fields.SchemaField(
			Object.keys(CONFIG.ALIENRPG.skills).reduce((obj, skills) => {
				obj[skills] = new fields.SchemaField({
					value: new fields.NumberField({
						...requiredInteger,
						initial: 0,
						min: 0,
					}),
					mod: new fields.NumberField({ ...requiredInteger, initial: 0 }),
					max: new fields.NumberField({
						...requiredInteger,
						initial: 0,
						min: 0,
					}),
					label: new fields.StringField({ required: true, blank: true }),
					attrib: new fields.StringField({ required: true, blank: true }),
					description: new fields.StringField({ required: true, blank: true }),
				})
				return obj
			}, {}),
		)

		// // general
		schema.general = new fields.SchemaField({
			career: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
			encumbrance: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
				max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				pct: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				encumbered: new fields.BooleanField({ initial: false }),
			}),
			appearance: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
			sigItem: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
			agenda: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
			relOne: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
			relTwo: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
			xp: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
					max: 25,
				}),
				max: new fields.NumberField({
					...requiredInteger,
					initial: 25,
					min: 0,
				}),
			}),
			sp: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
					max: 3,
				}),
				max: new fields.NumberField({ ...requiredInteger, initial: 3, min: 0 }),
			}),
			radiation: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
					max: 10,
				}),
				max: new fields.NumberField({
					...requiredInteger,
					initial: 10,
					min: 0,
				}),
				permanent: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
				calculatedMax: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
			}),
			starving: new fields.BooleanField({ initial: false }),
			dehydrated: new fields.BooleanField({ initial: false }),
			exhausted: new fields.BooleanField({ initial: false }),
			freezing: new fields.BooleanField({ initial: false }),
			hypoxia: new fields.BooleanField({ initial: false }),
			gravitydyspraxia: new fields.BooleanField({ initial: false }),
			overwatch: new fields.BooleanField({ initial: false }),

			// Alien Enhanced Status
			fatigued: new fields.BooleanField({ initial: false }),

			jumpy: new fields.BooleanField({ initial: false }),
			tunnelvision: new fields.BooleanField({ initial: false }),
			aggravated: new fields.BooleanField({ initial: false }),
			shakes: new fields.BooleanField({ initial: false }),
			frantic: new fields.BooleanField({ initial: false }),
			deflated: new fields.BooleanField({ initial: false }),

			paranoid: new fields.BooleanField({ initial: false }),
			hesitant: new fields.BooleanField({ initial: false }),
			freeze: new fields.BooleanField({ initial: false }),
			seekcover: new fields.BooleanField({ initial: false }),
			scream: new fields.BooleanField({ initial: false }),
			flee: new fields.BooleanField({ initial: false }),
			frenzy: new fields.BooleanField({ initial: false }),
			catatonic: new fields.BooleanField({ initial: false }),

			critInj: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
			}),
			armor: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
					max: 10,
				}),
			}),
			panic: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
				lastRoll: new fields.NumberField({
					...requiredInteger,
					initial: -1,
				}),
			}),
			addpanic: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 1,
					min: 0,
				}),
			}),
			stressresponse: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: -1,
				}),
			}),
			cash: new fields.SchemaField({
				value: new fields.StringField({ required: true, initial: "0" }),
			}),
		})
		// // consumables
		schema.consumables = new fields.SchemaField({
			air: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
			}),
			power: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
			}),
			food: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
			}),
			water: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
			}),
		})

		schema.adhocitems = new fields.HTMLField()

		return schema
	}

	prepareDerivedData() {
		var attrMod = {
			str: 0,
			agl: 0,
			emp: 0,
			wit: 0,
			health: 0,
			stress: 0,
			resolve: 0,
		}

		var sklMod = {
			heavyMach: 0,
			closeCbt: 0,
			stamina: 0,
			rangedCbt: 0,
			mobility: 0,
			piloting: 0,
			command: 0,
			manipulation: 0,
			medicalAid: 0,
			observation: 0,
			survival: 0,
			comtech: 0,
		}
		let totalAc = 0
		let totalWat = 0
		let totalFood = 0
		let totalAir = 0
		let totalPower = 0
		let myCrit = 0

		for (const [skey, Attrib] of Object.entries(this.parent.items.contents)) {
			if (Attrib.system.attributes?.armorrating?.value && Attrib.system.header.active === "true") {
				Attrib.system.attributes.armorrating.value = Attrib.system.attributes.armorrating.value || 0
				Attrib.totalAc = Number(Attrib.system.attributes.armorrating.value, 10)
				totalAc += Attrib.totalAc
			}
			if (Attrib.system.attributes?.water?.value && Attrib.system.header.active === "true") {
				Attrib.system.attributes.water.value = Attrib.system.attributes.water.value || 0
				Attrib.totalWat = Number(Attrib.system.attributes.water.value, 10)
				totalWat += Attrib.totalWat
			}
			if (Attrib.system.attributes?.food?.value && Attrib.system.header.active === "true") {
				Attrib.system.attributes.food.value = Attrib.system.attributes.food.value || 0
				Attrib.totalFood = Number(Attrib.system.attributes.food.value, 10)
				totalFood += Attrib.totalFood
			}
			if (Attrib.system.attributes?.airsupply?.value && Attrib.system.header.active === "true") {
				Attrib.system.attributes.airsupply.value = Attrib.system.attributes.airsupply.value || 0
				Attrib.totalAir = Number(Attrib.system.attributes.airsupply.value, 10)
				totalAir += Attrib.totalAir
			}
			if (Attrib.system.attributes?.power?.value && Attrib.system.header.active === "true") {
				Attrib.system.attributes.power.value = Attrib.system.attributes.power.value || 0
				Attrib.totalPower = Number(Attrib.system.attributes.power.value, 10)
				totalPower += Attrib.totalPower
			}

			if (Attrib.type === "item" || Attrib.type === "critical-injury" || Attrib.type === "armor") {
				if (Attrib.system.header.active === "true") {
					const base = Attrib.system.modifiers.attributes
					for (const [bkey, aAttrib] of Object.entries(base)) {
						switch (bkey) {
							case "str":
								attrMod.str = attrMod.str += Number(aAttrib.value)
								break
							case "agl":
								attrMod.agl = attrMod.agl += Number(aAttrib.value)
								break
							case "emp":
								attrMod.emp = attrMod.emp += Number(aAttrib.value)
								break
							case "wit":
								attrMod.wit = attrMod.wit += Number(aAttrib.value)
								break
							case "health":
								attrMod.health = attrMod.health += Number(aAttrib.value)
								break
							case "stress":
								attrMod.stress = attrMod.stress += Number(aAttrib.value)
								break

							default:
								break
						}
					}

					const skillBase = Attrib.system.modifiers.skills
					for (const [skkey, sAttrib] of Object.entries(skillBase)) {
						switch (skkey) {
							case "heavyMach":
								sklMod.heavyMach = sklMod.heavyMach += Number(sAttrib.value)
								break
							case "closeCbt":
								sklMod.closeCbt = sklMod.closeCbt += Number(sAttrib.value)
								break
							case "stamina":
								sklMod.stamina = sklMod.stamina += Number(sAttrib.value)
								break
							case "rangedCbt":
								sklMod.rangedCbt = sklMod.rangedCbt += Number(sAttrib.value)
								break
							case "mobility":
								sklMod.mobility = sklMod.mobility += Number(sAttrib.value)
								break
							case "piloting":
								sklMod.piloting = sklMod.piloting += Number(sAttrib.value)
								break
							case "command":
								sklMod.command = sklMod.command += Number(sAttrib.value)
								break
							case "manipulation":
								sklMod.manipulation = sklMod.manipulation += Number(sAttrib.value)
								break
							case "medicalAid":
								sklMod.medicalAid = sklMod.medicalAid += Number(sAttrib.value)
								break
							case "observation":
								sklMod.observation = sklMod.observation += Number(sAttrib.value)
								break
							case "survival":
								sklMod.survival = sklMod.survival += Number(sAttrib.value)
								break
							case "comtech":
								sklMod.comtech = sklMod.comtech += Number(sAttrib.value)
								break

							default:
								break
						}
					}
				}
				if (Attrib.type === "critical-injury") {
					myCrit++
					console.log(myCrit)
				}
			}

			if (Attrib.type === "talent" && Attrib.name.toUpperCase() === "NERVES OF STEEL") {
				attrMod.stress = attrMod.stress += -2
			}

			if (
				Attrib.type === "talent" &&
				Attrib.name.toUpperCase() === "TAKE CONTROL" &&
				this.attributes.wit.value > this.attributes.emp.value
			) {
				this.skills.manipulation.ability = "wit"
			}

			if (Attrib.type === "talent" && Attrib.name.toUpperCase() === "TOUGH") {
				attrMod.health = attrMod.health += 2
			}

			if (
				Attrib.type === "talent" &&
				Attrib.name.toUpperCase() === "STOIC" &&
				this.attributes.wit.value > this.attributes.str.value
			) {
				this.skills.stamina.ability = "wit"
			}
		}

		for (const abl in this.attributes) {
			// for (let [a, abl] of Object.entries(this.attributes)) {
			const upData = Number(this.attributes[abl].value || 0) + Number(attrMod[abl] || 0)
			this.attributes[abl].mod = upData
			this.attributes[abl].label = game.i18n.localize(CONFIG.ALIENRPG.attributes[abl]) ?? abl
		}

		for (const skl in this.skills) {
			// for (let [s, skl] of Object.entries(this.skills)) {
			this.skills[skl].label = game.i18n.localize(CONFIG.ALIENRPG.skills[skl].nam) ?? skl
			this.skills[skl].attrib = game.i18n.localize(CONFIG.ALIENRPG.skills[skl].attrib) ?? skl
			this.skills[skl].description = game.i18n.localize(CONFIG.ALIENRPG.skills[skl].name) ?? skl
			const conSkl = this.skills[skl].attrib
			const upData =
				Number(this.skills[skl].value || 0) + Number(this.attributes[conSkl].mod || 0) + Number(sklMod[skl] || 0)
			this.skills[skl].mod = upData
		}

		this.header.health.mod = this.header.health.mod = Number(attrMod.health || 0)
		if (game.settings.get("alienrpg", "evolved")) {
			this.header.health.max =
				Math.round((this.attributes.str.value + this.attributes.agl.value) / 2) + this.header.health.mod
			this.header.health.calculatedMax =
				Math.round((this.attributes.str.mod + this.attributes.agl.mod) / 2) + this.header.health.mod
			this.header.resolve.mod = this.header.resolve.mod = Number(attrMod.resolve || 0)
			this.header.resolve.value =
				Math.round((this.attributes.wit.value + this.attributes.emp.value) / 2) + this.header.resolve.mod
			this.header.resolve.calculatedMax =
				Math.round((this.attributes.wit.mod + this.attributes.emp.mod) / 2) + this.header.resolve.mod
		} else {
			this.header.health.max = this.attributes.str.value + this.header.health.mod
			this.header.health.calculatedMax = this.attributes.str.mod + this.header.health.mod
		}
		this.general.radiation.calculatedMax =
			Number(this.general.radiation.max - (this.general.radiation.permanent ?? 0)) || 0
		this.consumables.water.value = this.consumables.water.value = Number(totalWat || 0)
		this.consumables.food.value = this.consumables.food.value = Number(totalFood || 0)
		this.consumables.air.value = this.consumables.air.value = Number(totalAir || 0)
		this.consumables.power.value = this.consumables.power.value = Number(totalPower || 0)
		this.general.armor.value = this.general.armor.value = Number(totalAc || 0)

		this.RADmax = this.general.radiation.max || 0
		this.RADcurrent = this.general.radiation.value
		this.RADfill = this.RADmax - this.general.radiation.calculatedMax || 0
		this.RADlost = this.RADmax - this.RADcurrent - this.RADfill || 0
		//
		this.XPmax = this.general.xp.max || 0
		this.XPcurrent = this.general.xp.value
		this.XPlost = this.XPmax - this.XPcurrent
		this.XPfill = this.XPmax < 25 ? 25 - this.XPmax : 0
		//
		this.SPmax = this.general.sp.max || 0
		this.SPcurrent = this.general.sp.value
		this.SPlost = this.SPmax - this.SPcurrent
		this.SPfill = this.SPmax < 3 ? 3 - this.SPmax : 0

		if (this.parent.type === "character") {
			this.header.stress.mod = this.header.stress.mod + Number(attrMod.stress || 0)
			this.general.critInj.value = myCrit
		}
	}

	getRollData() {
		const data = {}

		// Copy the ability scores to the top level, so that rolls can use
		// formulas like `@str.mod + 4`.
		if (this.attributes) {
			for (const [k, v] of Object.entries(this.attributes)) {
				data[k] = foundry.utils.deepClone(v)
			}
		}
		if (this.skills) {
			for (const [k, v] of Object.entries(this.skills)) {
				data[k] = foundry.utils.deepClone(v)
			}
		}
		// if (this.general) {
		// 	for (let [k, v] of Object.entries(this.general)) {
		// 		data[k] = foundry.utils.deepClone(v);
		// 	}
		// }

		return data
	}
}
