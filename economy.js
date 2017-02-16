//Global Functions
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function readFile(theFile) {
    fs = require('fs');
    let data = fs.readFileSync(theFile).toString();
    return data;
}

function writeFile(theFile, fileData) {
    var fs = require('fs');
    fs.writeFileSync(theFile, fileData);
}

function getEconomyJson() {
    let economyJson = JSON.parse(readFile("./cogs/economy.json"));
    return economyJson;
}

function userRarity(user) {
    //TODO
}

function chestLevel(amount) {
    let economyJson = getEconomyJson();
    let chestLevel = "`Error`"
    for (var chest in economyJson.chests) {
        if (economyJson.chests.hasOwnProperty(chest)) {
            if (amount >= (economyJson.gemDollarValue * economyJson.chests[chest])) {
                chestLevel = chest;
                continue;
            } else {
                break;
            }
        }
    }
    return chestLevel;
}
var economy = function() {
    var self = this;
    self.onMsg = function(msg) {
        let prefix = "!";
        //if (!msg.member.roles.has(msg.guild.roles.get('179663615182241792'))){return;}
        if (msg.content.startsWith(prefix + "chest")) {
            let economyJson = getEconomyJson();
            let args = msg.content.split(" ");
            if (args.length == 1) {
                if (!economyJson.vaults[msg.author.id]) {
                    msg.channel.sendMessage(msg.author + " you don't own a chest, use `!chest open` to open a chest!");
                    return;
                }
                msg.channel.sendMessage(msg.author + " your " + chestLevel(economyJson.vaults[msg.author.id].amount) + " currently holds **" + numberWithCommas(economyJson.vaults[msg.author.id].amount) + "** gems.");
            }
            if (args.length >= 2) {
                if (args[1] === "open") {
                    if (economyJson.vaults[msg.author.id]) {
                        msg.channel.sendMessage(msg.author + " you already own a chest!");
                        return;
                    }
                    economyJson.vaults[msg.author.id] = {
                        "amount": 0
                    };
                    writeFile("./cogs/economy.json", JSON.stringify(economyJson, null, "\t"));
                    msg.channel.sendMessage(msg.author + " you've successfully opened up a chest!");
                } else if (args[1] === "transfer") {
                    if (args.length === 4) {
                        if (!args[2].startsWith("<@")) {
                            msg.channel.sendMessage(msg.author + " Example: `!chest transfer @user 10000`");
                            return;
                        }
                        let toSend = msg.mentions.users.first();
                        if (!toSend) {
                            msg.channel.sendMessage(msg.author + " Example: `!chest transfer @user 10000`");
                            return;
                        }
                        if (!economyJson.vaults[msg.author.id]) {
                            msg.channel.sendMessage(msg.author + " you don't own a chest, use `!chest open` to open a chest!");
                            return;
                        }
                        if (!economyJson.vaults[toSend.id]) {
                            msg.channel.sendMessage(msg.author + " that user does not own a chest!");
                            return;
                        }
                        if (parseInt(args[3]) > economyJson.vaults[msg.author.id].amount) {
                            msg.channel.sendMessage(msg.author + " you don't have that amount of gems in your chest!");
                            return;
                        }
                        if (parseInt(args[3]) <= 0) {
                            msg.channel.sendMessage(msg.author + " you must transfer at least **1** gem.");
                            return;
                        }
                        economyJson.vaults[msg.author.id].amount -= parseInt(args[3]);
                        economyJson.vaults[toSend.id].amount += parseInt(args[3]);
                        writeFile("./cogs/economy.json", JSON.stringify(economyJson, null, "\t"));
                        msg.channel.sendMessage(msg.author + " the transfer of **" + parseInt(args[3]) + "** gems to " + toSend.username + " was successful");
                    } else {
                        msg.channel.sendMessage("Invalid Use `!chest transfer @user <amount>`");
                    }
                } else if (args[1].startsWith("<@") || args[1].startsWith("<@!")) {
                    let toSend = msg.mentions.users.first();
                    if (!toSend) {
                        msg.channel.sendMessage(msg.author + " Example: `!chest @user`");
                        return;
                    }
                    if (!economyJson.vaults[toSend.id]) {
                        msg.channel.sendMessage(msg.author + " that user does not own a chest!");
                        return;
                    }
                    msg.channel.sendMessage(toSend.username + "'s " + chestLevel(economyJson.vaults[toSend.id].amount) + " currently holds **" + numberWithCommas(economyJson.vaults[toSend.id].amount) + "** gems.");
                } else if (args[1] === "set") {
                    //TODO - Role Permissions
                    if (args.length === 4) {
                        if (!args[2].startsWith("<@")) {
                            msg.channel.sendMessage(msg.author + " **User Not Given**, Ex: `!chest set @user 10000`");
                            return;
                        }
                        let toSend = msg.mentions.users.first();
                        if (!toSend) {
                            msg.channel.sendMessage(msg.author + " **Invalid User**, Ex: `!chest set @user 10000`");
                            return;
                        }
                        if (!economyJson.vaults[toSend.id]) {
                            msg.channel.sendMessage(msg.author + " that user does not own a chest!");
                            return;
                        }
                        if (parseInt(args[3]) <= -1) {
                            msg.channel.sendMessage(msg.author + " you must set the chest to at least **0** gems.");
                            return;
                        }
                        economyJson.vaults[toSend.id].amount = parseInt(args[3]);
                        writeFile("./cogs/economy.json", JSON.stringify(economyJson, null, "\t"));
                        msg.channel.sendMessage(toSend.username + " " + chestLevel(economyJson.vaults[toSend.id].amount) + " has been set to **" + parseInt(args[3]) + "** gems.");
                    } else {
                        msg.channel.sendMessage("Invalid Use `!chest set @user <amount>`");
                    }
                } else if (args[1] === "add") {
                    //TODO - Role Permissions
                    if (args.length === 4) {
                        if (!args[2].startsWith("<@")) {
                            msg.channel.sendMessage(msg.author + " Example: `!chest set @user 10000`");
                            return;
                        }
                        let toSend = msg.mentions.users.first();
                        if (!toSend) {
                            msg.channel.sendMessage(msg.author + " Example: `!chest set @user 10000`");
                            return;
                        }
                        if (!economyJson.vaults[toSend.id]) {
                            msg.channel.sendMessage(msg.author + " that user does not own a chest!");
                            return;
                        }
                        if (parseInt(args[3]) <= -1) {
                            msg.channel.sendMessage(msg.author + " you must set the chest to at least **0** gems.");
                            return;
                        }
                        economyJson.vaults[toSend.id].amount += parseInt(args[3]);
                        writeFile("./cogs/economy.json", JSON.stringify(economyJson, null, "\t"));
                        msg.channel.sendMessage("**" + parseInt(args[3]) + "** gems have been added to " + toSend.username + "'s " + chestLevel(economyJson.vaults[toSend.id].amount));
                    } else {
                        msg.channel.sendMessage("Invalid Use `!chest set <@user> <amount>`");
                    }
                } else if (args[1] === "delete") {
                    //TODO - Role Permissions
                    if (args.length === 3) {
                        if (!args[2].startsWith("<@")) {
                            msg.channel.sendMessage(msg.author + " Example: `!chest delete @user`");
                            return;
                        }
                        let toSend = msg.mentions.users.first();
                        if (!toSend) {
                            msg.channel.sendMessage(msg.author + " Example: `!chest delete @user`");
                            return;
                        }
                        if (!economyJson.vaults[toSend.id]) {
                            msg.channel.sendMessage(msg.author + " that user does not own a chest!");
                            return;
                        }
                        msg.channel.sendMessage(msg.author + " are you sure you'd like to delete **" + toSend.username + "'s** chest? Say `yes` to continue.");
                        const filter = m => (m.content.match("yes") && m.author.id === msg.author.id);
                        msg.channel.awaitMessages(filter, {
                                max: 1,
                                time: 5000,
                                errors: ['time']
                            })
                            .then(function() {
                                delete economyJson.vaults[toSend.id];
                                writeFile("./cogs/economy.json", JSON.stringify(economyJson, null, "\t"));
                                msg.channel.sendMessage("**" + toSend.username + "'s** chest has been deleted. **R.I.P.**");
                            })
                            .catch(function() {
                                msg.channel.sendMessage(msg.author + " you took too long to respond.");
                            });

                    } else {
                        msg.channel.sendMessage("Invalid Use, Ex: `!chest delete <@user>`");
                    }
                } else if (args[1] === "help") {
                    //TODO - Help
                } else {
                    msg.channel.sendMessage("Invalid Use");
                }
            }
        }
        if (msg.content.startsWith(prefix + "gems")) {
            let economyJson = getEconomyJson();
            let args = msg.content.split(" ");
            if (args.length < 2) {
                msg.channel.sendMessage("**Buy Gems:** `!gems <amountOfGems>`");
                return;
            }
            if (!economyJson.vaults[msg.author.id]) {
                msg.channel.sendMessage(msg.author + " you don't own a chest, use `!chest open` to open a chest!");
                return;
            }
            if (parseInt(args[1]) <= 0) {
                msg.channel.sendMessage("**Invalid Use** `<amountOfGems>` must be a value greater than 0.");
                return;
            }
            let gems = parseInt(args[1]);
            let credits = parseInt(gems * economyJson.gemCreditsValue);
            msg.channel.sendMessage(msg.author + " are you sure you'd like to trade **" + credits + "** credits for **" + gems + "** gems? If so, use `!pay @PrincessBot#9383 " + credits + "` trade your credits for gems.");


            const filter = m => (m.content.endsWith(credits + " credits have been transferred to " + msg.client.user.username + "'s account.") && m.author.id === '194525847565238272');
            msg.channel.awaitMessages(filter, {
                    max: 1,
                    time: 10000,
                    errors: ['time']
                })
                .then(function() {
                    economyJson.vaults[msg.author.id].amount += gems;
                    writeFile("./cogs/economy.json", JSON.stringify(economyJson, null, "\t"));
                    msg.channel.sendMessage(msg.author + " **" + gems + "** gems have been added to your " + chestLevel(economyJson.vaults[msg.author.id].amount) + ".");
                })
                .catch(function() {
                    msg.channel.sendMessage(msg.author + " you took too long.");
                });

        }
    };
};

module.exports = economy;
