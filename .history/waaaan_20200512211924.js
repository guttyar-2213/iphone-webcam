const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
app.use(bodyParser.json());

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
				client = null;
				server = null;
				cs = false;
				ss = false;
				r();
			}
		}, 100);
	});

app.post("/", async (req, res) => {
	console.log(req.body);
	const d = req.body;
	if (d.type == "client") {
		if (client) res.send(JSON.stringify({ type: "error", value: "Preceding visitor" }));
		client = d.value;
	}
	if (d.type == "server") {
		if (server) res.send(JSON.stringify({ type: "error", value: "Preceding visitor" }));
		server = d.value;
	}
	await wait();
	res.send(JSON.stringify({ type: "ok", value: d.type == "client" ? server : client }));
	if (d.type == "client") {
		cs = true;
	}
	if (d.type == "server") {
		ss = true;
	}
	await wait2();
});

app.listen(5000, "0.0.0.0");
