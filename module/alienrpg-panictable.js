export async function createPanicTable(folderid) {
  let panicTable = game.tables.getName('Panic Table');
  // console.warn('panicT folderid', folderid);

  //If the table doesn't exist, create it
  if (!panicTable) {
    const createData = [
      {
        type: 0,
        text: 'Panic1',
        img: 'icons/svg/d20-black.svg',
        weight: 1,
        range: [1, 6],
      },
      {
        type: 0,
        text: 'Panic7',
        img: 'icons/svg/d20-black.svg',
        weight: 1,
        range: [7, 7],
      },
      {
        type: 0,
        text: 'Panic8',
        img: 'icons/svg/d20-black.svg',
        weight: 1,
        range: [8, 8],
      },
      {
        type: 0,
        text: 'Panic9',
        img: 'icons/svg/d20-black.svg',
        weight: 1,
        range: [9, 9],
      },
      {
        type: 0,
        text: 'Panic10',
        img: 'icons/svg/d20-black.svg',
        weight: 1,
        range: [10, 10],
      },
      {
        type: 0,
        text: 'Panic11',
        img: 'icons/svg/d20-black.svg',
        weight: 1,
        range: [11, 11],
      },
      {
        type: 0,
        text: 'Panic12',
        img: 'icons/svg/d20-black.svg',
        weight: 1,
        range: [12, 12],
      },
      {
        type: 0,
        text: 'Panic13',
        img: 'icons/svg/d20-black.svg',
        weight: 1,
        range: [13, 13],
      },
      {
        type: 0,
        text: 'Panic14',
        img: 'icons/svg/d20-black.svg',
        weight: 1,
        range: [14, 14],
      },
      {
        type: 0,
        text: 'Panic15',
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

    let folder = game.folders.entities[4];
    var tables = game.packs.get('AlienRPG.tables_gm');
    // console.warn('tables', folderid, tables);

    tables.getContent().then((d) =>
      d.forEach((a) => {
        let tData = a.data;
        // console.warn('ForEach', tData);
        game.tables.importFromCollection('AlienRPG.tables_gm', a.data._id, { folder: folderid });
        // RollTable.create(tData, { folder: folderid });
      })
    );
    // panicTable = await RollTable.create(tableData, tableOptions);
    // await panicTable.createEmbeddedEntity('TableResult', createData);
    ui.tables.render();
  }
}
