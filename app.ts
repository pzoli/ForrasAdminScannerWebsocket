import fs from 'fs';
import WebSocket from 'ws';
import url from 'url';
import { scanImage } from './scan';

import http from 'http';
const server = http.createServer();

const wss = new WebSocket.Server({ server });
var msg: any;

wss.on('connection', function connection(ws: any, req: any) {
	ws.on('message', function incoming(message: String) {
		console.log('received: %s', message);
		if (message == 'scan') {
			scanImage();
			const content = fs.readFileSync('scanned.jpg');
			const imageData = new Uint8Array(content);
			ws.send(new Blob([imageData], { type: 'image/png' }));
		}
	});
	ws.on('close', function () {
		wss.clients.delete(ws);
		console.log('disconnected');
	});
});

server.listen(8082);
