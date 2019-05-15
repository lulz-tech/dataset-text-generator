#!/usr/local/bin/node

const argv = require("minimist")(process.argv.slice(2));

const launchInstanceMode = require("./src/instance");
const launchServerMode = require("./src/server");

const launchWithMode = {
    "instance": launchInstanceMode,
    "microservice": launchServerMode
};

if (!argv.mode ||
    ["instance", "microservice"].indexOf(argv.mode) === -1 ||
    (argv.mode === "instance" && (!argv.login || !argv.password || !argv.out || !argv.groupId)) ||
    (argv.mode === "microservice" && (!argv.port))) {
    console.log(`
Scrap posts from vk groups (by LulzTech)

Usage: node app.js [options]
        
Options:
--mode: "instance" for offline mode or "microservice" for server mode (required)
--port Port number for microservice (required if --mode=microservice)
--login VK Login (required if --mode=instance)
--password VK Password (required if --mode=instance)
--out Output filename (required if --mode=instance)
--groupId ID of group or user to parse (required if --mode=instance)

Example:
node app.js --mode=instance --login=+79111111111 --password=1234 --out=dataset.txt --groupId=-1
node app.js --mode=microservice --port=8080
`);
    process.exit(0);
}

launchWithMode[argv.mode](argv);
