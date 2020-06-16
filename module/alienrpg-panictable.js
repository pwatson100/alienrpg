export async function createPanicTable(folderid) {
  let panicTable = game.tables.getName('Panic Table');
  // console.warn('panicT folderid', folderid);

  //If the table doesn't exist, create it
  if (!panicTable) {
    const createData = [
      {
        type: 0,
        text: '<b>KEEPING IT TOGETHER:</b> You manage to keep your nerves in check. Barely.',
        img: 'icons/svg/d20-black.svg',
        weight: 1,
        range: [1, 6],
      },
      {
        type: 0,
        text: '<b>NERVOUS TWITCH:</b>  Your STRESS LEVEL, and the STRESS LEVEL of all friendly PCs in SHORT range of you, increases by one.',
        img: 'icons/svg/d20-black.svg',
        weight: 1,
        range: [7, 7],
      },
      {
        type: 0,
        text: '<b>TREMBLE:</b>  You start to tremble uncontrollably. All skill rolls using AGILITY suffer a –2 modification until your panic stops.',
        img: 'icons/svg/d20-black.svg',
        weight: 1,
        range: [8, 8],
      },
      {
        type: 0,
        text:
          '<b>DROP ITEM:</b>  Whether by stress, confusion or the realization that you’re all going to die anyway, you drop a weapon or other important item—the GM decides which one. Your STRESS LEVEL increases by one.',
        img: 'icons/svg/d20-black.svg',
        weight: 1,
        range: [9, 9],
      },
      {
        type: 0,
        text:
          '<b>FREEZE:</b>  You’re frozen by fear or stress for one Round, losing your next slow action. Your STRESS LEVEL, and the STRESS LEVEL of all friendly PCs in SHORT range of you, increases by one',
        img: 'icons/svg/d20-black.svg',
        weight: 1,
        range: [10, 10],
      },
      {
        type: 0,
        text:
          '<b>SEEK COVER:</b>  You must use your next action to move away from danger and find a safe spot if possible. You are allowed to make a retreat roll (see page 93) if you have an enemy at ENGAGED range. Your STRESS LEVEL is decreased by one, but the STRESS LEVEL of all friendly PCs in SHORT range increases by one. After one Round, you can act normally.',
        img: 'icons/svg/d20-black.svg',
        weight: 1,
        range: [11, 11],
      },
      {
        type: 0,
        text:
          '<b>SCREAM:</b> You scream your lungs out for one Round, losing your next slow action. Your STRESS LEVEL is decreased by one, but every friendly character who hears your scream must make an immediate Panic Roll.',
        img: 'icons/svg/d20-black.svg',
        weight: 1,
        range: [12, 12],
      },
      {
        type: 0,
        text:
          '<b>FLEE:</b>  You just can’t take it anymore. You must flee to a safe place and refuse to leave it. You won’t attack anyone and won’t attempt anything dangerous. You are not allowed to make a retreat roll (see page 93) if you have an enemy at ENGAGED range when you flee. Your STRESS LEVEL is decreased by one, but every friendly character who sees you run must make an immediate Panic Roll.',
        img: 'icons/svg/d20-black.svg',
        weight: 1,
        range: [13, 13],
      },
      {
        type: 0,
        text:
          '<b>BERSERK:</b>  You must immediately attack the nearest person or creature, friendly or not. You won’t stop until you or the target is Broken. Every friendly character who witnesses your rampage must make an immediate Panic Roll',
        img: 'icons/svg/d20-black.svg',
        weight: 1,
        range: [14, 14],
      },
      {
        type: 0,
        text: '<b>CATATONIC:</b>  You collapse to the floor and can’t talk or move, staring blankly into oblivion.',
        img: 'icons/svg/d20-black.svg',
        weight: 1,
        range: [15, 20],
      },
    ];

    const tableData = {
      name: 'Panic Table',
      folder: folderid,
      replacement: true,
      displayRoll: true,
      description: '',
      sort: 100001,
      formula: '1d6',
    };
    const tableOptions = { temporary: false, renderSheet: false };

    // let folder = game.folders.entities[4];
    // var tables = game.packs.get('world.alien-tables');
    // console.warn('tables', folderid, tables);
    // tables.getContent().then((d) =>
    //   d.forEach((a) => {
    //     RollTable.create(a.data, { folderid });
    //   })
    // );

    panicTable = await RollTable.create(tableData, tableOptions);
    await panicTable.createEmbeddedEntity('TableResult', createData);
    ui.tables.render();
  }
}
