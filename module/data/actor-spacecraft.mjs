import alienrpgActorBase from "./base-actor.mjs"

export default class alienrpgSpacecraft extends alienrpgActorBase {
	static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "ALIENRPG.Actor.Spacecraft"]

	static defineSchema() {
		const fields = foundry.data.fields
		const requiredInteger = { required: true, nullable: false, integer: true }
		const schema = alienrpgActorBase.defineSchema()

		// header
		schema.header = new fields.SchemaField({
			type: new fields.SchemaField({
				value: new fields.StringField({ required: false, blank: true }),
				label: new fields.StringField({ required: false, blank: true }),
			}),
		})

		// attributes

		schema.attributes = new fields.SchemaField({
			manufacturer: new fields.StringField({ required: true, blank: true }),
			model: new fields.StringField({ required: true, blank: true }),
			modules: new fields.StringField({ required: true, blank: true }),
			armaments: new fields.StringField({ required: true, blank: true }),
			ai: new fields.StringField({ required: true, blank: true }),

			crew: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
			}),
			passengers: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
			}),
			length: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
			}),
			ftlrating: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
			}),
			signature: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
			}),
			thrusters: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
			}),
			hull: new fields.SchemaField({
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
			damage: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
					max: 20,
				}),
			}),

			leasecost: new fields.SchemaField({
				value: new fields.StringField({
					required: true,
					blank: true,
					initial: "0",
				}),
			}),
		})

		schema.general = new fields.SchemaField({
			misc: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
		})
		schema.notes = new fields.SchemaField({
			notes: new fields.StringField({ required: true, blank: true }),
		})

		schema.crew = new fields.SchemaField({
			occupants: new fields.ArrayField(
				new fields.SchemaField({
					id: new fields.StringField({ required: true }),
					position: new fields.StringField({ required: true }),
				}),
			),
			passengerQty: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
		})

		return schema
	}

	prepareDerivedData() {
		// Loop through ability scores, and add their modifiers to our sheet output.
		// for (const key in this.attributes) {
		// 	this.attributes[key].label = game.i18n.localize(CONFIG.ALIENRPG.vehicleattributes[key]) ?? key
		// }

		this.attributes.damage.max = this.attributes.hull.value
		this.DAMmax = this.attributes.damage.max
		this.DAMcurrent = this.attributes.damage.value
		this.DAMlost = this.DAMmax - this.DAMcurrent
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

		return data
	}
}
