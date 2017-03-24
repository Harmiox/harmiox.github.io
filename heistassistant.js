/*
Developed by Harmiox to assist redbot's heist cog.
http://harmiox.com/development
*/

//Requirements
const Discord = require("discord.js");
const client = new Discord.Client();
var fs = require('fs');
var jsonFile = 'heistassistant.json'

//Cleverbot
const Cleverbot = require('cleverbot');
let clev = new Cleverbot({
    key: 'clashroyale'
});

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
    endHeist(getJsonSync());
    json = getJsonSync();
    console.log("Heist Assistant v2.0 Is Logged In!");
});

function getJsonSync() {
	return JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
}
function updateJsonSync(json) {
	fs.writeFileSync(jsonFile, JSON.stringify(json, null, "\t"), 'utf8');
    json = getJsonSync();
}
function startHeist(heistId,message,json) {
    json.heists[heistId] = {
        id:heistId,
        stolen:0,
        owed:0,
        won:false,
        crew: [],
        winners: [],
        losers: []
    }
    console.log("Heist Started");
    addCrew(heistId,message,json);
}
function endHeist(json) {
    json.active = false;
    updateJsonSync(json);
    console.log(`The heist has ended.`);
}
function addCrew(id,message,json) {
    let exists = false;
    for (let i=0;i<json.heists[id].crew.length;i+=1) {
        if (json.heists[id].crew[i].id === message.author.id) {
            exists = true;
        }
    }
    if (exists === false) {
        json.heists[id].crew.push(message.author);
        message.react('✅');
        console.log(`Added ${message.author.username} to the crew for heist ${id}.`);
    }
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
            let winner = parsedString.slice(0,parsedString.length-3).join(" ");
            let winning = parsedString[parsedString.length-1];
            //Add their winning to total amount stolen in heist
            totalStolen += parseInt(winning);
            //username,winning
            winners.set(winner, winning);
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
    for (i=0; i<json.heists[id].crew.length;i+=1) {
        if (winners.has(json.heists[id].crew[i].username)) {
            json.heists[id].winners.push(json.heists[id].crew[i].id);
            console.log("Added winner: " + json.heists[id].crew[i].username);
        } else {
            json.heists[id].losers.push(json.heists[id].crew[i].id);
            console.log("Added loser: " + json.heists[id].crew[i].username);
        }
    }
    console.log("Each winner pays up: " + payup);
    console.log("Total Stolen: " + totalStolen)
    endHeist(json);
    //Send out the command(alias) to split between crew.
    if (json.heists[id].crew.size != winners.size) {
        message.channel.sendMessage(`If you won credits and would like to split with those who didn't, use the command: \`${getAlias(id,payup,message)}\`.`);
    }
}
function splitPayment(id,message,json,losers,split) {
    if (losers.length === 0) {
        updateJsonSync(json);
        console.log("Payment was split between the crew.")
    } else {
        let loser = losers.pop();
        message.guild.fetchMember(loser).then(member => {
            message.channel.sendMessage(`!pay ${member.user.id} ${split}`).then(sentMsg => {
                sentMsg.delete();
            });
            const filter = m => (m.author.id === "286626550076407810" && m.content.match(member.user.username) && (parseInt(m.content.split(" ")[0]) >= 0));
            message.channel.awaitMessages(filter, {max: 1,time: 30000,errors: ['time']}).then(function(collection) {
                splitPayment(id,message,json,losers,split);
            }).catch(() => {
                splitPayment(id,message,json,losers,split);
            });
        }).catch(err => console.log(err));
    }
}
function refundPayment(amount,message) {
    message.guild.fetchMember(message.author).then(member => {
        message.channel.sendMessage(`!pay ${member.user.id} ${amount}`).then(sentMsg => {
            sentMsg.delete();
        });
        console.log(`Refunded the payment of ${amount}.`);
    });
}
function getAlias(id,amount,message) {
    let returnMsg = "error"
    let channel = message.guild.channels.find(chan => chan.name === "bot-control");
    if (!channel) {
        message.channel.sendMessage(`[ERROR] The channel to manage alias's could not be found. Please contact Harmiox.`);
        return returnMsg;
    }
    let alias = (`!alias add h${id} bank transfer ${client.user.username} ${amount}`);
    channel.sendMessage(alias).then(msg => {
        const filter = m => (m.author.id === "286626550076407810" && m.channel.name === "bot-control");
        message.channel.awaitMessages(filter, {max: 1,time: 30000,errors: ['time']}).then(function(collection) {
            collection.first().delete();
            msg.delete();
        }).catch(() => {});
    });
    returnMsg = (`!h${id}`);
    console.log(`Added the alias.`)
    return returnMsg;
}
function deleteAlias(id,message) {
    let channel = message.guild.channels.find(chan => chan.name === "bot-log");
    if (!channel) {
        message.channel.sendMessage(`[ERROR] The channel for behind the scenes actions could not be found. Please contact Harmiox.`);
        return;
    }
    let alias = (`!alias del h${id}`); //269324997691047936
    channel.sendMessage(alias).then(msg => {
        console.log(`Deleted the alias.`);
        const filter = m => (m.author.id === "286626550076407810");
        message.channel.awaitMessages(filter, {max: 1,time: 30000,errors: ['time']}).then(function(collection) {
            collection.first().delete();
            msg.delete();
        }).catch(() => {});
    });
}
client.on("message", (message) => {
    if ((message.content.startsWith("<@") || message.content.startsWith("<@!")) && message.isMentioned(client.user.id) && message.author.bot === false) {
        let msg = message.content.split(" ").slice(1).join(" ");
        clev.query(msg).then(function (response) {
            message.channel.sendMessage("`" + response.output + "`");
        });
    }
    if (message.channel.name === "heist" && (message.content.startsWith("!") || message.author.id === "286626550076407810")) {
        if (message.content.startsWith("!heist play") || message.content.startsWith("!hplay")) {
            if (json.active === true) {
                const filter = m => ((m.author.id === "286626550076407810") && m.content.match(message.author.username) && m.content.match("crew"));
                message.channel.awaitMessages(filter, {max: 1,time: 120000,errors: ['time']}).then(() => {
                    addCrew(json.current,message,json);
                }).catch(() => {});
            } else {
                const filter = m => ((m.author.id === "286626550076407810") && m.content.match(message.author.username) && m.content.match("crew"));
                message.channel.awaitMessages(filter, {max: 1,time: 120000,errors: ['time']}).then(() => {
                    if (json.active === false) {
                        json.active = true;
                        json.current = json.heists.length;
                        message.channel.sendMessage(`The id for this heist is **${json.current}**.`);
                        startHeist(json.current,message,json);
                    }
                }).catch(() => {});
            }
        } else if (message.content.match("You tried to rally a crew, but no one wanted to follow you. The heist has been cancelled.")) {
            message.channel.sendMessage("Looks like you couldn't pull off the heist. Better luck next time!");
            endHeist(json);
        } else if (message.content.match("No one made it out safe.") && message.author.id === "286626550076407810") {
            message.channel.sendMessage("Looks like you couldn't pull off the heist. Better luck next time!");
            endHeist(json);
        } else if (message.content.match("The credits collected from the vault was split among the winners:") && message.author.id === "286626550076407810") {
            console.log("Heist was successful!");
            calculatePayouts(json.current,message,json);
        } else if (message.content.startsWith("!h") && !message.content.startsWith("!heist") && !message.content.startsWith("!hplay")) {
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
                if (json.heists[id].owed <= 1) {
                    refundPayment(id,amount,message);
                } else {
                    let amount = parseInt(collection.first().content.split(" ")[0]);
                    if (valid === true) {
                        json.heists[id].owed -= amount;
                        if (json.heists[id].owed <= 1) {
                            deleteAlias(id,message);
                        }
                        let losersArray = [];
                        for (i=0; i<json.heists[id].losers.length;i+=1) {
                            losersArray.push(json.heists[id].losers[i]);
                        }
                        splitPayment(id,message,json,losersArray,Math.floor(((json.heists[id].stolen * 0.75)) / json.heists[id].losers.length));
                    } else {
                        refundPayment(id,amount,message);
                    }
                }
            }).catch(() => {});
        }
     }
});
process.on("unhandledRejection", err => {
	console.error("Uncaught Promise Error: \n" + err.stack);
});
