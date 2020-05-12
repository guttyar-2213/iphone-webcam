const fs = require("fs");
const io = require("socket.io").listen(5000, {
	key: fs.readFileSync("$HOME/oreore/server.key"),
	cert: fs.readFileSync("$HOME/oreore/server.crt"),
});
const { v4 } = require("uuid");
const sockets = new Map();

const createID = (sockets) => {
	let id = "";
	do {
		id = v4();
	} while (sockets.has(id));
	return id;
};
const send = (from, to, type, value) => {
	const socket = sockets.get(to);
	if (!socket || !to || !type) return;
	socket.emit(type, { from, value });
};
const broadcast = (from, type, value) => {
	if (!type) return;
	io.emit(type, { from, value });
};
const on = (socket, type, id) => socket.on(type, (e) => send(id, e.to, type, e.value));
const updateSockets = () => broadcast(null, "device", [...sockets.keys()]);

io.on("connection", (socket) => {
	const id = createID(sockets);
	sockets.set(id, socket);
	send(null, id, "self", id);
	updateSockets();
	on(socket, "offer", id);
	on(socket, "answer", id);
	on(socket, "close", id);
	console.log("a user connected", id);
	socket.on("disconnect", () => {
		sockets.delete(id);
		updateSockets();
		console.log("user disconnected");
	});
});
