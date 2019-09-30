const fs = require('mz/fs');
const path = require('path');

const baseCollection = process.argv[2];
const base = process.argv[3];
const deleteFolder = process.argv[4] && process.argv[4] === 'true' ? true : false;

const createCollection = async (from, to, isDelete) => {
    try {
        await fs.access(to);
        return readDir(from, to);
    } catch(e) {
        await fs.mkdir(to);
        await createCollection(from, to, isDelete);
    }
};

const readDir = (from,to) => {
    return new Promise((resolve, reject) => {
        let level = 1,
        allPromises = [];
        const getFolders = async (baseItem) => {
            try {
                let content = await fs.readdir(baseItem);

                content.forEach(async item => {
                    let localBase = path.join(baseItem, item);
                        stats = await fs.lstatSync(localBase);

                    if(!stats.isFile()) {
                        level++;
                        getFolders(localBase)
                        // console.log(allPromises)
                        // удалять пустые папки
                    } else {
                        changeCollection({
                            base: localBase, 
                            name: item
                        });
                    }
                });
                

                level--;
                console.log(baseItem,level)
                level === 0 ? resolve() : {};
            } catch(e) {
                console.log(e);
            } 
            
        };
        getFolders(from);
    });
};

const changeCollection = async ({base, name}) => {
    let folderName = name.slice()[0].toUpperCase(),
        localBaseCollection = path.join(baseCollection, folderName),
        newPath = path.join(localBaseCollection, name);

        await fs.access(localBaseCollection).catch(async () => await fs.mkdir(localBaseCollection));
        await fs.link(base, newPath).catch(() => console.log(`${name} уже в коллекции`));
}

createCollection(base, baseCollection, deleteFolder)
    // .then(() => {
    //     console.log('Success');
    // });