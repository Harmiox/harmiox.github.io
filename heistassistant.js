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
    console.log(`Calculating payouts for heist ${id}.`);
}
function splitPayment(id,amount,message,json) {
    console.log(`Splitting the payment of ${amount} to the crew of heist ${id}.`);
}
function refundPayment(amount,message) {
    console.log(`Refunding the payment of ${amount}.`);
}
function getAlias(id,amount,message) {
    console.log(`Adding alias for heist ${id}.`)
    let returnMsg = "error"
    let channel = message.guild.channels.find(chan => chan.name === "bot-log");
    if (!channel) {
        message.channel.sendMessage(`[ERROR] The channel to manage alias's could not be found. Please contact Harmiox.`);
        return;
    }
    let alias = (`!alias add h${id} bank transfer ${client.user.username} ${amount}`); //269324997691047936
    channel.sendMessage(alias).then(() => {
        returnMsg = (`!hpay ${id} ${client.user.username}`);
        const filter = m => (m.author.id === "286626550076407810");
        msg.channel.awaitMessages(filter, {max: 1,time: 30000,errors: ['time']}).then(function(collection) {
            collection.first().delete();
            message.delete();
        }).catch(() => {});
    });
    return (returnMsg);
}
function deleteAlias(id,amount,message) {
    console.log(`Deleting alias for heist ${id}.`);
    let channel = message.guild.channels.find(chan => chan.name === "bot-log");
    if (!channel) {
        message.channel.sendMessage(`[ERROR] The channel for behind the scenes actions could not be found. Please contact Harmiox.`);
        return;
    }
    let alias = (`!alias del h${id}`); //269324997691047936
    channel.sendMessage(alias).then(() => {
        const filter = m => (m.author.id === "286626550076407810");
        msg.channel.awaitMessages(filter, {max: 1,time: 30000,errors: ['time']}).then(function(collection) {
            collection.first().delete();
            message.delete();
        }).catch(() => {});
    });
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
        } else if (message.content.startsWith("!h")) {
            let valid = false;
            let id = message.content.split(" ")[0].replace("!h","");
            if (!json.heists[id]) {
                message.channel.reply("You did not give a valid heist id. If I receive credits they'll be sent back to you.");
                return;
            } else {
                valid = true;
            }
            const filter = m => (m.author.id === "286626550076407810" && m.content.match(client.user.username) && (parseInt(m.content.split(" ")[0]) >= 0));
            msg.channel.awaitMessages(filter, {max: 1,time: 30000,errors: ['time']}).then(function(collection) {
                let amount = parseInt(collection.first().content.split(" ")[0]);
                if (valid === true) {
                    splitPayment(id,amount,message);
                } {
                    refudPayment(id,amount,message);
                }
            }).catch(() => {});
        }
     }
});
process.on("unhandledRejection", err => {
	console.error("Uncaught Promise Error: \n" + err.stack);
});
