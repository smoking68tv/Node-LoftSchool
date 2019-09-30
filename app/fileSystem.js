const path = require('path');
const rimraf = require('rimraf');
const fs = require('mz/fs');
const argv = require('yargs')
  .example('node index.js --entry input --output output --delete')
  .demandOption(['entry', 'output'])
  .argv;

const getFolders = base => {
    return new Promise((resolve, reject) => {
        let result = {},
            level = 1;
        const readDir = async dir => {
            try {
                let contents = await fs.readdir(dir);
                contents.forEach(item => {
                    let localBase = path.join(dir, item);
                    if (!fs.lstatSync(localBase).isFile()) {
                        level++;
                        readDir(localBase);
                    } else {
                        let folderName = item[0].toUpperCase(),
                            fileObj = {
                                name: item,
                                base: localBase
                            };
                        result[folderName] ? result[folderName].push(fileObj) : result[folderName] = [fileObj];
                    }
                });
                level--;
                !level ? resolve(result) : {};
            } catch(e) {
                console.log(e);
            }
        };
        readDir(base);
    });
};

const asyncForEach = (array, callback) => {
    array.forEach(async(val, idx, array) => {
        await callback(val, idx, array);
    });
};

const copyFiles = async (data, output) => {
    try {
        await fs.mkdir(output);
        await asyncForEach(Object.keys(data), async key => {
            let newPath = path.join(output, key),
                items = data[key];
                
            await fs.mkdir(newPath);
            await asyncForEach(items, async item => {
                await fs.copyFile(item.base, path.join(newPath, item.name));
            });
        });
    } catch(e) {
        console.log(e);
    } 
};

const createCollection = async (entry, output, isDelete) => {
    return getFolders(entry)
        .then(async folders => {
            await copyFiles(folders, output);
            isDelete ? rimraf(entry, () => {}) : {};
        });
};
createCollection(argv.entry, argv.output, argv.delete);