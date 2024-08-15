# ForrasAdminScannerWebsocket

This project serves browser side scan request via WebSocket.
The server scan image from WIA interfaced scanner and submit the result image to the browser client (implemented in [Forras-imageserver](https://github.com/pzoli/forras-imageserver) project). Then user can crop image with CropperJS JavaScript component in the browser. 
When ready, user shoult send image to forras-imageserver REST Api that store file in filesystem and add file informations to [forras-admin](https://github.com/pzoli/forras-admin) PostgreSQL database.

## Install

npm install

npm i -g ts-node

## Start websocket server

ts-node app.ts
