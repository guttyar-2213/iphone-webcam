const eventPromise = (target, type, callback) =>
	new Promise((r) =>
		target.addEventListener(type, (e) => {
			callback(e, r);
		})
	);
