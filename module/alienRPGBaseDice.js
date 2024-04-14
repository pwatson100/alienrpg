export class AlienRPGBaseDie extends Die {
	constructor(termData) {
		termData.faces = 6;
		super(termData);
	}

	/* -------------------------------------------- */

	/** @override */
	static DENOMINATION = 'b';

	/** @override */
	get total() {
		return this.results.length;
	}

	/* -------------------------------------------- */

	/** @override */
	getResultLabel(result) {
		return {
			1: '<img src="systems/alienrpg/ui/DsN/alien-dice-b0.png" />',
			2: '<img src="systems/alienrpg/ui/DsN/alien-dice-b0.png" />',
			3: '<img src="systems/alienrpg/ui/DsN/alien-dice-b0.png" />',
			4: '<img src="systems/alienrpg/ui/DsN/alien-dice-b0.png" />',
			5: '<img src="systems/alienrpg/ui/DsN/alien-dice-b0.png" />',
			6: '<img src="systems/alienrpg/ui/DsN/alien-dice-b6.png" />',
		}[result.result];
	}
}
export class AlienRPGStressDie extends Die {
	constructor(termData) {
		termData.faces = 6;
		super(termData);
	}

	/* -------------------------------------------- */

	/** @override */
	static DENOMINATION = 's';

	/** @override */
	get total() {
		return this.results.length;
	}

	/* -------------------------------------------- */

	/** @override */
	getResultLabel(result) {
		return {
			1: '<img src="systems/alienrpg/ui/DsN/alien-dice-y1.png" />',
			2: '<img src="systems/alienrpg/ui/DsN/alien-dice-y0.png" />',
			3: '<img src="systems/alienrpg/ui/DsN/alien-dice-y0.png" />',
			4: '<img src="systems/alienrpg/ui/DsN/alien-dice-y0.png" />',
			5: '<img src="systems/alienrpg/ui/DsN/alien-dice-y0.png" />',
			6: '<img src="systems/alienrpg/ui/DsN/alien-dice-y6.png" />',
		}[result.result];
	}
}
