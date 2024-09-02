import fs from 'fs';
import WebSocket from 'ws';
import url from 'url';
import { scanImage, getDeviceInfos } from './scan';

import http from 'http';
const server = http.createServer();

const wss = new WebSocket.Server({ server });
var msg: any;

wss.on('connection', function connection(ws: any, req: any) {
	ws.on('message', function incoming(message: string) {
		console.log('received: %s', message);
		var mObj = JSON.parse(message);
		switch (mObj.action) {
			case 'scan': {
				try {
					//*
					const fileName = scanImage(
						mObj.assetId,
						mObj.color_mode,
						mObj.resolution,
					);
					//*/
					//const fileName = 'scanned_large.jpg';
					//const fileName = 'scanned_small.jpg';
					if (fs.existsSync(fileName)) {
						const content = fs.readFileSync(fileName);
						const imageData = new Uint8Array(content);
						ws.send(
							new Blob([imageData], {
								type:
									'image/' +
									fileName.substring(
										fileName.indexOf('.') + 1,
									),
							}),
						);
						fs.unlinkSync(fileName);
					}
				} catch (e) {
					console.log(e);
					ws.send(e);
				}
				break;
			}
			case 'deviceinfo': {
				ws.send(getDeviceInfos());
				break;
			}
			default:
				break;
		}
	});
	ws.on('close', function () {
		wss.clients.delete(ws);
		console.log('disconnected');
	});
});

server.listen(8082);
