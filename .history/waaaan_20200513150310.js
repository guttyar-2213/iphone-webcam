const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const fs = require("fs");
const cors = require("cors");
const app = express();
const ssl = {
	key: fs.readFileSync("/Users/Nagase/Desktop/oreore/server.key"),
	cert: fs.readFileSync("/Users/Nagase/Desktop/oreore/server.crt"),
};

app.use(cors());
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
	const d = JSON.parse(req.body.v);
	console.log(d.type, d.value && d.value.length);
	if (d.type == "fetch") {
		await wait3();
		res.status(200).send(JSON.stringify({ type: "ok", value: server }));
		return;
	}
	if (d.type == "client") {
		if (client) {
			res.status(409).send(JSON.stringify({ type: "error", value: "Preceding visitor" }));
			return;
		}
		client = d.value;
	}
	if (d.type == "server") {
		if (server) {
			res.status(409).send(JSON.stringify({ type: "error", value: "Preceding visitor" }));
			return;
		}
		server = d.value;
	}
	await wait();
	res.status(200).send(JSON.stringify({ type: "ok", value: d.type == "client" ? server : client }));
	if (d.type == "client") {
		cs = true;
	}
	if (d.type == "server") {
		ss = true;
	}
	await wait2();
});

// app.listen(5000, "0.0.0.0");
https.createServer(ssl, app).listen(5000, "0.0.0.0");
