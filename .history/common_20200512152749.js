const eventPromise = (target, type, callback) =>
	new Promise((r) =>
		target.addEventListener(type, (e) => {
			callback(e, r);
		})
	);

const onPromise = (socket, type, callback) => new Promise((r) => socket.on(type, (d) => callback(d, r)));
