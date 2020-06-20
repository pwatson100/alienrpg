(async () => {
  let hostile = false;
  let label = 'Player';
  let reRoll = false;
  let blind = false;

  let template = `
        <form>
        <label>Ensure player token is selected.</label>
            <div class="form-group">
                <label>How Many Base Die?</label>
                <input type="text" id="fr1Data" value=1>
            </div>
            <div class="form-group">
                <label>How Many Stress Dice?</label>
                <input type="text" id="fr2Data" value=0>
            </div>
   
        </form>`;

  let buttons = {};
  // if (game.tables.entities.length > 0) {
  buttons = {
    draw: {
      icon: '<i class="fas fa-check"></i>',
      label: 'Draw',
      callback: async (html) => {
        // const tableId = html.find('#tableSelect')[0].value
        // const table = game.tables.get(tableId);
        const r1Data = html.find('#fr1Data')[0].value;
        const r2Data = html.find('#fr2Data')[0].value;

        await game.alienrpg.yze.yzeRoll(hostile, blind, reRoll, label, r1Data, 'Black', r2Data, 'Stress');
      },
    },
    cancel: {
      icon: '<i class="fas fa-times"></i>',
      label: 'Cancel',
    },
  };

  new Dialog({
    title: 'Player - Roll YZE Dice.',
    content: template,
    buttons: buttons,
    default: 'draw',
  }).render(true);
})();
