const { remote } = require('electron');
const { dialog } = remote;
const parser = require(require.resolve('xml2json'));
const StreamZip = require(require.resolve('node-stream-zip'));
const { writeFile } = require('fs');

let source = '';

const srcBtn = document.getElementById('source');
const startBtn = document.getElementById('start');

srcBtn.onclick = getSrcFile;
startBtn.onclick = convert;

async function getSrcFile() {
	const { filePaths } = await dialog.showOpenDialog({
		buttonLabel: 'Select',
		filters: [{ name: 'Archive', extensions: ['zip'] }]
	})

	source = filePaths[0];
}

async function convert() {
	if (!source) {
		startBtn.classList.add('is-danger');
		setTimeout(() => startBtn.classList.remove('is-danger'), 2e3);
		return;
	}

	startBtn.classList.add('is-loading');

	const zip = new StreamZip({
		file: source,
		storeEntries: true
	});

	zip.on('ready', async () => {
		const file = zip.entryDataSync('apple_health_export/export.xml');
		const rowTemplate = '$created,$start,$end,$sourceName,$sourceVersion,$metaKey,$metaValue,$deviceName,$deviceManu,$deviceModle,$deviceHardware,$deviceSoftware,$type,$unit,$value\n';
		const data = parser.toJson(file, { object: true }).HealthData;

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
			.replace('$deviceModle', 'Device Model')
			.replace('$deviceHardware', 'Device Hardware')
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
				.replace('$deviceName', entry.device?.split(':')[2]?.split(',')[0])
				.replace('$deviceManu', entry.device?.split(':')[3]?.split(',')[0])
				.replace('$deviceModle', entry.device?.split(':')[4]?.split(',')[0])
				.replace('$deviceHardware', entry.device?.split(':')[5]?.split(',')[0])
				.replace('$deviceSoftware', entry.device?.split(':')[6]?.split(',')[0].replace('>', ''))
				.replace('$type', entry.type)
				.replace('$unit', entry.unit)
				.replace('$value', entry.value);
		}
		
		startBtn.classList.remove('is-loading');
		startBtn.innerText = 'Done!';

		const { filePath: dest } = await dialog.showSaveDialog({
			defaultPath: 'export.csv',
			filters: [{ name: 'CSV', extensions: ['csv'] }]
		})

		writeFile(dest, buffer, err => {
			if (err) {
				startBtn.classList.add('is-danger');
				setTimeout(() => startBtn.classList.remove('is-danger'), 2e3);
			}
		});

		startBtn.innerText = 'Start conversion';

		zip.close();
	});
}
