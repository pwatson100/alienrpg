//
// Distributed Module Class written by Matthew Haentschke as part of the symbaroum5ecore system.
// Import code written by @aMediocreDad and modified by Paul Watson
// Used with permission in accordance with the GPL 3 licence.
//

import { COMMON } from '../common.js';
// This object is intended to be used to convert the module pack names back to "Folder names".
// It is referenced against the manifest.json so it is important that the key is the pack name and the value is the folder name.
/**
 * @description This class is responsible for presenting a Dialog that prompts for importing the content of the modules.
 * @extends Dialog A FormApplication class in Foundry VTT responsible for creating pop-up dialogues.
 */
//TODO replace all relevant display text with localization
export class ModuleImportDialog extends Dialog {
  /* Default class data for overrides */
  static get moduleName() {
    return '**NONE**';
  }
  static get moduleTitle() {
    return '**NONE**';
  }
  static get sceneToActivate() {
    return '**NONE**';
  }

  static get postImportJournalName() {
    return '**NONE**';
  }
  static get importedStateKey() {
    return 'imported';
  }
  static get migratedVersionKey() {
    return 'migrationVersion';
  }
  static get migrationVersions() {
    return Object.keys(this.migrationData).sort();
  }

  /** OVERRIDE FOR IMPORTER SPECIFIC MIGRATION VERSIONS *
   * updateData parameters.
   * @param {Text} assetType - Type of asset journal, scenes, actors, items
   * @param {Text} oldAsset - Name of the asset you want removed
   * @param {Text} newAsset - Name of the asset you want replaced
   * @param {Text} packName - Name of the pack (from the module.js)
   * @param {Text} folder - Name of the folder to put the asset in (this can be diferent from the name specified in module label)
   */
  /** example *
  {'1.0.0': packs: ['Core Rules - Book 1'],
          data: [{ assetType: 'folders', oldAsset: '1. The Promised Land - Artifacts', newAsset: 'N/A', packName: 'N/A', folder: 'Symbaroum - APG - Actors' },
  { assetType: 'folders', oldAsset: `GM Aids`, newAsset: 'N/A', packName: 'N/A', folder: `GM Aids` }]}
  
  
  Added additional option to delete an individual asset:
   * @param {Text} assetType - 'delete'
   * @param {Text} oldAsset - Name of the asset you want removed
   * @param {Text} newAsset - type of asset: tables, journal, items', actors, scenes
   * @param {Text} packName - N/A
   * @param {Text} folder - N/A
   *
   * This will delete all the objects then rerun the import
  ** example *
   { assetType: 'delete', oldAsset: '01.02e Events In The Spirit World', newAsset: 'tables', packName: 'N/A', folder: 'N/A' },

  */
  static get migrationData() {
    return {};
  }

  static get menuData() {
    return {
      forceImport: {
        name: `ALIENRPG.forceImportName`,
        label: `ALIENRPG.forceImportLabel`,
        hint: `ALIENRPG.forceImportHint`,
      },
    };
  }

  //   static get requiredAlienrpgCoreVersion() {
  //     return game.modules.get('symbaroum5ecore').data.version;
  //   }
  static get requiredAlienrpgCoreVersion() {
    return '2.1.0';
  }
  static get manifestPath() {
    return `modules/${this.moduleName}/manifests/manifest.json`;
  }
  static get folderNameDict() {
    return {};
  }

  constructor({
    moduleName,
    moduleTitle,
    sceneToActivate,
    postImportJournalName,
    importedStateKey,
    migratedVersionKey,
    migrationVersions,
    migrationData,
    menuData,
    requiredAlienrpgCoreVersion,
    manifestPath,
    folderNameDict,
  } = ModuleImportDialog) {
    super({
      content: '',
      buttons: {},
    });

    this.imported = {
      Actor: {},
      Item: {},
      JournalEntry: {},
      RollTable: {},
      Scene: {},
    };
    /* store provided identifying information */
    this.moduleName = moduleName;
    this.moduleTitle = moduleTitle;
    this.importedStateKey = importedStateKey;
    this.migratedVersionKey = migratedVersionKey;
    this.migrationVersions = migrationVersions;
    this.migrationData = migrationData;
    this.menuData = menuData;
    this.sceneToActivate = sceneToActivate;
    this.postImportJournalName = postImportJournalName;
    // this.requiredAlienrpgCoreVersion = requiredAlienrpgCoreVersion;
    this.requiredAlienrpgCoreVersion = requiredAlienrpgCoreVersion;
    this.manifestPath = manifestPath;
    this.folderNameDict = folderNameDict;

    /* latch current module/core version */
    this.moduleVersion = game.modules.get(this.moduleName).data.version;
    // this.coreVersion = game.modules.get('alienprg').data.version;
    this.coreVersion = game.system.data.version;
  }

  async render(...args) {
    this.data.content = this.generateDialogHeader();
    const needsImport = !ModuleImportDialog.isImported(this);
    if (needsImport) {
      this.data.content += this.generateDialogContent();
    } else {
      const initialMigrationVersion = ModuleImportDialog.neededMigration(this);
      this.data.content += this.generatePatchNotes(initialMigrationVersion);
    }

    /* append our current module version to the provided content */
    this.data.content += this.generateDialogFooter();

    const mode = needsImport ? 'Import' : 'Upgrade';
    this.data.title = `${mode} ${this.moduleName}`;

    const importCallback = async () => {
      await this.checkVersion().catch(() => {
        throw console.warn('Version check failed.');
      });

      await this.prepareModule().catch((e) => {
        let error = console.error('Failed to initialize module', e);
        throw error;
      });

      await this.renderWelcome();
      await this.setImportedState(true);
      await this.updateLastMigratedVersion();
      ui.notifications.notify('Import complete. No Issues.');
    };

    const migrateCallback = async () => {
      await this.checkVersion().catch(() => {
        throw console.warn('Version check failed.');
      });

      let migrationVersion = false;
      while ((migrationVersion = ModuleImportDialog.neededMigration(this))) {
        await this.moduleUpdate(migrationVersion).catch((e) => {
          let error = console.error(`Failed to upgrade module to ${migrationVersion}`, e);
          throw error;
        });

        ui.notifications.notify(`Upgrade to ${migrationVersion} complete. No Issues.`);
      }
    };

    const buttons = {
      initialize: {
        label: mode,
        callback: needsImport ? importCallback : migrateCallback,
      },
    };

    this.data.buttons = buttons;
    this.position.width = 573;
    return super.render(...args);
  }

  static register() {
    this.settings();
    this.hooks();
  }

  static hooks() {
    Hooks.on('alienrpgRunImport', this._init.bind(this));
  }

  static settings() {
    COMMON.applySettings(this.getSettingsData(), this.moduleName);
    const callerClass = this;
    class formAppWrapper extends FormApplication {
      async render() {
        const importer = new callerClass();
        await importer.setImportedState(false);
        return importer.render(true);
      }
    }

    Object.entries(this.menuData).forEach(([key, value]) => {
      game.settings.registerMenu(this.moduleName, key, {
        ...value,
        name: COMMON.localize(value.name),
        hint: COMMON.localize(value.hint),
        label: COMMON.localize(value.label),
        type: formAppWrapper,
        restricted: true,
      });
    });
  }

  static get utils() {
    return {
      isFirstGM: COMMON.isFirstGM,
    };
  }

  static isImported({ moduleName = this.moduleName, importedStateKey = this.importedStateKey } = {}) {
    return game.settings.get(moduleName, importedStateKey);
  }

  static isMigrated({ moduleName = this.moduleName, migratedVersionKey = this.migratedVersionKey, migrationVersions = this.migrationVersions }) {
    return !ModuleImportDialog.neededMigration({ moduleName, migratedVersionKey, migrationVersions });
  }

  /* OVERRIDE FOR INITIALIZATION TASKS */
  /* return {Boolean} should this import dialog be shown? */
  static async init() {
    return (!this.isImported(this) || !this.isMigrated(this)) && this.utils.isFirstGM();
  }

  /* OVERRIDE FOR IMPORTER SPECIFIC SETTINGS */
  static getSettingsData() {
    const settingsData = {
      [this.importedStateKey]: {
        scope: 'world',
        config: false,
        type: Boolean,
        default: false,
      },
      [this.migratedVersionKey]: {
        scope: 'world',
        config: false,
        type: String,
        default: '0.0.0',
      },
    };

    return settingsData;
  }

  generateDialogContent() {
    return '';
  }

  generateDialogHeader() {
    return `<img src="systems/alienrpg/images/icons/alienrpg.webp" style="height:137px; width:560px; border:0;" alt="" />`;
  }

  generateDialogFooter() {
    return `<br>No part of this publication may be reproduced, distributed, stored in a retrieval system, or transmitted in any form by any means, electronic, mechanical, photocopying, recording or otherwise without the prior permission of the publishers.<br><br>
    <b> <sup>tm</sup> & © 2021 20th Century Studios Inc. All Rights Reserved</b> <br><br>
            Published by: <b>Free League Publishing</b><br>
            Foundry Visualisation by <b>Paul Watson</b><br>
            Thanks for their help and support to: <b>Thomas Boulton and Frank Graeff</b><br><br>
                  <a href="https://frialigan.se/">Free League</a> <br><br> 
                         <img src="systems/alienrpg/images/icons/fl-20cf-logo.png" height=189 width=289 style ='margin-left: 25%;'/>
                         <br><br>
      Module Version: ${this.moduleVersion}
      <br><br>`;
  }

  generatePatchNotes(migrationVersion) {
    return `
      <h2> <b>${this.moduleTitle} Update v${migrationVersion}</b></h2>
      This script will correct the following issues:
      <ul>
      ${this.migrationData[migrationVersion].notes.reduce((acc, curr) => {
        acc += `<li>${curr}</li>`;
        return acc;
      }, '')}
      </ul>
      <br>
      If maps are active or contain tokens,lights or notes they will not be replaced as I don't want to overwrite any work you have done. <br>
      You will need to import these manually when convenient.`;
  }

  static neededMigration({ moduleName = this.moduleName, migratedVersionSetting = this.migratedVersionKey, migrationVersions = this.migrationVersions }) {
    const lastMigratedVersion = game.settings.get(moduleName, migratedVersionSetting);
    const neededMigrationVersions = migrationVersions;

    const needsMigration = neededMigrationVersions.find((version) => isNewerVersion(version, lastMigratedVersion));
    logger.debug(`${moduleName} ${!!needsMigration ? 'requires migration to ' + needsMigration : 'does not require migration'} (last migrated version: ${lastMigratedVersion})`);
    return needsMigration ?? false;
  }

  static async _init() {
    // debugger;
    const render = await this.init.call(this);
    if (render) {
      return new this().render(true);
    }
  }

  async setImportedState(bool) {
    await game.settings.set(this.moduleName, this.importedStateKey, bool);
  }

  async updateLastMigratedVersion(version = this.moduleVersion) {
    await game.settings.set(this.moduleName, this.migratedVersionKey, version);
  }

  async prepareModule() {
    console.warn('Starting import of: ', this.moduleTitle);
    ui.notifications.notify('Starting import of: ' + this.moduleTitle + '. Hold on, this could take a while...');
    await this.importModule(this.folderNameDict);
  }

  async importModule(folderMapping) {
    const manifest = await this.readManifest();
    const modulePacks = (await game.modules.get(this.moduleName)?.packs) ?? [];
    return Promise.all(
      modulePacks.map(async (p) => {
        let moduleFolderId = '';
        let type = p.type;
        const pack = await game.packs.get(`${this.moduleName}.${p.name}`).getDocuments();

        if (type !== 'Playlist' && type !== 'Macro') {
          const moduleFolderName = folderMapping[p.label] ?? 'skipimport';
          if (moduleFolderName === 'skipimport') {
            return;
          }
          if (game.folders.getName(moduleFolderName)) {
            moduleFolderId = game.folders.getName(moduleFolderName);
          } else {
            moduleFolderId = await Folder.create({
              name: moduleFolderName,
              type: type,
              parent: null,
              color: manifest[type][moduleFolderName].color || null,
              sort: manifest[type][moduleFolderName].sort || null,
              sorting: manifest[type][moduleFolderName].sorting || 'a',
            });
          }
          const manifestEntity = manifest[type][moduleFolderName].content;
          await this.importFromManifest(manifestEntity, pack, type, moduleFolderId.data._id);
        } else if (type === 'Playlist') {
          const uniquePlaylists = pack.filter((p) => {
            if (!game.playlists.find((n) => n.data.name === p.data.name)) return p;
          });
          Playlist.create(uniquePlaylists.map((p) => p.data));
        } else {
          const uniqueMacros = pack.filter((p) => {
            if (!game.macros.find((n) => n.data.name === p.data.name)) return p;
          });
          Macro.create(uniqueMacros.map((p) => p.data));
        }
        return true;
      })
    );
  }

  async importFromManifest(manifest, pack, type, parent) {
    let folder = ';';
    if (manifest.parent) {
      parent = manifest.parent;
      delete manifest.parent;
    }
    for await (const [key, item] of Object.entries(manifest)) {
      if (key !== 'entities') {
        if (game.folders.getName(key)) {
          folder = game.folders.getName(key);
        } else {
          folder = await Folder.create({
            name: key,
            type: type,
            color: item.color,
            parent: parent || null,
            sort: item.sort || null,
            sorting: item.sorting || 'a',
          });
        }
        const pushParent = Object.values(item);
        await pushParent.forEach((child) => {
          if (child && typeof child === 'object') child.parent = folder.data._id;
        });
        await this.importFromManifest(item.content, pack, type);
      } else if (key === 'entities') {
        try {
          const entityData = Object.keys(item).reduce((result, identifier) => {
            const entity = pack.filter((e) => e.data._id === identifier);
            return [...result, entity[0].data];
          }, []);

          for (let index = entityData.length - 1; index >= 0; index--) {
            let x = entityData[index];
            let fred = x.document.collectionName;
            if (game[fred].get(x._id) != undefined) {
              console.log(x.name, ' Exists', fred);
              delete entityData[index];
            }
          }
          let newentityData = entityData.filter(() => true);

          for await (const entry of newentityData) {
            entry._source.folder = parent || null;
          }

          const cls = getDocumentClass(type);
          const createdEntities = await cls.createDocuments(newentityData, { keepId: true });
          if (Array.isArray(createdEntities)) {
            for await (const entry of createdEntities) {
              this.imported[type][entry.data.name] = entry;
            }
          } else {
            this.imported[type][createdEntities.data.name] = createdEntities;
          }
        } catch (e) {
          console.warn('Could not create entity: ', e);
        }
      } else {
        console.error("I don't understand this key: ", key);
      }
    }
  }
  async performFlagUpdates() {
    const entityTypes = ['actors', 'items', 'journal', 'scenes', 'tables'];
    for await (const entityType of entityTypes) {
      switch (entityType) {
        case 'scenes':
          // eslint-disable-next-line no-case-declarations
          const sceneData = [];
          for await (const entity of Object.values(this.imported.Scene)) {
            sceneData.push({
              _id: entity.data._id,
              thumb: entity.data.thumb,
            });
          }
          await Scene.updateDocuments(sceneData);
          break;
        case 'journal':
          // eslint-disable-next-line no-case-declarations
          const journalData = duplicate(Object.values(this.imported.JournalEntry));
          for (const journalEntry of journalData) {
            const flag = journalEntry.data?.flags[this.moduleName]?.folder.sort;
            if (flag) await journalEntry.updateDocuments('sort', flag);
          }
          break;
      }
    }
  }

  async moduleUpdate(toMigrationVersion) {
    const thisMigration = this.migrationData[toMigrationVersion] ?? { dict: [], data: [] };
    for (const { assetType, oldAsset, newAsset, packName, folder } of thisMigration.data) {
      if (assetType === 'delete') {
        try {
          const isThere = game[newAsset].getName(oldAsset);
          if (isThere) {
            console.log('It Exists');
            await isThere.delete({ deleteSubfolders: true, deleteContents: true });
          }
        } catch (error) {
          console.warn(`${oldAsset} already deleted`);
        }
      }
    }
    // Now import just the deleted items
    await this.importModule(thisMigration.dict);

    // Process special instructions with checks (replace, rename remove entire folder)
    for (const { assetType, oldAsset, newAsset, packName, folder } of thisMigration.data) {
      switch (assetType) {
        case 'journal':
        case 'items':
        case 'actors':
        case 'tables':
          try {
            const isThere = game[assetType].getName(oldAsset);
            if (isThere) await isThere.delete({ deleteSubfolders: true, deleteContents: true });
          } catch (error) {
            console.warn(`${oldAsset} already deleted`);
          }
          const pack = await game.packs.find((p) => p.metadata.name === packName);
          await pack.getIndex();
          const entry = pack.index.find((j) => j.name === newAsset);
          const folderId = await game.folders.getName(folder)?.id;
          const documents = await pack.getDocuments(entry);

          const createData = documents.map((doc) => {
            let data = doc.toObject();
            data.folder = folderId;
            return data;
          });

          await pack.documentClass.createDocuments(createData, { folder: folderId, keepId: true });

          break;

        case 'scenes':
          let isActive = !!game.scenes.getName(newAsset)?.active;
          let hasTokens = !!game.scenes.getName(newAsset)?.data.tokens.length;
          let hasNotes = !!game.scenes.getName(newAsset)?.data.notes.length;
          let hasLights = !!game.scenes.getName(newAsset)?.data.lights.length;
          if (isActive || hasTokens || hasNotes || hasLights) {
            let chatMessage = `<div class="chatBG">`;
            chatMessage += `<h2 style="color:  #fff">The scene: <br> ${newAsset} <br> has not been imported as:</h2> `;
            if (isActive) chatMessage += 'It is Active and in use.<br>';
            if (hasTokens) chatMessage += `It has ${hasTokens} placed Tokens.<br>`;
            if (hasNotes) chatMessage += `It has ${hasNotes} placed Notes.<br>`;
            if (hasLights) chatMessage += `It has ${hasLights} placed Lights sources. <br>`;
            chatMessage += '<br><h3>Import the new version manually from the Compendium when convenient.</h3> ';
            await ChatMessage.create({
              user: game.user.id,
              content: chatMessage,
              whisper: game.users.contents.filter((u) => u.isGM).map((u) => u.id),
              rollMode: game.settings.get('core', 'rollMode'),
            });
            break;
          } else {
            try {
              const scene = game.scenes.getName(oldAsset);
              if (scene) await scene.delete({ deleteSubfolders: true, deleteContents: true });
              console.warn(`${newAsset} has been deleted`);
            } catch (error) {
              console.warn(`${newAsset} already deleted`);
            }
            const pack = await game.packs.find((p) => p.metadata.name === packName);
            const index = await pack.getIndex();
            const entry = index.find((j) => j.name === newAsset);
            const documents = await pack.getDocuments(entry);
            const folderId = await game.folders.getName(folder).data._id;

            const createData = documents.map((doc) => {
              let data = doc.toObject();
              data.folder = folderId;
              return data;
            });

            const cls = getDocumentClass('Scene');
            await cls.createDocuments(createData, { folder: folderId, keepId: true });
          }
          break;
        case 'folders':
          try {
            const isThere = game[assetType].getName(oldAsset);
            if (isThere) {
              console.log('It Exists');
              await isThere.delete({ deleteSubfolders: true, deleteContents: true });
            }
          } catch (error) {
            console.warn(`${oldAsset} already deleted`);
          }
          await this.importModule(thisMigration.dict);
          break;
        default:
          break;
      }
    }
    await this.migrationComplete(toMigrationVersion);
  }

  async migrationComplete(toVersion) {
    await this.updateLastMigratedVersion(toVersion);
    return new Promise((resolve) => {
      Dialog.prompt({
        title: `Ruins of Symbaroum 5e Updater`,
        content: this.generatePatchNotes(toVersion),
        label: 'Okay!',
        callback: () => {
          resolve(console.log('All Done'));
        },
      });
    });
  }

  async checkVersion() {
    const currentDnD = game.system.data.version;
    if (isNewerVersion(this.requiredAlienrpgCoreVersion, currentDnD)) {
      throw Dialog.prompt({
        title: 'Version Check',
        content: `<h2>Failed to Import</h2><p>Your DnD5e - Fith Edition System system version (${current})is below the minimum required version (${this.requiredAlienrpgCoreVersion}).</p><p>Please update your system before proceeding.</p>`,
        label: 'Okay!',
        callback: () => ui.notifications.warn('Aborted importing of compendium content. Update your dnd5e system and try again.'),
      });
    }

    if (isNewerVersion(this.requiredAlienrpgCoreVersion, this.coreVersion)) {
      throw Dialog.prompt({
        title: 'Version Check',
        content: `<h2>Failed to Import</h2><p>Your Symbaroum 5e Core system version (${this.coreVersion})is below the minimum required version (${this.requiredAlienrpgCoreVersion}).</p><p>Please update before proceeding.</p>`,
        label: 'Okay!',
        callback: () => ui.notifications.warn('Aborted importing of compendium content. Update your Symbaroum 5e Core module and try again.'),
      });
    }
  }

  async readManifest() {
    const r = await (await fetch(this.manifestPath)).json().catch((e) => console.warn('MANIFEST ERROR: \nYou likely have nothing in your manifest, or it may be improperly formatted.', e));
    return r;
  }

  async renderWelcome() {
    setTimeout(() => {
      try {
        game.scenes.getName(this.sceneToActivate)?.activate();
        Dialog.prompt({
          title: `${this.moduleTitle} Importer`,
          content: `<p>Welcome to the <strong>${this.moduleTitle}</strong> <br><br> All assets have been imported.`,
          label: 'Okay!',
          callback: () => game.journal.getName(this.postImportJournalName).show(),
        });
      } catch (e) {
        console.error("Couldn't initialize welcome: ", e);
      }
    }, 500);
  }
}
