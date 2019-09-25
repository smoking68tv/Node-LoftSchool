
const fs = require('fs-extra');
const path = require('path');


const baseCollection = process.argv[2];
const base = process.argv[3];
const deleteFolder = process.argv[4] && process.argv[4] === 'true' ? true : false;

const readDir = (base, level) => {
    fs.access(baseCollection, err => {
        if(err) {
            fs.mkdir(baseCollection, (err) => {
                if(err) {
                    console.log(err);
                    return;
                } else {
                    readFolders(base, level);
                }
            });
        } else {
            readFolders(base, level);
        }
    });
};

const readFolders = (base, level) => {
    fs.readdir(base, (err, files) => {
        if(err) {
            console.log(err);
            return;
        }
        files.forEach(item => {
            let localBase = path.join(base, item);
            fs.stat(localBase, (err, stats) => {
                if(!stats.isFile()) {
                    readDir(localBase, level + 1);
                } else {
                    readCollection({base: localBase, name: item});
                }
            });      
        });
    });
};

const readCollection = ({base, name}) => {
    let folderName = name.slice()[0].toUpperCase(),
        localBaseCollection = path.join(baseCollection, folderName),
        newPath = path.join(localBaseCollection, name);
    
    fs.access(localBaseCollection, err => {
        if(err) {
            fs.mkdir(localBaseCollection, err => {
                copyFile(base, name, newPath);
            });
        } else {
            copyFile(base, name, newPath);
        }
    });
};

const copyFile = (base, name, newPath) => {
    fs.link(base, newPath, err => {
        if(deleteFolder) {
            fs.unlink(base, err => {
                if(err) {
                    console.log(err);
                    return;
                }
                fs.access(base.replace(name, ''), err => {
                    fs.rmdir(base.replace(name, ''), err => {
                        if(err) {
                            return;
                        }
                    });
                });
            });
        }
        if(err) {
            console.log(`${name} уже в коллекции`);
            return;
        }
    });
};
  
readDir(base, 0);
