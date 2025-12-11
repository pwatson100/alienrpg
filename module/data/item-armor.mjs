import alienrpgItemBase from "./base-item.mjs"

export default class alienrpgArmor extends alienrpgItemBase {
	static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "ALIENRPG.Item"]
	static defineSchema() {
		const fields = foundry.data.fields
		const requiredInteger = { required: true, nullable: false, integer: true }
		const schema = alienrpgItemBase.defineSchema()

		schema.header = new fields.SchemaField({
			active: new fields.StringField({ required: true, initial: "false" }),
		})

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
			armorrating: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
			}),
			airsupply: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
			}),
			comment: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
		})

		schema.general = new fields.SchemaField({
			comment: new fields.SchemaField({
				value: new fields.HTMLField(),
			}),
		})

		return schema
	}
	prepareDerivedData() {}

	getRollData() {
		const data = {}

		return data
	}
}
