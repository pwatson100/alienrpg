import alienrpgActorBase from "./base-actor.mjs"

export default class alienrpgVehicle extends alienrpgActorBase {
	static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "ALIENRPG.Actor.Vehicle"]

	static defineSchema() {
		const fields = foundry.data.fields
		const requiredInteger = { required: true, nullable: false, integer: true }
		const schema = alienrpgActorBase.defineSchema()

		// header
		schema.header = new fields.SchemaField({
			type: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
				label: new fields.StringField({ required: true, blank: true }),
			}),
		})

		// attributes
		schema.attributes = new fields.SchemaField(
			Object.keys(CONFIG.ALIENRPG.vehicleattributes).reduce((obj, attribute) => {
				obj[attribute] = new fields.SchemaField({
					value: new fields.NumberField({
						...requiredInteger,
						initial: 0,
						min: 0,
					}),
					label: new fields.StringField({ required: true, blank: true }),
				})
				return obj
			}, {}),
		)
		schema.attributes = new fields.SchemaField({
			comment: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
		})

		schema.attributes = new fields.SchemaField({
			weight: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
				label: new fields.StringField({ required: true, initial: "Ranged Combat" }),
			}),
			cost: new fields.SchemaField({
				value: new fields.StringField({
					required: true,
					blank: true,
					initial: "0",
				}),
				label: new fields.StringField({ required: true, initial: "Ranged Combat" }),
			}),
			armorrating: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
					max: 10,
				}),
				label: new fields.StringField({ required: true, initial: "Ranged Combat" }),
			}),
			hull: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
				max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 10 }),

				label: new fields.StringField({ required: true, initial: "Ranged Combat" }),
			}),
			passengers: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
				label: new fields.StringField({ required: true, initial: "Ranged Combat" }),
			}),
			speed: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
				label: new fields.StringField({ required: true, initial: "Ranged Combat" }),
			}),
			manoeuvrability: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
				label: new fields.StringField({ required: true, initial: "Ranged Combat" }),
			}),
			comment: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
				label: new fields.StringField({ required: true, blank: true }),
			}),
		})

		schema.modifiers = new fields.SchemaField({
			gunnerName: new fields.StringField({ required: true, blank: true }),
			rangedCbt: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
				label: new fields.StringField({ required: true, initial: "Ranged Combat" }),
				ability: new fields.StringField({ required: true, initial: "agl" }),
			}),
			pilotName: new fields.StringField({ required: true, blank: true }),
			piloting: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
				label: new fields.StringField({ required: true, initial: "Piloting" }),
				ability: new fields.StringField({ required: true, initial: "agl" }),
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
		for (const key in this.attributes) {
			this.attributes[key].label = game.i18n.localize(CONFIG.ALIENRPG.vehicleattributes[key]) ?? key
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

		return data
	}
}
