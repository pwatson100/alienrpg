(async () => {
	if (!modroll) {
		await myroller(0);
		return;
	} else {
		let template = `
		<form>
		<div class="form-group">
		<label>Modifier</label>
		<input type="text" id="fr1Data" value=1>
		</div>
		</form>`;

		let buttons = {};
		buttons = {
			draw: {
				icon: '<i class="fas fa-check"></i>',
				label: `ROLL`,
				callback: async (html) => {
					const r1Data = parseInt(html.find('#fr1Data')[0].value || 0);
					await myroller(r1Data);
				},
			},
			cancel: {
				icon: '<i class="fas fa-times"></i>',
				label: `CANCEL`,
			},
		};

		new Dialog({
			title: 'Roll Modifier',
			content: template,
			buttons: buttons,
			default: 'draw',
		}).render(true);
	}

	async function myroller(modifier) {
		let rolledDice = stat + modifier;
		let remainingdice = 0;
		let count = 0;
		let sixes = 0;
		let ones = 0;
		let html = '';

		if (rolledDice <= 0) {
			ui.notifications.warn('Roll is <= 0');
			return;
		}
		let roll1 = new Roll(`${rolledDice}` + 'd6').evaluate({ async: false });
		// console.log(roll1.dice[0].results);
		roll1.dice[0].results.forEach((j) => {
			switch (j.result) {
				case 6:
					{
						sixes++;
						count++;
					}
					break;
				case 1:
					{
						ones++;
						count++;
					}
					break;
				default:
					break;
			}
		});

		remainingdice = rolledDice - count;

		html = `<table>
		<caption>Custom Roll</caption>
		<tr>
		<td>You rolled ${count} successes.</td>
		</tr>
		<tr>
		<td>${sixes} Sixes</td>
		</tr>
		<tr>
		<td>${ones} Ones.</td>
		</tr>
		<tr>
		<td>${remainingdice} Remaining Dice.</td>
		</tr>
		<table> `;

		await ChatMessage.create({
			rolls: [roll1],
			type: CONST.CHAT_MESSAGE_TYPES.ROLL,
		});
		// console.log(roll1.dice[0].results);
		await ChatMessage.create({
			content: html,
			type: CONST.CHAT_MESSAGE_TYPES.ROLL,
		});
	}
})();

// THOMAS' VERSION
(async () => {
	if (!modroll) {
		await myroller(0);
		return;
	} else {
		let template = `
			<form>
			<div class="form-group">
			<label>Modifier</label>
			<input type="text" id="fr1Data" value=0>
			</div>
			</form>`;

		let buttons = {};
		buttons = {
			draw: {
				icon: '<i class="fas fa-check"></i>',
				label: `ROLL`,
				callback: async (html) => {
					const r1Data = parseInt(html.find('#fr1Data')[0].value || 0);
					await myroller(r1Data);
				},
			},
			cancel: {
				icon: '<i class="fas fa-times"></i>',
				label: `CANCEL`,
			},
		};

		new Dialog({
			title: 'Roll Modifier',
			content: template,
			buttons: buttons,
			default: 'draw',
		}).render(true);
	}

	async function myroller(modifier) {
		let rolledDice = stat + modifier;
		let remainingdice = 0;
		let count = 0;
		let sixes = 0;
		let ones = 0;
		let html = '';
		let roll1 = new Roll(`max(${rolledDice},0)` + 'd6').evaluate({ async: false });
		// console.log(roll1.dice[0].results);
		roll1.dice[0].results.forEach((j) => {
			switch (j.result) {
				case 6:
					{
						sixes++;
						count++;
					}
					break;
				case 1:
					{
						ones++;
						count++;
					}
					break;
				default:
					break;
			}
		});

		remainingdice = rolledDice - count;

		html = `<table>
			<caption>Roll Results</caption>
			<tr>
			<td> Total Dice Pool: <B>${rolledDice}</B> </td> 
			</tr>
<tr>
<td>Available to to Push: <B>${remainingdice}</B></td>
</tr>
<tr>
<td>Successes: <B>${sixes}</B> </td>
</tr>
			<tr>
			<td>Potential Fubar: <B>${ones}</B> </td>
			</tr>
			<table> `;

		await ChatMessage.create({
			rolls: [roll1],
			type: CONST.CHAT_MESSAGE_TYPES.ROLL,
		});
		// console.log(roll1.dice[0].results);
		await ChatMessage.create({
			content: html,
			type: CONST.CHAT_MESSAGE_TYPES.ROLL,
		});
	}
})();
