import alienrpgItemBase from "./base-item.mjs"

export default class alienrpgWeapon extends alienrpgItemBase {
	static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "ALIENRPG.Weapon"]
	static defineSchema() {
		const fields = foundry.data.fields
		const requiredInteger = { required: true, nullable: false, integer: true }
		const schema = alienrpgItemBase.defineSchema()

		schema.attributes = new fields.SchemaField({
			weight: new fields.SchemaField({
				value: new fields.NumberField({
					required: true,
					nullable: false,
					initial: 0,
					min: 0,
				}),
			}),
			cost: new fields.SchemaField({
				value: new fields.StringField({
					required: true,
					blank: true,
					initial: "0",
				}),
			}),
			bonus: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
				}),
			}),
			damage: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
			}),
			range: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
			}),
			minrange: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
			}),
			rounds: new fields.SchemaField({
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
			quantity: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
			}),
			class: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
			comment: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
			notes: new fields.SchemaField({
				notes: new fields.StringField({ required: true, blank: true }),
			}),
		})
		schema.header = new fields.SchemaField({
			type: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
			active: new fields.StringField({ required: true, initial: "false" }),
			armorpiercing: new fields.BooleanField({ initial: false }),
			fullauto: new fields.BooleanField({ initial: false }),
		})

		return schema
	}
	prepareDerivedData() {
		// Loop through ability scores, and add their modifiers to our sheet output.
		// for (const key in this.modifiers.attributes) {
		// 	this.modifiers.attributes[key].label = game.i18n.localize(CONFIG.ALIENRPG.modifiers[key]) ?? key;
		// }
		// for (
		// const key in this.modifiers.skills) {
		// 	this.modifiers.skills[key].label = game.i18n.localize(CONFIG.ALIENRPG.skills[key].name) ?? key;
		// 	this.modifiers.skills[key].ability = game.i18n.localize(CONFIG.ALIENRPG.skills[key].attrib) ?? key;
		// }
	}

	getRollData() {
		const data = {}

		// Copy the ability scores to the top level, so that rolls can use
		// formulas like `@str.mod + 4`.
		// if (this.attributes) {
		// 	for (let [k, v] of Object.entries(this.attributes)) {
		// 		data[k] = foundry.utils.deepClone(v);
		// 	}
		// }

		return data
	}
}
