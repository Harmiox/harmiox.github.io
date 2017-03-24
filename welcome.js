const Discord = require("discord.js");
const db = require('sqlite');
function getCommands() {
    let commands = {
        "welcome": {
            "description": "`?welcome`",
        },
        "welcome test": {
            "description": "`!logger channel <channel>`",
        },
        "welcome channel": {
            "description": "`!logger channel <channel>`",
        },
        "welcome toggle": {
            "description": "`!logger toggle`",
        },
        "welcome add": {
            "description": "`!logger toggle`",
        },
        "welcome del": {
            "description": "`!logger toggle`",
        },
        "welcome list": {
            "description": "`!logger toggle`",
        }
    }
    return commands;
}
function addMsg(message,command) {
    if (!message.content.split(" ")[2]) {
        message.channel.sendMessage("You did not give a message to add to the list.");
        return;
    }
    let welcomeMsg = message.content.split(" ").slice(2).join(" ");
    db.run('INSERT INTO welcome_messages (guildId, message) VALUES (?, ?)', [message.guild.id,welcomeMsg]).then(() => {
        message.channel.sendMessage(`Your message was successfully added to the list! Here's what it looks like:\n\n${welcomeMsg.replace(/\$member/g,message.author)}`);
    }).catch((err) => {console.log(err);message.channel.sendMessage(`\`${err}\``)});
}
function delMsg(message,command) {
    let id = message.content.split(" ")[2];
    if (!id) {
        message.channel.sendMessage("You did not give a message id to delete from the list.");
        viewMsgs(message,command);
        return;
    }
    db.all(`SELECT * FROM welcome_messages WHERE guildId =?`,[message.guild.id]).then(rows => {
        if (!rows) {
            message.channel.sendMessage("You didn't add any welcome message!");
            return;
        }
        db.get(`DELETE FROM welcome_messages WHERE guildId =? AND message =?`,[message.guild.id,rows[id].message]).then(row => {
            message.channel.sendMessage("That message has successfully been removed from the list.");
        }).catch(err => console.log(err));
    }).catch((err) => {console.log(err);message.channel.sendMessage(`\`${err}\``)})
}
function viewMsgs(message,command) {
    db.all(`SELECT * FROM welcome_messages WHERE guildId =?`,[message.guild.id]).then(rows => {
        if (!rows) {
            message.channel.sendMessage("You didn't add any welcome message!");
            return;
        }
        let returnMessage = "```Markdown\nWelcome Messages:\n"
        let count = 0;
        for (let row in rows) {
            returnMessage += `\n${count}. ${rows[row].message}`
            count += 1;
        }
        returnMessage += "\n```"
        message.channel.sendMessage(returnMessage);
    }).catch((err) => {console.log(err);message.channel.sendMessage(`\`${err}\``)})
}
function testMsg(message,command) {
    db.get(`SELECT * FROM welcome_settings WHERE guildId =?`,[message.guild.id]).then(row => {
        if (!row) {
            db.run('INSERT INTO welcome_settings (guildId) VALUES (?)', [message.guild.id]).then(() => {
                testMsg(message,command);
            });
            return;
        }
        if (row.toggle === "false") {
            message.channel.sendMessage("You have the welcome cog turned off. Use `!welcome toggle` to turn it back on.");
            return;
        }
        if (!row.channelId) {
            message.channel.sendMessage("You have not set up a channel!");
            return;
        }
        let channel = message.guild.channels.find(chan => chan.id === row.channelId);
        if (!channel) {
            message.channel.sendMessage("I could not find the channel that was set. Maybe it was modified or deleted?");
            return;
        }
        db.all(`SELECT * FROM welcome_messages WHERE guildId =?`,[message.guild.id]).then(rows => {
            if (rows.length === 0 || !rows) {
                message.channel.sendMessage("You do not have any welcome messages set. Use `!welcome add <message>` to add a welcome message.");
                return;
            }
            let msgId = Math.floor(Math.random() * (rows.length));
            console.log("length: " + rows.length);
            console.log("id: " + msgId)
            channel.sendMessage(rows[msgId].message.replace(/\$member/g,message.author)).then(() => {
                message.channel.sendMessage(`I've sent a test welcome message to ${channel}`);
            });
        }).catch((err) => {console.log(err);message.channel.sendMessage(`\`${err}\``)})
    }).catch(err => {console.log(err);message.channel.sendMessage(`\`${err}\``)})
}
function setChannel(message,command) {
    db.get(`SELECT * FROM welcome_settings WHERE guildId =?`,[message.guild.id]).then(row => {
        if (!row) {
            db.run('INSERT INTO welcome_settings (guildId) VALUES (?)', [message.guild.id]).then(() => {
                setChannel(message,command);
            });
            return;
        }
        let channel = message.mentions.channels.first();
        if (!channel) {
            message.channel.sendMessage("You did not give channel to set. `!welcome channel #general`");
            return;
        }
        db.run(`UPDATE welcome_settings SET channelId =? WHERE guildId =?`,[channel.id,message.guild.id]).then(() => {
            message.channel.sendMessage(`The channel for welcome messages has been set to ${channel}. You can test by using; \`!welcome test\``);
        }).catch(err => {console.log(err);message.channel.sendMessage(`\`${err}\``)})
    }).catch(err => {console.log(err);message.channel.sendMessage(`\`${err}\``)})
}
function setToggle(message,command) {
    db.get(`SELECT * FROM welcome_settings WHERE guildId =?`,[message.guild.id]).then(row => {
        if (!row) {
            db.run('INSERT INTO welcome_settings (guildId) VALUES (?)', [message.guild.id]).then(() => {
                setToggle(message,command);
            });
            return;
        }
        if (!row.toggle || row.toggle === "true") {
            db.run(`UPDATE welcome_settings SET toggle =? WHERE guildId =?`,["false",message.guild.id]).then(() => {
                message.channel.sendMessage(`The welcome cog has been toggled to off.`);
            });
        } else {
            db.run(`UPDATE welcome_settings SET toggle =? WHERE guildId =?`,["true",message.guild.id]).then(() => {
                message.channel.sendMessage(`The welcome cog has been toggled to on.`);
            });
        }
    }).catch(err => {console.log(err);message.channel.sendMessage(`\`${err}\``)})
}
function sendMsg(member) {
    db.get(`SELECT * FROM welcome_settings WHERE guildId =?`,[member.guild.id]).then(row => {
        if (!row) {
            console.log("!row")
            return;
        }
        if (!row.toggle || row.toggle === "false") {
            console.log("||")
            return;
        }
        if (!row.channelId) {
            console.log("channelId")
            return;
        }
        let channel = member.guild.channels.find(chan => chan.id === row.channelId);
        if (!channel) {
            console.log("!channel")
            return;
        }
        db.all(`SELECT * FROM welcome_messages WHERE guildId =?`,[member.guild.id]).then(rows => {
            if (rows.length === 0 || !rows) {
                console.log("0")
                return;
            }
            let msgId = Math.floor(Math.random() * (rows.length));
            channel.sendMessage(rows[msgId].message.replace(/\$member/g,member));
        }).catch((err) => {console.log(err);})
    }).catch(err => {console.log(err);});
}
var welcome = function() {
    var self = this;
    self.guildMemberAdd = function(member,client) {
        sendMsg(member);
    }
    self.onCmd = function(cmd,msg,client) {
        if (cmd === "welcome") {
            msg.channel.sendMessage("`?welcome`");
        }
        if (cmd === "welcome add") {
            addMsg(msg,cmd);
        }
        if (cmd === "welcome del") {
            delMsg(msg,cmd);
        }
        if (cmd === "welcome list") {
            viewMsgs(msg,cmd);
        }
        if (cmd === "welcome test") {
            testMsg(msg,cmd);
        }
        if (cmd === "welcome channel") {
            setChannel(msg,cmd);
        }
        if (cmd === "welcome toggle") {
            setToggle(msg,cmd);
        }
    }
    //Don't touch these!
    self.load = function(database) {
        self.db = database;
    }
    self.loadPerms = function(msg) {
        console.log("loading");
        let commands = getCommands();
        for (let command in commands) {
            let cmd = commands[command];
            db.get(`SELECT * FROM permissions WHERE guildId ='${msg.guild.id}' AND command ='${command}'`).then(row => {
                if (!row) {
                    db.run('INSERT INTO permissions (guildId, command, description, type, sends, alias, cooldown, roles, users, channels) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [msg.guild.id, command, cmd.description, cmd.type, cmd.sends, cmd.alias, cmd.cooldown, cmd.roles, cmd.users, cmd.channels]).then(() => {
                    });
                }
            });
        }
        db.run('CREATE TABLE IF NOT EXISTS welcome_settings (guildId TEXT, channelId TEXT, toggle TEXT)').then(() => {
            db.run('CREATE TABLE IF NOT EXISTS welcome_messages (guildId TEXT, message TEXT)').then(() => {
                msg.channel.sendMessage("`welcome.js` has been enabled!");
            }).catch((err) => {
                console.log(err);
                msg.channel.sendMessage(`\`${err}\``);
            });
        }).catch((err) => {
            console.log(err);
            msg.channel.sendMessage(`\`${err}\``);
        });
    }
}
process.on("unhandledRejection", err => {
    console.error("Uncaught Promise Error: \n" + err.stack);
});
module.exports = welcome;
