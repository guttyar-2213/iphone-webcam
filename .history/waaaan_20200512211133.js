const express = require("express");
const app = express();

let client = null;
let server = null;
let cs = false;
let ss = false;

const wait = () =>
	new Promise((r) => {
		const id = setInterval(() => {
			if (client && server) {
				clearInterval(id);
				r();
			}
		}, 100);
	});
const wait2 = () =>
	new Promise((r) => {
		const id = setInterval(() => {
			if (cs && ss) {
				clearInterval(id);
				r();
			}
		}, 100);
	});

app.post("/", async (req, res) => {
	console.log(req.body);
	const d = JSON.parse(req.body);
	if (d.type == "client") {
		client = d.value;
	}
	if (d.type == "server") {
		server = d.value;
	}
	await wait();
	res.send(d.type == "client" ? server : client);
	if (d.type == "client") {
		cs = true;
	}
	if (d.type == "server") {
		ss = true;
	}
	await wait2();
});

app.listen(5000, "0.0.0.0");
