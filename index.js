const io = require("socket.io")(5000);
io.on("connection", (socket) => {
	console.log("a user connected");
});
