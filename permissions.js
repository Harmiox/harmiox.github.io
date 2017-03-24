const Discord = require("discord.js");
const db = require('sqlite');
function getCommands() {
    let commands = {
        "!p":{
            "description": '`!p <attribute> <command1 "command2 arg ..." command3>;<args>`',
            "type": "cog"
        },
        "!alias": {
            "description":"",
            "type": "cog"
        },
        "!alias add": {
            "description":"",
            "type": "cog"
        },
        "!alias del": {
            "description":"",
            "type": "cog"
        },
        "!alias edit": {
            "description":"",
            "type": "cog"
        },
        "!alias show": {
            "description":"",
            "type": "cog"
        },
        "!addcom": {
            "description":"",
            "type": "cog"
        },
        "!delcom": {
            "description":"",
            "type": "cog"
        },
        "!editcom": {
            "description":"",
            "type": "cog"
        }
    }
    return commands;
}
function getDefaultSettings() {
    let settings = {};
    return settings;
}
function editCommand(message) {
    db.all(`SELECT * FROM permissions WHERE guildId =?`,[message.guild.id]).then(rows => {
        let split = message.content.split(";");
        let action = split[0].split(" ")[1];
        let attribute = split[0].split(" ")[2];
        let setting = split[0].split(" ")[3]
        let commands = split[0].match(/[^\s"]+|"([^"]*)"/g).slice(4);
        let args = split[1];
        let argsSet = split[1];
        let actions = ["view","set","reset"];
        let attributes = ["description","sends","alias","cooldown","disabled","users","roles","channels"];
        let settings = ["allowed","denied"];
        //Check if a valid action was given
        if (actions.indexOf(action)<0) {
            message.reply("Invalid Action: " + action);
            return;
        }
        //Check if a valid attribute was given
        if (attributes.indexOf(attribute)<0) {
            message.reply("Invalid Attribute: " + attribute);
            return;
        }

        //Check if a setting is given
        if (settings.indexOf(setting)<0) {
            commands = split[0].match(/[^\s"]+|"([^"]*)"/g).slice(3);
        }
        //Get rid of quotes
        console.log("COMS: " + commands);
        for (let command in commands) {
            commands[command] = commands[command].replace(/"/g,"");

        }
        //Check if commands are valid, remove command if invalid
        let invalids = []
        for (let command in commands) {
            console.log("CHECKING COMMAND: " + commands[command])
            let found = false;
            let cog = false;
            for (let row in rows) {
                if (rows[row].command === commands[command]) {
                    found = true;
                    if (!message.member.hasPermission("ADMINISTRATOR")){
                        if (rows[row].type === "cog") {
                            cog = true;
                        }
                    }
                }
            }
            if (cog === true) {
                message.channel.sendMessage("`" + commands[command] + "`" + " is a cog command. You can't edit this.");
                invalids.push(commands[command]);
            }
            if (found === false) {
                message.channel.sendMessage("`" + commands[command] + "`" + " is not a command!");
                invalids.push(commands[command]);
            }
        }
        //Remove invalid commands from given commands
        for (let invalid in invalids) {
            commands.splice(commands.indexOf(invalids[invalid]),1);
        }
        //If valid commands were given
        if (commands.length === 0) {
            message.reply("No commands given.");
            return;
        }
        if (action === "view") {
            const response = new Discord.RichEmbed();
            //response.setTitle(`\`${attribute}\` for \`${commands}\``)
            response.setColor(0x00AE86)
            for (let command in commands) {
                for (let row in rows) {
                    if (rows[row].command === commands[command]) {
                        if (attributes.indexOf(attribute)<4) {
                            response.addField(`__${commands[command]}__`, `${rows[row][attribute]}`, true);
                        } else {
                            let things = "";
                            if (rows[row][attribute] != null) {
                                let json = JSON.parse(rows[row][attribute].toString());
                                let toSend = "";
                                toSend += "`allowed`"
                                for (let allow in json.allowed) {
                                    if(attribute === "users") {
                                        if (isNaN(parseInt(allow))) {
                                            let username = allow.slice(0,allow.length-5);
                                            let disc = allow.slice(allow.length-4,allow.length);
                                            let foundUser = message.guild.members.find(val => val.user.username === username && val.user.discriminator === disc);
                                            toSend += "\n" + foundUser;
                                        } else {
                                            let foundUser = message.guild.members.find(val => val.user.id === allow);
                                            toSend += "\n" + foundUser;
                                        }
                                    }
                                    if(attribute === "roles") {
                                        if (isNaN(parseInt(allow))) {
                                            let foundRole = message.guild.roles.find(val => val.name === allow);
                                            toSend += "\n" + foundRole;
                                        } else {
                                            let foundRole = message.guild.roles.find(val => val.id === allow);
                                            toSend += "\n" + foundRole;
                                        }
                                    }
                                    if(attribute === "channels") {
                                        if (isNaN(parseInt(allow))) {
                                            let foundChannel = message.guild.channels.find(val => val.name === allow);
                                            toSend += "\n" + foundChannel;
                                        } else {
                                            let foundChannel = message.guild.channels.find(val => val.id === allow);
                                            toSend += "\n" + foundChannel;
                                        }
                                    }
                                }
                                toSend += "\n`denied`"
                                for (let deny in json.denied) {
                                    if(attribute === "users") {
                                        if (isNaN(parseInt(deny))) {
                                            let username = deny.slice(0,deny.length-5);
                                            let disc = deny.slice(deny.length-4,deny.length);
                                            let foundUser = message.guild.members.find(val => val.user.username === username && val.user.discriminator === disc);
                                            toSend += "\n" + foundUser;
                                        } else {
                                            let foundUser = message.guild.members.find(val => val.user.id === deny);
                                            toSend += "\n" + foundUser;
                                        }
                                    }
                                    if(attribute === "roles") {
                                        if (isNaN(parseInt(deny))) {
                                            let foundRole = message.guild.roles.find(val => val.name === deny);
                                            toSend += "\n" + foundRole;
                                        } else {
                                            let foundRole = message.guild.roles.find(val => val.id === deny);
                                            toSend += "\n" + foundRole;
                                        }
                                    }
                                    if(attribute === "channels") {
                                        if (isNaN(parseInt(deny))) {
                                            let foundChannel = message.guild.channels.find(val => val.name === deny);
                                            toSend += "\n" + foundChannel;
                                        } else {
                                            let foundChannel = message.guild.channels.find(val => val.id === deny);
                                            toSend += "\n" + foundChannel;
                                        }
                                    }
                                }
                                response.addField(`__${commands[command]}__`, `${toSend}`, true);
                            } else {
                                response.addField(`__${commands[command]}__`, `${rows[row][attribute]}`, true);
                            }
                        }
                    }
                }
            }
            message.channel.sendEmbed(
              response,
              `**The ${attribute} for ${commands}**`,
              { disableEveryone: true }
            );
            return;
        }
        //Check if arguments were given if setting an attribute.
        if ((!args) && (action === "set")) {
            message.reply("No arguments were given.");
            return;
        }
        //Edit's The Command(s) To Escape SQL Injections
        for (let command in commands) {
            commands[command] = commands[command].replace(/'/g,"''");
        }
        //Splits args for attributes that take more than one input and removes quotes after regex
        //TODO maybe need to update the if statement
        if (settings.indexOf(setting)>=0 && actions.indexOf(action)<2) {
            args = args.match(/[^\s"]+|"([^"]*)"/g);
            for (let arg in args) {
                args[arg] = args[arg].replace(/"/g,"");

            }
        }
        db.all(`SELECT * FROM permissions WHERE guildId ='${message.guild.id}' AND command IN ('${commands.join("','")}')`).then(rows => {
            for (let row in rows) {
                cmd = rows[row].command;
                console.log("rows[row]: " + cmd);
                //let attributes = ["description","sends","alias","cooldown","disabled","users","roles","channels"];
                if (attribute === "description") {
                    if (action === "reset") {
                        db.run(`UPDATE permissions SET description =NULL WHERE guildId =? AND command =?`,[message.guild.id,cmd]).catch((err) => {
                            console.log(err);
                            message.channel.sendMessage("`I encountered an error when updating the database: 'permissions'`");
                        });
                    } else {
                        db.run(`UPDATE permissions SET description =? WHERE guildId =? AND command =?`,[args,message.guild.id,cmd]).catch((err) => {
                            console.log(err);
                            message.channel.sendMessage("`I encountered an error when updating the database: 'permissions'`");
                        });
                    }
                } else if (attribute === "sends") {
                    if (action === "reset") {
                        db.run(`UPDATE permissions SET sends =NULL WHERE guildId =? AND command =?`,[message.guild.id,cmd]).catch((err) => {
                            console.log(err);
                            message.channel.sendMessage("`I encountered an error when updating the database: 'permissions'`");
                        });
                    } else {
                        db.run(`UPDATE permissions SET sends =? WHERE guildId =? AND command =?`,[args,message.guild.id,cmd]).catch((err) => {
                            console.log(err);
                            message.channel.sendMessage("`I encountered an error when updating the database: 'permissions'`");
                        });
                    }
                } else if (attribute === "alias") {
                    if (action === "reset") {
                        db.run(`UPDATE permissions SET alias =NULL WHERE guildId =? AND command =?`,[message.guild.id,cmd]).catch((err) => {
                            console.log(err);
                            message.channel.sendMessage("`I encountered an error when updating the database: 'permissions'`");
                        });
                    } else {
                        db.run(`UPDATE permissions SET alias =? WHERE guildId =? AND command =?`,[args,message.guild.id,cmd]).catch((err) => {
                            console.log(err);
                            message.channel.sendMessage("`I encountered an error when updating the database: 'permissions'`");
                        });
                    }
                } else if (attribute === "cooldown") {
                    if (action === "reset") {
                        db.run(`UPDATE permissions SET cooldown =NULL WHERE guildId =? AND command =?`,[message.guild.id,cmd]).catch((err) => {
                            console.log(err);
                            message.channel.sendMessage("`I encountered an error when updating the database: 'permissions'`");
                        });
                    } else {
                        let seconds = parseInt(args);
                        if (isNaN(seconds)) {seconds = 0}
                        if (seconds<0) {seconds = 0}
                        db.run(`UPDATE permissions SET cooldown =? WHERE guildId =? AND command =?`,[seconds,message.guild.id,cmd]).catch((err) => {
                            console.log(err);
                            message.channel.sendMessage("`I encountered an error when updating the database: 'permissions'`");
                        });
                    }
                } else if (attribute === "disabled") {
                    if (action === "reset") {
                        db.run(`UPDATE permissions SET disabled =NULL WHERE guildId =? AND command =?`,[message.guild.id,cmd]).catch((err) => {
                            console.log(err);
                            message.channel.sendMessage("`I encountered an error when updating the database: 'permissions'`");
                        });
                    } else {
                        if(args === "true" || args === "false") {
                            db.run(`UPDATE permissions SET disabled =? WHERE guildId =? AND command =?`,[args,message.guild.id,cmd]).catch((err) => {
                                console.log(err);
                                message.channel.sendMessage("`I encountered an error when updating the database: 'permissions'`");
                            });
                        }
                    }
                } else if (attribute === "users" || attribute === "roles" || attribute === "channels") {
                    if(settings.indexOf(setting)<0) {message.reply(" you didn't specify `allowed` or `denied`.");return;}
                    let json = {"allowed":{},"denied":{}};
                    if (rows[row][attribute] != null) {json = JSON.parse(rows[row][attribute].toString());}
                    if(setting === "allowed") {
                        if (action === "reset") {
                            json["allowed"] = {};
                        } else {
                            json["allowed"] = {};
                            for (let arg in args) {
                                args[arg] = args[arg].replace(/"|<@&|<!@|<@!|<@|<&|<#|>/g,"");
                                if (attribute === "users") {
                                    let foundMember = message.guild.members.find(memb => memb.user.username === args[arg] || memb.user.id === args[arg]);
                                    if (!foundMember) {
                                        message.channel.sendMessage("Could not find the user: " + args[arg]);
                                    } else {
                                        json["allowed"][foundMember.user.id] = foundMember.user.username;
                                    }
                                } else if (attribute === "roles") {
                                    let foundRole = message.guild.roles.find(role => role.name === args[arg] || role.id === args[arg]);
                                    if (!foundRole) {
                                        message.channel.sendMessage("Could not find the role: " + args[arg]);
                                    } else {
                                        json["allowed"][foundRole.id] = foundRole.name;
                                    }
                                } else if (attribute === "channels") {
                                    let foundChannel = message.guild.channels.find(chan => chan.name === args[arg] || chan.id === args[arg]);
                                    if (!foundChannel) {
                                        message.channel.sendMessage("Could not find the channel: " + args[arg]);
                                    } else {
                                        json["allowed"][foundChannel.id] = foundChannel.name;
                                    }
                                }
                            }
                        }
                    } else if (setting === "denied") {
                        if (action === "reset") {
                            json["denied"] = {};
                        } else {
                            json["denied"] = {};
                            for (let arg in args) {
                                args[arg] = args[arg].replace(/"|<@&|<!@|<@!|<@|<&|<#|>/g,"");
                                if (attribute === "users") {
                                    let foundMember = message.guild.members.find(memb => memb.user.username === args[arg] || memb.user.id === args[arg]);
                                    if (!foundMember) {
                                        message.channel.sendMessage("Could not find the user: " + args[arg]);
                                    } else {
                                        json["denied"][foundMember.user.id] = foundMember.user.username;
                                    }
                                } else if (attribute === "roles") {
                                    let foundRole = message.guild.roles.find(role => role.name === args[arg] || role.id === args[arg]);
                                    if (!foundRole) {
                                        message.channel.sendMessage("Could not find the role: " + args[arg]);
                                    } else {
                                        json["denied"][foundRole.id] = foundRole.name;
                                    }
                                } else if (attribute === "channels") {
                                    let foundChannel = message.guild.channels.find(chan => chan.name === args[arg] || chan.id === args[arg]);
                                    if (!foundChannel) {
                                        message.channel.sendMessage("Could not find the channel: " + args[arg]);
                                    } else {
                                        json["denied"][foundChannel.id] = foundChannel.name;
                                    }
                                }
                            }
                        }
                    }
                    db.run(`UPDATE permissions SET '${attribute}' =? WHERE guildId =? AND command =?`,[JSON.stringify(json,null,"\t"),message.guild.id,cmd]).catch(err => {console.log(err)});
                }
            }
            if (action === "set") {
                if (settings.indexOf(setting)<0) {
                    message.channel.sendMessage(`The \`${attribute}\` for command(s) \`${commands}\` has been set to **${argsSet}**`);
                } else {
                    message.channel.sendMessage(`The \`${setting}\` \`${attribute}\` for command(s) \`${commands}\` has been set to **${argsSet}**`);
                }
            } else {
                if (settings.indexOf(setting)<0) {
                    message.channel.sendMessage(`The \`${attribute}\` for command(s) \`${commands}\` has been **reset**.`);
                } else {
                    message.channel.sendMessage(`The \`${setting}\` \`${attribute}\` for command(s) \`${commands}\` has been **reset**.`);
                }
            }
        });
    });
}
var permissions = function() {
    var self = this;
    self.onCmd = function(cmd,message,client) {
        console.log("permissions.js")
        if (cmd === "!p") {
            editCommand(message);
        }
        if(cmd === "!alias") {
            console.log("alias?");
            command = message.content.split(" ").slice(1).join(" ");
            db.get(`SELECT * FROM permissions WHERE guildId =? AND command =?`,[message.guild.id, command]).then(row => {
                if (!row) {
                    message.reply(`the alias **${command}** does not exist.`);
                    return;
                }
                if (row.alias != null) {
                    message.reply(`**${command}** is an alias for **${row.alias}**.`);
                } else {
                    message.reply(`**${command}** is not an alias for anything.`);
                }
            });
        }
        if(cmd === "!alias add") {
            let args = message.content.match(/[^\s"]+|"([^"]*)"/g);
            for (let arg in args) {
                args[arg] = args[arg].replace(/"/g,"");
            }
            let alias = args[2];
            let command = args[3]
            db.get(`SELECT * FROM permissions WHERE guildId =? AND command =?`,[message.guild.id, alias]).then(row => {
                if (!row) {
                    db.run('INSERT INTO permissions (guildId, command, alias, type) VALUES (?, ?, ?, ?)', [message.guild.id,alias,command,"alias"]).then(() => {
                        message.reply(`Added **${alias}** as an alias for **${command}**, say \`undo\` if this is not correct.`)
                    });
                    const filter = m => (m.content.match("undo") && m.author.id === message.author.id);
                    message.channel.awaitMessages(filter, {
                            max: 1,
                            time: 30000,
                            errors: ['time']
                        })
                        .then(function() {
                            db.run(`DELETE FROM permissions WHERE guildId =? AND command =? AND alias =?`,[message.guild.id, alias, command]).then(() => {
                                message.reply("undo successful.");
                            });
                        }).catch(() => {});
                } else {
                    message.reply(`the alias **${alias}** already exists.`)
                }
            });
        }
        if(cmd === "!alias del") {
            let alias = message.content.split(" ").slice(2).join(" ");
            db.get(`SELECT * FROM permissions WHERE guildId =? AND command =?`,[message.guild.id, alias]).then(row => {
                if (!row) {
                    message.reply(`**${alias}** does not exist.`);
                } else {
                    if (row.type != "cog") {
                        let delRow = row;
                        db.run(`DELETE FROM permissions WHERE guildId =? AND command =?`,[message.guild.id, alias]).then(() => {
                            message.reply(`Deleted the alias **${alias}**, say \`undo\` if this is not correct.`)
                            const filter = m => (m.content.match("undo") && m.author.id === message.author.id);
                            message.channel.awaitMessages(filter, {
                                    max: 1,
                                    time: 30000,
                                    errors: ['time']
                                })
                                .then(function() {
                                    db.run('INSERT INTO permissions (guildId, command, description, type, sends, alias, cooldown, users, roles, channels) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [delRow.guildId, delRow.command, delRow.description, delRow.type, delRow.sends, delRow.alias, delRow.cooldown, delRow.users, delRow.roles, delRow.channels]).then(() => {
                                        message.reply(`Added back **${alias}** as an alias for **${command}**.`)
                                    });
                                }).catch(() => {});
                        });
                    } else {
                        message.reply("you can't edit cog commands.");
                    }
                }
            });
        }
        if(cmd === "!alias show") {
            let alias = message.content.split(" ").slice(2).join(" ");
            db.get(`SELECT * FROM permissions WHERE guildId =? AND command =?`,[message.guild.id, alias]).then(row => {
                if (!row) {
                    message.reply(`the alias **${alias}** does not exist.`);
                } else {
                    let response = "```\n";
                    response += row.alias;
                    response += "\n```";
                    message.reply(`the command for **${alias}** is\n${response}`);
                }
            });
        }
        if(cmd === "!addcom") {
            let args = message.content.match(/[^\s"]+|"([^"]*)"/g);
            for (let arg in args) {
                args[arg] = args[arg].replace(/"/g,"");
            }
            let command = args[1];
            if (!command) {
                message.reply("no command was given.");
                return;
            }
            console.log("COMMAND: " + command)
            let sends = message.content.slice((message.content.indexOf(command)+command.length+1),message.content.length);
            console.log("SENDS: " + sends)
            if (sends === "") {
                message.reply("you didn't give anything for the command.");
                return;
            }
            db.get(`SELECT * FROM permissions WHERE guildId =? AND command =?`,[message.guild.id, command]).then(row => {
                if (!row) {
                    console.log("command: " + command)
                    console.log("sends: " + sends)
                    db.run('INSERT INTO permissions (guildId, command, sends, type) VALUES (?, ?, ?, ?)', [message.guild.id,command,sends,"command"]).then(() => {
                        message.reply(`Added **${command}** as an command, say \`undo\` if this is not correct.`)
                    });
                    const filter = m => (m.content.match("undo") && m.author.id === message.author.id);
                    message.channel.awaitMessages(filter, {
                            max: 1,
                            time: 30000,
                            errors: ['time']
                        })
                        .then(function() {
                            db.run(`DELETE FROM permissions WHERE guildId =? AND command =?`,[message.guild.id, command]).then(() => {
                                message.channel.sendMessage(`**${command}** was deleted.`);
                            });
                        }).catch(() => {});
                } else {
                    message.reply(`the command **${command}** already exists.`)
                }
            });
        }
        if(cmd === "!delcom") {
            let command = message.content.split(" ").slice(1).join(" ");
            if (command === "") {
                message.reply("no command was given.");
                return;
            }
            db.get(`SELECT * FROM permissions WHERE guildId =? AND command =?`,[message.guild.id, command]).then(row => {
                if (!row) {
                    message.reply(`the command **${command}** does not exist.`);
                } else {
                    if (row.type != "cog") {
                        let delRow = row;
                        db.run(`DELETE FROM permissions WHERE guildId =? AND command =?`,[message.guild.id, command]).then(() => {
                            message.reply(`Deleted the command **${command}**, say \`undo\` if this is not correct.`)
                            const filter = m => (m.content.match("undo") && m.author.id === message.author.id);
                            message.channel.awaitMessages(filter, {
                                    max: 1,
                                    time: 30000,
                                    errors: ['time']
                                })
                                .then(function() {
                                    db.run('INSERT INTO permissions (guildId, command, description, type, sends, alias, cooldown, users, roles, channels) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [delRow.guildId, delRow.command, delRow.description, delRow.type, delRow.sends, delRow.alias, delRow.cooldown, delRow.users, delRow.roles, delRow.channels]).then(() => {
                                        message.channel.sendMessage(`**${command}** was added back.`);
                                    });
                                }).catch(() => {});
                        });
                    } else {
                        message.reply("you can't edit cog commands.");
                    }
                }
            });
        }
        if(cmd === "!editcom") {
            let args = message.content.match(/[^\s"]+|"([^"]*)"/g);
            for (let arg in args) {
                args[arg] = args[arg].replace(/"/g,"");
            }
            let command = args[1];
            let sends = message.content.slice((message.content.indexOf(command)+command.length+1),message.content.length)
            db.get(`SELECT * FROM permissions WHERE guildId =? AND command =?`,[message.guild.id, command]).then(row => {
                if (!row) {
                    message.reply(`the command **${command}** does not exist!`);
                } else {
                    let oldSends = row.sends;
                    db.run(`UPDATE permissions SET sends =? WHERE guildId =? AND command =?`,[sends,message.guild.id, command]).then(() => {
                        message.reply(`The command for **${command}** was successfully edited. say \`undo\` if you wish to undo the edit.`);
                        const filter = m => (m.content.match("undo") && m.author.id === message.author.id);
                        message.channel.awaitMessages(filter, {
                                max: 1,
                                time: 30000,
                                errors: ['time']
                            })
                            .then(function() {
                                db.run(`UPDATE permissions SET sends =? WHERE guildId =? AND command =?`,[oldSends,message.guild.id, command]).then(() => {
                                    message.channel.sendMessage(`**${command}** was changed back.`);
                                }).catch(() => {});
                            });
                    });
                }
            });
        }
    }
    self.load = function(database) {
        self.db = database;
    }
    self.loadPerms = function(message) {
        let commands = getCommands();
        for (let command in commands) {
            let cmd = commands[command];
            db.get(`SELECT * FROM permissions WHERE guildId =? AND command =?`,[message.guild.id, command]).then(row => {
                if (!row) {
                    db.run('INSERT INTO permissions (guildId, command, description, type, sends, alias, cooldown, roles, users, channels) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [message.guild.id, command, cmd.description, cmd.type, cmd.sends, cmd.alias, cmd.cooldown,  JSON.stringify(cmd.roles,null,"\t"),  JSON.stringify(cmd.users,null,"\t"),  JSON.stringify(cmd.channels,null,"\t")]).then(() => {
                    });
                }
            });
        }
        message.channel.sendMessage("`permissions.js` has been enabled!");
    }
}

module.exports = permissions;
