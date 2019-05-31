const fs = require('fs');

const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        console.log(filePath, err);
        if (err) {
            throw (err);
        }
    });
}

exports.deleteFile = deleteFile;