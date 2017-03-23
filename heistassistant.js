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

client.on('ready', () => {
    console.log("Heist Assistant v2.0 Is Logged In!");
});

function getJsonSync() {
	return JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
}
function updateJsonSync(json) {
	fs.writeFileSync(jsonFile, JSON.stringify(json, null, "\t"), 'utf8');
}
function startHeist(heistId,message,json) {
    console.log("Started Heist!")
    json.heists[heistId] = {
        id:heistId,
        stolen:0,
        owed:0,
        won:false,
        crew: [],
        winners: [],
        losers: []
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
    let splitMessage = message.content.split("\n").slice(4);
    let totalStolen = 0;
    let winners = new Map();
    //Find the winners and how much each won.
    for (i = 0; i < splitMessage.length; i += 1) {
        if ((!splitMessage[i].match(/split/i)) && (!splitMessage[i].match(/-------/i)) && (!splitMessage[i].match(/```Python/i)) && (!splitMessage[i].match(/Criminals/i))) {
            let tempString = splitMessage[i].replace("```", "").replace(/\s+/g, ' ').trim();
            let parsedString = tempString.split(" ");
            //Add their winning to total amount stolen in heist
            totalStolen += parseInt(parsedString[1]);
            //username,winning
            winners.set(parsedString[0], parsedString[1]);
        }
    }
    //Amount of winners and losers
    let amountOfLosers = (json.heists[id].crew.size-winners.size);
    let amountOfWinners = winners.size;
    //How much each winner has to send to the bot.
    let payup = Math.floor((totalStolen * 0.75) / amountOfWinners);
    //Total owed between both winners.
    let totalOwed = ((totalStolen * 0.75) * amountOfWinners);

    //Update json
    json.heists[id].owed = totalOwed;
    json.heists[id].stolen = totalStolen
    json.heists[id].won = true;
    for (i = 0; i < json.heists[id].crew; i += 1) {
        console.log("i")
        if (winners.has(json.heists[id].crew[i].username)) {
            json.heists[id].winners.push(json.heists[id].crew[i].username);
        } else {
            json.heists[id].losers.push(json.heists[id].crew[i].username);
        }
    }
    endHeist(id,message,json);

    //Send out the command(alias) to split between crew.
    message.channel.sendMessage(`The command for splitting is: \`!h${id} ${getAlias(id,payup,message)}\`.`);
}
function splitPayment(id,amount,message,json) {
    console.log(`Splitting the payment of ${amount} to the crew of heist ${id}.`);
    for (losers in json.heists[id].losers) {
        message.guild.fetchMember(json.heists[id].losers[loser].id).then(member => {
            message.channel.sendMessage(`!pay ${member.user.id} ${Math.floor(((json.heists[id].stolen * 0.75)) / json.heists[id].losers.length)}`).then(() => {
                const filter = m => (m.author.id === "286626550076407810" && m.content.match(client.user.username) && (parseInt(m.content.split(" ")[0]) >= 0));
                message.channel.awaitMessages(filter, {max: 1,time: 30000,errors: ['time']}).then(function(collection) {
                    let amount = parseInt(collection.first().content.split(" ")[0]);
                    json.heists[id].owed -= amount;
                    if (json.heists[id].owed <= 0) {
                        deleteAlias(id,message);
                    }
                    updateJsonSync();
                }).catch(() => {});
            });
        })
    }
}
function refundPayment(amount,message) {
    console.log(`Refunding the payment of ${amount}.`);
    message.guild.fetchMember(message.author).then(member => {
        message.channel.sendMessage(`!pay ${member.user.id} ${amount}`);
    });
}
function getAlias(id,amount,message) {
    console.log(`Adding alias for heist ${id}.`)
    let returnMsg = "error"
    let channel = message.guild.channels.find(chan => chan.name === "bot-control");
    if (!channel) {
        message.channel.sendMessage(`[ERROR] The channel to manage alias's could not be found. Please contact Harmiox.`);
        return returnMsg;
    }
    let alias = (`!alias add h${id} bank transfer ${client.user.username} ${amount}`); //269324997691047936
    channel.sendMessage(alias).then(() => {
        returnMsg = (`!hpay ${id} ${client.user.username}`);
        const filter = m => (m.author.id === "286626550076407810");
        message.channel.awaitMessages(filter, {max: 1,time: 30000,errors: ['time']}).then(function(collection) {
            collection.first().delete();
            message.delete();
        }).catch(() => {});
    });
    return returnMsg;
}
function deleteAlias(id,message) {
    console.log(`Deleting alias for heist ${id}.`);
    let channel = message.guild.channels.find(chan => chan.name === "bot-log");
    if (!channel) {
        message.channel.sendMessage(`[ERROR] The channel for behind the scenes actions could not be found. Please contact Harmiox.`);
        return;
    }
    let alias = (`!alias del h${id}`); //269324997691047936
    channel.sendMessage(alias).then(() => {
        const filter = m => (m.author.id === "286626550076407810");
        message.channel.awaitMessages(filter, {max: 1,time: 30000,errors: ['time']}).then(function(collection) {
            collection.first().delete();
            message.delete();
        }).catch(() => {});
    });
}
client.on("message", (message) => {
    if (message.content.startsWith("!test")) {
        const filter = m => (m.author.id === "228781414986809344" && m.content.match(message.author.username));
        message.channel.awaitMessages(filter, {max: 1,time: 30000,errors: ['time']}).then(() => {
            message.channel.sendMessage("Is the best!");
        }).catch(() => {});
    }
    if (message.channel.name === "heist" && (message.content.startsWith("!") || message.author.id === "286626550076407810")) {
        let json = getJsonSync();
        if (message.content.startsWith("!heist play") || message.content.startsWith("!hplay")) {
            if (json.active === true) {
                console.log("true")
                const filter = m => ((m.author.id === "286626550076407810") && m.content.match(message.author.username));
                message.channel.awaitMessages(filter, {max: 1,time: 30000,errors: ['time']}).then(() => {
                    addCrew(json.current,message,json);
                }).catch(() => {});
            } else if (json.active === false) {
                console.log("false")
                const filter = m => ((m.author.id === "286626550076407810") && m.content.match(message.author.username));
                message.channel.awaitMessages(filter, {max: 1,time: 30000,errors: ['time']}).then(() => {
                    console.log("HEIST!");
                    json.active = true;
                    json.current = json.heists.length;
                    console.log(1)
                    message.channel.sendMessage(`The id for this heist is **${json.current}**.`);
                    startHeist(json.current,message,json);
                    console.log(2)
                }).catch(() => {});
            }
        } else if (message.content.match("You tried to rally a crew, but no one wanted to follow you. The heist has been cancelled.")) {
            console.log("cancel heist")
            endHeist(json.current,message,json);
        } else if (message.content.match("No one made it out safe.") && message.author.id === "286626550076407810") {
            console.log("endHeist")
            endHeist(json.current,message,json);
        } else if (message.content.match("The credits collected from the vault was split among the winners:") && message.author.id === "286626550076407810") {
            console.log("Heist was successful! Calculating payments.");
            calculatePayouts(json.current,message,json);
        } else if (message.content.startsWith("!h") && !message.content.startsWith("!heist play") && !message.content.startsWith("!hplay")) {
            let valid = false;
            let id = message.content.split(" ")[0].replace("!h","");
            if (!json.heists[id]) {
                message.reply("You did not give a valid heist id. If I receive credits they'll be sent back to you.");
                return;
            } else {
                valid = true;
            }
            const filter = m => (m.author.id === "286626550076407810" && m.content.match(client.user.username) && (parseInt(m.content.split(" ")[0]) >= 0));
            message.channel.awaitMessages(filter, {max: 1,time: 30000,errors: ['time']}).then(function(collection) {
                let amount = parseInt(collection.first().content.split(" ")[0]);
                if (valid === true) {
                    splitPayment(id,amount,message,json);
                } {
                    refundPayment(id,amount,message);
                }
            }).catch(() => {});
        }
     }
});
process.on("unhandledRejection", err => {
	console.error("Uncaught Promise Error: \n" + err.stack);
});
