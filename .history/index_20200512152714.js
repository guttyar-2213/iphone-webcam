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
const on = (socket, type, id) => {
	socket.on(type, (e) => {
		send(id, e.to, type, e.value);
	});
};

io.on("connection", (socket) => {
	const id = createID(sockets);
	send(null, id, "device", [...sockets.keys()]);
	sockets.set(id, socket);
	send(null, id, "self", id);
	on(socket, "offer", id);
	on(socket, "answer", id);
	console.log("a user connected", id);
});
