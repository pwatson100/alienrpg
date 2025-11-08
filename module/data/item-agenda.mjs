import alienrpgItemBase from "./base-item.mjs"

export default class alienrpgAgenda extends alienrpgItemBase {
	static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "ALIENRPG.Item"]
	static defineSchema() {
		const fields = foundry.data.fields
		const requiredInteger = { required: true, nullable: false, integer: true }
		const schema = alienrpgItemBase.defineSchema()

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
