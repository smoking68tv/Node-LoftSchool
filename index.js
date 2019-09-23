// const fs = require('fs');
const fs = require('fs-extra');
const path = require('path');


const baseCollection = process.argv[2];
const base = process.argv[3];
const deleteFolder = process.argv[4] && process.argv[4] === 'true' ? true : false;

const readDir = (base, level) => {
    const files = fs.readdirSync(base);
    
    if(!fs.existsSync(baseCollection)) {
        fs.mkdirSync(baseCollection); 
    }

    let objFiles = [];
    files.forEach(item => {
        let localBase = path.join(base, item),
            state = fs.statSync(localBase);

        if (state.isDirectory()) {
            readDir(localBase, level + 1);
        } else {
            objFiles.push({
                base:localBase,
                name:item
            });
        }
    });
    objFiles.length ? readCollection(objFiles) : {};
};

const readCollection = (files) => {
    let folderName,
        localBaseCollection,
        newPath;

    for(let file of files) {
        folderName = getFirstLetter(file.name);
        localBaseCollection = path.join(baseCollection, folderName);
        newPath = path.join(localBaseCollection, file.name);

        if(!fs.existsSync(localBaseCollection)) {
            fs.mkdirSync(localBaseCollection);
        }
        copyFile(file.base, file.name, newPath); 
    }
};
const copyFile = (base, name, newPath) => {
    fs.link(base, newPath, err => {
        if(deleteFolder) {
        //     fs.remove(base.replace(name, ''), err => {
        //         console.error(err)
        //     });
            fs.unlink(base, err => {
                // if(fs.existsSync(file.base.replace(file.name, ''))) {
                //     fs.rmdir(file.base.replace(file.name, ''), err => {
                //         if(err) {
                //             console.log(err)
                //             return;
                //         }
                //     })
                // } 
                if(err) {
                    console.log(err);
                    return;
                }
            });
        }
        
        if(err) {
            console.log(`${name} уже в коллекции`);
            return;
        }
    });
};

const getFirstLetter = file => {
    let letter = file.slice()[0];
    return letter.toUpperCase();
};
  
readDir(base, 0);
