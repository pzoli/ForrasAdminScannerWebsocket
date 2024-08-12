var winax = require('winax');
var fs = require('fs');
const WIA_IMG_FORMAT_PNG = '{B96B3CAF-0728-11D3-9D7B-0000F81EF32E}';
const WIA_IMG_FORMAT_JPG = '{B96B3CAE-0728-11D3-9D7B-0000F81EF32E}';
const WIA_IMG_FORMAT_BMP = '{B96B3CAB-0728-11D3-9D7B-0000F81EF32E}';
const WIA_SCAN_COLOR_MODE = '6146';
const WIA_HORIZONTAL_SCAN_RESOLUTION_DPI = '6147';
const WIA_VERTICAL_SCAN_RESOLUTION_DPI = '6148';
const WIA_HORIZONTAL_SCAN_START_PIXEL = '6149';
const WIA_VERTICAL_SCAN_START_PIXEL = '6150';
const WIA_HORIZONTAL_SCAN_SIZE_PIXELS = '6151';
const WIA_VERTICAL_SCAN_SIZE_PIXELS = '6152';
const WIA_SCAN_BRIGHTNESS_PERCENTS = '6154';
const WIA_SCAN_CONTRAST_PERCENTS = '6155';

const OUTPUT_FILE_NAME = 'scanned.jpg';

//const color_mode = 1; //Color
//const color_mode = 2; //grayscale
//const color_mode = 4; //back-white

function scanImage(assetId: number, color_mode: number, resolution: number) {
	let deviceManager = winax.Object('WIA.DeviceManager');
	let imgProc = winax.Object('WIA.ImageProcess');

	const width_pixel = resolution * 8.5;
	const height_pixel = resolution * 11;

	if (deviceManager.DeviceInfos.Count > 0) {
		try {
			const device_info = deviceManager.DeviceInfos(assetId);
			const device = device_info.Connect();
			const item = device.Items[assetId];
			setWiaProperty(item, WIA_SCAN_COLOR_MODE, color_mode);
			setWiaProperty(
				item,
				WIA_HORIZONTAL_SCAN_RESOLUTION_DPI,
				resolution,
			);
			setWiaProperty(item, WIA_VERTICAL_SCAN_RESOLUTION_DPI, resolution);
			setWiaProperty(item, WIA_HORIZONTAL_SCAN_START_PIXEL, 0);
			setWiaProperty(item, WIA_VERTICAL_SCAN_START_PIXEL, 0);
			setWiaProperty(item, WIA_HORIZONTAL_SCAN_SIZE_PIXELS, width_pixel);
			setWiaProperty(item, WIA_VERTICAL_SCAN_SIZE_PIXELS, height_pixel);
			setWiaProperty(item, WIA_SCAN_BRIGHTNESS_PERCENTS, 0);
			setWiaProperty(item, WIA_SCAN_CONTRAST_PERCENTS, 0);

			let image = item.Transfer(WIA_IMG_FORMAT_JPG);

			imgProc.Filters.Add(imgProc.FilterInfos('Convert').FilterID);
			imgProc.Filters(1).Properties('FormatID').value =
				WIA_IMG_FORMAT_JPG;
			imgProc.Filters(1).Properties('Quality').value = 75;
			image = imgProc.Apply(image);

			if (fs.existsSync(OUTPUT_FILE_NAME))
				fs.unlinkSync(OUTPUT_FILE_NAME);
			image.SaveFile(OUTPUT_FILE_NAME);
			return OUTPUT_FILE_NAME;
		} catch (e) {
			throw '{"return":"error","message":"' + e + '"}';
		}
	} else {
		throw '{"return":"error","message":"Nincs eszköz kijelölve!"}';
	}
}

function setWiaProperty(device: any, property: string, value: any) {
	let wiaProperty = device.Properties(property);
	if (wiaProperty != null) {
		wiaProperty.Value = value;
	}
}

function getDeviceInfos(): String {
	let deviceManager = winax.Object('WIA.DeviceManager');
	let result: {
		return: string;
		devices: { assetId: number; assetName: string }[];
	} = {
		return: 'deviceinfo',
		devices: [],
	};
	for (
		let deviceIdx = 1;
		deviceIdx <= deviceManager.DeviceInfos.Count;
		deviceIdx++
	)
		try {
			const device_info = deviceManager.DeviceInfos(deviceIdx);
			const device = device_info.Connect();

			let deviceName = '';
			let port = '';
			for (let idx = 1; idx <= device_info.Properties.Count; idx++) {
				const property = device_info.Properties(idx);
				if (property.Name == 'Name')
					deviceName = String(property.Value);
				if (property.Name == 'Port') port = String(property.Value);
				console.log(property.Name + ' : ' + String(property.Value));
			}
			result.devices.push({
				assetId: deviceIdx,
				assetName: `${deviceName}, Port: ${port}`,
			});
		} catch {}
	return JSON.stringify(result);
}
export { scanImage, getDeviceInfos };
