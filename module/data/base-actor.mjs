export default class alienrpgActorBase extends foundry.abstract.TypeDataModel {
	static LOCALIZATION_PREFIXES = ["ALIENRPG.Actor.base"]

	static defineSchema() {
		const fields = foundry.data.fields
		const requiredInteger = { required: true, nullable: false, integer: true }
		const schema = {}

		// schema.biography = new fields.HTMLField();
		schema.notes = new fields.HTMLField()

		return schema
	}
}
