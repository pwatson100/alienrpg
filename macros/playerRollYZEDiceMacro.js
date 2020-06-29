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
  buttons = {
    draw: {
      icon: '<i class="fas fa-check"></i>',
      label: 'Roll',
      callback: async (html) => {
        const r1Data = parseInt(html.find('#fr1Data')[0].value || 0);
        const r2Data = parseInt(html.find('#fr2Data')[0].value || 0);

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
    default: 'roll',
  }).render(true);
})();
