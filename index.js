/* eslint-disable no-undef */
const fs = require('fs');
const moment = require('moment');

var parser = require('xml2json');

fs.readFile('./apple_health_export/export.xml', (err, file) =>{
    if (err) {
        if (err.code === 'ENOENT'){
            console.error('Could not find export');
            return;
        }
        console.error(err);
        return;
    }

    console.log('Starting conversion...');
    const json = parser.toJson(file);
    fs.writeFile(`apple_output_${moment(Date.now()).format('M-D-YY_HH-mm-ss')}.json`, json, err => {
        if (err) {
            console.error('A problem occured saving the file');
        } else {
            console.log('Conversion complete!');
        }
    });
});
