import alienrpgActorBase from "./base-actor.mjs"

export default class alienrpgTerritory extends alienrpgActorBase {
	static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "ALIENRPG.Actor.Territory"]

	static defineSchema() {
		const fields = foundry.data.fields
		// const requiredInteger = { required: true, nullable: false, integer: true }
		const schema = alienrpgActorBase.defineSchema()

		// header
		schema.header = new fields.SchemaField({
			type: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
				label: new fields.StringField({ required: true, blank: true }),
			}),
		})

		schema.sectors = new fields.SchemaField({
			value: new fields.StringField({ required: true, blank: true }),
			label: new fields.StringField({ required: true, blank: true }),
		})
		schema.comment = new fields.SchemaField({
			value: new fields.StringField({ required: true, blank: true }),
			label: new fields.StringField({ required: true, blank: true }),
		})

		return schema
	}

	prepareDerivedData() {
		// Loop through ability scores, and add their modifiers to our sheet output.
	}
	getRollData() {}
}
