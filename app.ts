import fs from 'fs';
import WebSocket from 'ws';
import url from 'url';
import { scanImage } from './scan';

import http from 'http';
const server = http.createServer();

const wss = new WebSocket.Server({ server });
var msg: any;

wss.on('connection', function connection(ws: any, req: any) {
	ws.on('message', function incoming(message: string) {
		console.log('received: %s', message);
		var mObj = JSON.parse(message);
		if (mObj.action == 'scan') {
			try {
				const fileName = scanImage(mObj.color_mode, mObj.resolution);
				const content = fs.readFileSync(fileName);
				const imageData = new Uint8Array(content);
				ws.send(
					new Blob([imageData], {
						type:
							'image/' +
							fileName.substring(fileName.indexOf('.') + 1),
					}),
				);
				if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
			} catch (e) {
				console.log(e);
				ws.send(e);
			}
		}
	});
	ws.on('close', function () {
		wss.clients.delete(ws);
		console.log('disconnected');
	});
});

server.listen(8082);
