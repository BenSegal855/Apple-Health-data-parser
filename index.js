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

    const rowTemplate = '$created,$start,$end,$sourceName,$sourceVersion,$metaKey,$metaValue,$deviceName,$deviceManu,$deviceModle,$deviceHardware,$deviceSoftware,$type,$unit,$value\n';
    console.log('Starting conversion...');
    const data = parser.toJson(file, {object: true}).HealthData;

    let buffer = rowTemplate
        .replace('$created', 'Creation Date')
        .replace('$start', 'Start Date')
        .replace('$end', 'End Date')
        .replace('$sourceName', 'Source Name')
        .replace('$sourceVersion', 'Source Version')
        .replace('$metaKey', 'Metadata Key')
        .replace('$metaValue', 'Metadata Value')
        .replace('$deviceName', 'Device Name')
        .replace('$deviceManu', 'Device Manufacturer')
        .replace('$deviceModle', 'Device Modle')
        .replace('$deviceHardware', 'Device Hardare')
        .replace('$deviceSoftware', 'Device Software')
        .replace('$type', 'Type')
        .replace('$unit', 'Units')
        .replace('$value', 'Value');

    for (entry of data.Record) {
        buffer += rowTemplate
            .replace('$created', entry.creationDate)
            .replace('$start', entry.startDate)
            .replace('$end', entry.endDate)
            .replace('$sourceName', entry.sourceName)
            .replace('$sourceVersion', entry.sourceVersion)
            .replace('$metaKey', entry.MetadataEntry?.key)
            .replace('$metaValue', entry.MetadataEntry?.value)
            .replace('$deviceName', entry.device?.split(':')[2].split(',')[0])
            .replace('$deviceManu', entry.device?.split(':')[3].split(',')[0])
            .replace('$deviceModle', entry.device?.split(':')[4].split(',')[0])
            .replace('$deviceHardware', entry.device?.split(':')[5].split(',')[0])
            .replace('$deviceSoftware', entry.device?.split(':')[6].split(',')[0].replace('>', ''))
            .replace('$type', entry.type)
            .replace('$unit', entry.unit)
            .replace('$value', entry.value);
    }

    fs.writeFile(`apple_output_${moment(Date.now()).format('M-D-YY_HH-mm-ss')}.csv`, buffer, err => {
        if (err) {
            console.error('A problem occured saving the file');
        } else {
            console.log('Conversion complete!');
        }
    });
});
