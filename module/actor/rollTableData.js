export class alienrpgrTableGet extends Actor {
  constructor(options = {}) {
    super(options);
  }

  static rTableget() {
    let folder = game.folders.contents.find((x) => x.name === 'Alien Creature Tables');
    // console.log('rTableget -> folder', folder);
    let aTables = folder.contents;
    let lTables = { 0: 'None' };
    // let lTables = aTables.find((x) => x.name);
    for (let index = 0; index < aTables.length; index++) {
      lTables[index + 1] = aTables[index].name;
    }
    return lTables;
  }
}
