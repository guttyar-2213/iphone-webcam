const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const fs = require("fs");
const cors = require("cors");
const crypto = require("crypto");
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

const ident = (str, algorithm, encoding) =>
	crypto
		.createHash(algorithm || "md5")
		.update(str, "utf8")
		.digest(encoding || "hex");
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
				console.log("reset values");
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
	const ident = checksum(JSON.stringify(d.value), "sha1");
	console.log(d.type, "connected", d.value && d.value.length, ident);
	if (d.type == "fetch") {
		await wait3();
		res.status(200).send(JSON.stringify({ type: "ok", value: server }));
		console.log(d.type, "send 200", ident);
		return;
	}
	if (d.type == "client") {
		if (client) {
			res.status(409).send(JSON.stringify({ type: "error", value: "Preceding visitor" }));
			console.log(d.type, "send 409", ident);
			return;
		}
		client = d.value;
		console.log(d.type, "set client-side value", ident);
	}
	if (d.type == "server") {
		if (server) {
			res.status(409).send(JSON.stringify({ type: "error", value: "Preceding visitor" }));
			console.log(d.type, "send 409", ident);
			return;
		}
		server = d.value;
		console.log(d.type, "set server-side value", ident);
	}
	await wait();
	res.status(200).send(JSON.stringify({ type: "ok", value: d.type == "client" ? server : client }));
	if (d.type == "client") {
		cs = true;
		console.log(d.type, "end client proc, wait server proc...", ident);
	}
	if (d.type == "server") {
		ss = true;
		console.log(d.type, "end server proc, wait client proc...", ident);
	}
	await wait2();
	console.log(d.type, "connection closed", ident);
});

// app.listen(5000, "0.0.0.0");
https.createServer(ssl, app).listen(5000, "0.0.0.0");
