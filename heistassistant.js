/*
Developed by Harmiox to assist redbot's heist cog.
http://harmiox.com/development
*/

//Requirements
const Discord = require("discord.js");
const client = new Discord.Client();
var fs = require('fs');
var jsonFile = 'heistassistant.json'
//Get's the login token from json file and than logs in the bot.
fs.readFile(jsonFile, function read(err, data) {
    if (err) {
        throw err;
    }
    let json = JSON.parse(data);
    if (!json) {
		console.log("Could not parse json file!")
		return;
	}
	client.login(json.token);
});

//The json object that stores everything.
let json = null;

function getJsonSync() {
	return JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
}
function updateJsonSync(json) {
	fs.writeFileSync(jsonFile, JSON.stringify(json, null, "\t"), 'utf8');
}
function startHeist(heistId,message,json) {
    console.log(`${message.author.username} started heist ${id}.`);
    json.heists[heistId] = {
        id:heistId,
        owe:0,
        won:false,
        crew: []
    }
    addCrew(heistId,message,json);
}
function endHeist(id,message,json) {
    console.log(`The heist ${id} has ended.`);
    json.active = false;
    updateJsonSync(json);
}
function addCrew(id,message,json) {
    console.log(`Adding ${message.author.username} to the crew for heist ${id}.`);
    json.heists[id].crew.push(message.author);
    updateJsonSync(json);
}
function calculatePayouts(id,message,json) {
    console.log(`Calculating payouts...`);
}
function splitPayment(id,amount,message,json) {
    console.log(`Splitting payment...`);
}
client.on("message", (message) => {
    if (message.channel.name === "heist" && (message.content.startsWith("!") || message.author.id === "286626550076407810")) {
        let json = getJsonSync();
        if (message.content.startsWith("!heist play") || message.content.startsWith("!hplay")) {
            if (json.active === true) {
                const filter = m => (m.author.id === 286626550076407810 && m.content.match(message.author.username));
                msg.channel.awaitMessages(filter, {max: 1,time: 30000,errors: ['time']}).then(() => {
                    addCrew(json.current,message);
                }).catch(() => {});
            } else if (json.active === false) {
                const filter = m => (m.author.id === 286626550076407810 && m.content.match(message.author.username));
                msg.channel.awaitMessages(filter, {max: 1,time: 30000,errors: ['time']}).then(() => {
                    json.active = true;
                    json.current = json.heists.length;
                    startHeist(json.current,message);
                }).catch(() => {});
            }
        } else if (message.content.match("No one made it out safe.") && message.author.id === "286626550076407810") {
            endHeist(json.current,message);
        } else if (message.content.match("The credits collected from the vault was split among the winners") && message.author.id === "286626550076407810") {
            console.log("Heist was successful! Calculating payments.");
            calculatePayouts(json.current,message);
        } else if (message.content.startsWith("!hpay")) {
            let id = message.content.split(" ")[1];
            let amount = message.content.split(" ")[2];
            if (!id) return;
            if (!amound return;)
            if (!json.heists[id]) return;
            const filter = m => (m.author.id === "286626550076407810" && m.content.match(client.user.username) && m.content.match(amount));
            msg.channel.awaitMessages(filter, {max: 1,time: 30000,errors: ['time']}).then(() => {
                console.log(`Payment received, splitting between crew for heist ${id}`);
                splitPayment(id,amount,message);
            }).catch(() => {});
        }
     }
});
process.on("unhandledRejection", err => {
	console.error("Uncaught Promise Error: \n" + err.stack);
});
