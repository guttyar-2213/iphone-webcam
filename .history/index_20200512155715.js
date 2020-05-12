const io = require("socket.io")(5000);
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
const updateSockets = () => broadcast([...sockets.keys()]);

io.on("connection", (socket) => {
	const id = createID(sockets);
	sockets.set(id, socket);
	io.emit("hahaha", [...socket.keys()]);
	/*
	updateSockets();
	send(null, id, "self", id);
	on(socket, "offer", id);
	on(socket, "answer", id); */
	console.log("a user connected", id);
	socket.on("disconnect", () => {
		// 	updateSockets();
		console.log("user disconnected");
	});
});
