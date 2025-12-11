export class alienrpgrTableGet extends Actor {
	constructor(options = {}) {
		super(options);
	}

	static rTableget() {
		let folder = game.folders.contents.find((x) => x.name === 'Alien Creature Tables');
		// console.log('rTableget -> folder', folder);
		let aTables = folder.contents;
		let lTables = {};
		// let lTables = aTables.find((x) => x.name);
		lTables[0] = { key: 'None', label: 'None' };
		for (let index = 0; index < aTables.length; index++) {
			let counter = index + 1;
			lTables[counter] = { key: aTables[index].name, label: aTables[index].name };
		}
		return lTables;
	}

	static cTableget() {
		let folder = game.folders.contents.find((x) => x.name === 'Alien Mother Tables');
		// console.log('rTableget -> folder', folder);

		let aTables = folder.contents.filter((x) => x.name.startsWith('Critical Injuries'));
		let lTables = {};

		lTables[0] = { key: 'None', label: 'None' };
		for (let index = 0; index < aTables.length; index++) {
			let counter = index + 1;
			lTables[counter] = { key: aTables[index].name, label: aTables[index].name };
		}
		return lTables;
	}
}
