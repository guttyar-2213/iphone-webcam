const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const fs = require("fs");
const app = express();
const ssl = {
	key: fs.readFileSync("/Users/Nagase/Desktop/oreore/server.key"),
	cert: fs.readFileSync("/Users/Nagase/Desktop/oreore/server.crt"),
};

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
const wait3 = () =>
	new Promise((r) => {
		const id = setInterval(() => {
			if (server) {
				clearInterval(id);
				r();
			}
		}, 100);
	});

app.post("/", async (req, res) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	console.log(req.body);
	const d = req.body;
	if (d.type == "fetch") {
		await wait3();
		res.send(JSON.stringify({ type: "ok", value: server }));
		return;
	}
	if (d.type == "client") {
		if (client) {
			res.send(JSON.stringify({ type: "error", value: "Preceding visitor" }));
			return;
		}
		client = d.value;
	}
	if (d.type == "server") {
		if (server) {
			res.send(JSON.stringify({ type: "error", value: "Preceding visitor" }));
			return;
		}
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

https.createServer(ssl, app).listen(5000, "0.0.0.0");
