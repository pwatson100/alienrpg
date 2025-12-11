export class alienrpgrTableGet extends Actor {
	constructor(options = {}) {
		super(options)
	}

	static rTableget() {
		const folder = game.folders.contents.find((x) => x.name === "Alien Creature Tables")
		// console.log('rTableget -> folder', folder);
		const aTables = folder.contents
		const lTables = {}
		// let lTables = aTables.find((x) => x.name);
		lTables[0] = { key: "None", label: "None" }
		for (let index = 0; index < aTables.length; index++) {
			const counter = index + 1
			lTables[counter] = {
				key: aTables[index].name,
				label: aTables[index].name,
			}
		}
		return lTables
	}

	static cTableget() {
		const folder = game.folders.contents.find((x) => x.name === "Alien Mother Tables")
		// console.log('rTableget -> folder', folder);

		const aTables = folder.contents.filter((x) => x.name.startsWith("Critical Injuries"))
		const lTables = {}

		lTables[0] = { key: "None", label: "None" }
		for (let index = 0; index < aTables.length; index++) {
			const counter = index + 1
			lTables[counter] = {
				key: aTables[index].name,
				label: aTables[index].name,
			}
		}
		return lTables
	}
}
