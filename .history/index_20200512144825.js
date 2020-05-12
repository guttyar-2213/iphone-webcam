const io = require("socket.io")(5000);
const { v4 } = require("uuid");
const sockets = new Map();
io.on("connection", (socket) => {
	const id = "";
	do {
		id = v4();
	} while (sockets.has(id));
	socket.emit("");
	console.log("a user connected");
});
