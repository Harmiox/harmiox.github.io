const Discord = require("discord.js");
const discordBot = new Discord.Client({
    disableEveryone: true,
    messageCacheMaxSize: 1000,
    messageCacheLifetime: 300,
    messageSweepInterval: 60
});

/***************** GLOBAL VARIABLES *****************/
//Role Id's
let botRoleId = "179663287800168448";
let subRedditModRoleId = "179663467546935296";
let discordModRoleId = "179663615182241792";
let modsRoleId = "184030211304718338"
/**************** /GLOBAL VARIABLES *****************/

/***************** GLOBAL FUNCTIONS *****************/
//Global Functions
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function readFile(theFile) {
    fs = require('fs');
    let data = fs.readFileSync(theFile).toString();
    return data;
}
function appendFile(theFile,newData) {
    fs = require('fs');
    fs.appendFile(theFile, newData, function (err,data) {
      if (err) {
        return console.log("Something went wrong when writing to file.");
      }
    });
}
function writeFile(theFile,fileData) {
    var fs = require('fs');
    fs.writeFile(theFile, fileData, function(err) {
        if(err) {
            return console.log("Something went wrong when writing to file.");
        }
    });
}
function cleanup(amount,channel) {
    channel.sendMessage("!clear " + amount);
}
/**************** /GLOBAL FUNCTIONS *****************/
/************* BLACKLIST FUNCTIONS ******************/
function isBlackListed(user) {
    let filePath = "/Users/juanquenga/Desktop/Discord Bot/blacklist.json";
    var fs = require("fs");
    var contents = fs.readFileSync(filePath);
    var jsonContent = JSON.parse(contents);
    if (jsonContent["users"].hasOwnProperty(user.id)) {
        return true;
    } else {
        return false;
    }
}
function removeBlackList(msg) {
    let user = msg.mentions.users.first();
    let filePath = "/Users/juanquenga/Desktop/Discord Bot/blacklist.json";
    var fs = require("fs");
    var contents = fs.readFileSync(filePath);
    var jsonContent = JSON.parse(contents);
    delete jsonContent["users"][user.id];
    var fs = require('fs');
    fs.writeFile(filePath, JSON.stringify(jsonContent), function(err) {
        if(err) {
            msg.channel.sendMessage("'Something went wrong when writing to file.'");
            return console.log("Something went wrong when writing to file.");
        } else {
            msg.channel.sendMessage("`" + user.username + " was removed from the blacklist.`");
        }
    });
}
function addBlackList(msg) {
    let user = msg.mentions.users.first();
    let filePath = "blacklist.json";
    var fs = require("fs");
    var contents = fs.readFileSync(filePath);
    var jsonContent = JSON.parse(contents);
    jsonContent["users"][user.id] = user;
    var fs = require('fs');
    fs.writeFile(filePath, JSON.stringify(jsonContent), function(err) {
        if(err) {
            msg.channel.sendMessage("`Something went wrong when writing to file.`");
            return console.log("Something went wrong when writing to file.");
        } else {
            msg.channel.sendMessage("`" + user.username + " was added to the blacklist.`");
        }
    });
}
/************* /BLACKLIST FUNCTIONS ******************/
/*********** HEIST ASSISTANT FUNCTIONS ***************/
function parseWinnings(msg) {
    let filePath = "heists.json";
    var fs = require("fs");
    var contents = fs.readFileSync(filePath);
    var jsonContent = JSON.parse(contents);
    let winnersArray = msg.content.split("\n");
    let crewSize = jsonContent.heists[currentHeist()].crew.length;
    let winners = new Map();
    var totalStolen = 0;
    for (i=0;i<winnersArray.length;i+=1) {
        if((!winnersArray[i].match(/split/i)) && (!winnersArray[i].match(/-------/i)) && (!winnersArray[i].match(/```Python/i)) && (!winnersArray[i].match(/Criminals/i))) {
            let tempString = winnersArray[i].replace("```","").replace(/\s+/g,' ').trim();
            let parsedWinner = tempString.split(" ");
            totalStolen += parseInt(parsedWinner[1]);
            winners.set(parsedWinner[0],parsedWinner[1]);
        }
    }
    let losersCount = (crewSize - winners.size);
    let payup = Math.floor((totalStolen * 0.75)/winners.size);
    let totalDue = ((totalStolen * 0.75) * (winners.size));
    let payout = Math.floor(((totalStolen * 0.75)) / losersCount);
    for (i=0;i<crewSize;i+=1) {
        let crewMember = jsonContent.heists[currentHeist()].crew[i];
        if (winners.has(crewMember.username)) {
            msg.channel.sendMessage("<@!" + crewMember.id + "> Please use the command `!hpay " + payup + " " + jsonContent.current + "` to split your share with the losers.");
            jsonContent.heists[currentHeist()].winners.push(crewMember);
        } else {
            jsonContent.heists[currentHeist()].losers.push(crewMember);
        }
    }
    jsonContent.active = 0;
    jsonContent.heists[currentHeist()].successful = 1;
    jsonContent.heists[currentHeist()].payment = payup;
    jsonContent.heists[currentHeist()].due = totalDue;
    jsonContent.current += 1;
    var fs = require('fs');
    fs.writeFile(filePath, JSON.stringify(jsonContent), function(err) {
        if(err) {
            return console.log("Something went wrong when writing to file.");
        }
    });
    msg.channel.sendMessage("Each winner will pay **" + payup + "** credits to be split between the losers.");
    msg.channel.sendMessage("Each loser will receive **" + payout + "** credits.");
    
}
function refundPayment(msg) {
    let parsedMsg = msg.content.split(" ");
    let payment = parsedMsg[1];
    msg.channel.sendMessage("!pay <@!" + msg.author.id + "> " + payment + " REFUND");
}
function heistPayment(msg) {
    let parsedMsg = msg.content.split(" ");
    let payment = parseInt(parsedMsg[1]);
    var heistId = parseInt(parsedMsg[2]);
    
    let filePath = "heists.json";
    var fs = require("fs");
    var contents = fs.readFileSync(filePath);
    var jsonContent = JSON.parse(contents);
    
    jsonContent.heists[heistId].paid += payment;
    let losersArray = jsonContent.heists[heistId].losers;
    let split = Math.floor(payment / losersArray.length);
    
    msg.channel.sendMessage("A payment of " + payment + " credits has been received. Splitting with crew.");
    for (i=0;i<losersArray.length;i+=1) {
        let crewMember = losersArray[i];
        msg.channel.sendMessage("!pay <@!" + crewMember.id + "> " + split);
    }
    
    var fs = require('fs');
    fs.writeFile(filePath, JSON.stringify(jsonContent), function(err) {
        if(err) {
            return console.log("Something went wrong when writing to file.");
        }
    });
}
function currentHeist() { 
    let filePath = "heists.json";
    var fs = require("fs");
    var contents = fs.readFileSync(filePath);
    var jsonContent = JSON.parse(contents);
    return (jsonContent.current);
}
function heistStatus() { 
    let filePath = "heists.json";
    var fs = require("fs");
    var contents = fs.readFileSync(filePath);
    var jsonContent = JSON.parse(contents);
    return (jsonContent.active);
}
function heistPaymentCheck(id,amount) {
    let filePath = "heists.json";
    var fs = require("fs");
    var contents = fs.readFileSync(filePath);
    var jsonContent = JSON.parse(contents);
    if (id < jsonContent.heists.length) {
        if (jsonContent.heists[id].payment === amount) {
            return -1;
        } else {
            return jsonContent.heists[id].payment;
        }
    } else {
        return 0;
    }
}
function heistExists(id) {
    let filePath = "heists.json";
    var fs = require("fs");
    var contents = fs.readFileSync(filePath);
    var jsonContent = JSON.parse(contents);
    if (id < jsonContent.heists.length) {
        return true;
    } else {
        return false;
    }
}
function wasHeistPaid(id) { 
    let filePath = "heists.json";
    var fs = require("fs");
    var contents = fs.readFileSync(filePath);
    var jsonContent = JSON.parse(contents);
    if (id < jsonContent.heists.length) {
        if (jsonContent.heists[id].paid === jsonContent.heists[id].due) {
            return 1;
        } else {
            return 0;
        }
    } else {
        return 0;
    }
}
function wasHeistSuccessful(id) { 
    let filePath = "heists.json";
    var fs = require("fs");
    var contents = fs.readFileSync(filePath);
    var jsonContent = JSON.parse(contents);
    if (id < jsonContent.heists.length) {
        return (jsonContent.heists[id].successful);
    } else {
        return (0);
    }
}
function cancelHeist(channel) {
    let filePath = "heists.json";
    var fs = require("fs");
    var contents = fs.readFileSync(filePath);
    var jsonContent = JSON.parse(contents);
    
    let heistId = jsonContent.current;
    jsonContent.active = 0;
    jsonContent.current += 1;
    
    var fs = require('fs');
    fs.writeFile(filePath, JSON.stringify(jsonContent), function(err) {
        if(err) {
            return console.log("Something went wrong when writing to file.");
        }
    });
    channel.sendMessage("Heist **" + heistId + "** ended, too bad!");
}
function newHeist(msg) {
    let username = msg.content.replace("A heist is being planned by ","").replace("The heist begin in 30 seconds. Type !heist play to join their crew.","").replace("\n","");
    let user = msg.client.users.find(u => u.username === username);

    let filePath = "//heists.json";
    var fs = require("fs");
    var contents = fs.readFileSync(filePath);
    var jsonContent = JSON.parse(contents);
    
    jsonContent.active = 1;
    let heistId = jsonContent.current;
    
    jsonContent['heists'].push(
        {
            "id":heistId,
            "successful":0,
            "paid":0,
            "due":0,
            "payment":0,
            "crew":[user],
            "winners":[],
            "losers":[]
        }
    );
    var fs = require('fs');
    fs.writeFile(filePath, JSON.stringify(jsonContent), function(err) {
        if(err) {
            return console.log("Something went wrong when writing to file.");
        }
    });
    msg.channel.sendMessage("The ID for this heist is **" + heistId + "**.");
}
function addCrew(msg) {
    let username = msg.content.split("\n").slice(0,1)[0].replace(" has joined the crew.","");
    let user = msg.client.users.find(u => u.username === username);
    
    let filePath = "//heists.json";
    var fs = require("fs");
    var contents = fs.readFileSync(filePath);
    var jsonContent = JSON.parse(contents);
    
    jsonContent.heists[jsonContent.current]['crew'].push(user);
    
    var fs = require('fs');
    fs.writeFile(filePath, JSON.stringify(jsonContent), function(err) {
        if(err) {
            return console.log("Something went wrong when writing to file.");
        }
    });
}
function getCrew(id) {
    let filePath = "//heists.json";
    var fs = require("fs");
    var contents = fs.readFileSync(filePath);
    var jsonContent = JSON.parse(contents);
    let crewArray = jsonContent.heists[id]['crew'];
    let crew = "**Crew for heist " + id + ":**\n";
    for (i=0;i<crewArray.length;i+=1) {
        if (i === (crewArray.length - 1)) {
            crew += crewArray[i].username;
            break;
        }
        crew += crewArray[i].username + ", ";
    }
    return crew;
}
function getHeist(id) { 
    let filePath = "//heists.json";
    var fs = require("fs");
    var contents = fs.readFileSync(filePath);
    var jsonContent = JSON.parse(contents);
    return (jsonContent.heists[id]);
}
function clearHeists(msg) { 
    let filePath = "//heists.json";
    var fs = require("fs");
    var contents = fs.readFileSync(filePath);
    var jsonContent = JSON.parse(contents);
    jsonContent.current = 0;
    jsonContent["heists"] = [];
    var fs = require('fs');
    fs.writeFile(filePath, JSON.stringify(jsonContent), function(err) {
        if(err) {
            return console.log("Something went wrong when writing to file.");
        }
    });
    msg.channel.sendMessage("`heists.json has been cleared of logged heists.`");
}
/****************** /HEIST ASSISTANT FUNCTIONS ***********************/
discordBot.on("message", msg => {
    // Set the prefix
    let prefix = "!";
    if (isNaN(msg.guild) == true) {
        /********* /r/ClashRoyale Channels *********/
        let opRoom = msg.guild.channels.get('184055334334234624'); //#operator-room
        let lottoChannel = msg.guild.channels.get('272856015882682369'); //#lotto
        let botChannel = msg.guild.channels.get('186237273426231296'); //#bot-control
        let annChannel = msg.guild.channels.get('179662937986826240'); //#announcements
        /********* //r/ClashRoyale Channels ********/
        
        /********* AUTO RESPONSES *********/
        let barbbotUserId = '194525847565238272';
        if (msg.author.id === barbbotUserId) {
            if (msg.content.startsWith("You tried to rally a crew, but no one wanted to follow you. The heist has been cancelled.")) {
                cancelHeist(msg.channel);
            }
            if (msg.content.startsWith("No one made it out safe. The good guys win.")) {
                cancelHeist(msg.channel);
            }
            if (msg.content.startsWith("The credits stolen from the vault was split among the winners")) {
                parseWinnings(msg);
            }
            if (msg.content.match(/has joined the crew/i)) {
                addCrew(msg);
            }
            if (msg.content.startsWith("A heist is being planned by ")) {
                newHeist(msg);
            }
        }
        /********* /AUTO RESPONSES *********/

        /********* EXIT CASES  *********/
        if (!msg.content.startsWith(prefix)) return;
        if ((msg.content.startsWith(prefix + "userinfo")) || (msg.content.startsWith(prefix + "serverinfo"))) {return;}
        /********* /EXIT CASES  *********/

        /********* HEIST ASSISTANT  *********/
        //Return the crew of speicified heis.
        if (msg.content.startsWith(prefix + "crew")) {
            let args = msg.content.split(" ").slice(1);
            if (parseInt(args[0])>-1) {
                if (heistExists(parseInt(args[0]))) {  
                    msg.channel.sendMessage(getCrew(args[0]));
                } else {
                    msg.channel.sendMessage("Please give a valid heist ID.\n`!crew <heist_id>`");
                }
            } else {
                msg.channel.sendMessage("Please give a valid heist ID.\n`!crew <heist_id>`");
            }
        }
        //Clears the heists.json.
        if (msg.content.startsWith(prefix + "hclear")) {
            if (msg.member.roles.has(heistMeisterRoleId) || msg.member.roles.has(subRedditModRoleId) || msg.member.roles.has(discordModRoleId)) {
                clearHeists(msg);
            } else {
                msg.channel.sendMessage("You don't have permission to use that command.");
            }
        }
        //Splits winnings from a heist among the losers.
        if (msg.content.startsWith(prefix + "hpay")) {
            let args = msg.content.split(" ").slice(1);
            let amount = parseInt(args[0]);
            let id = parseInt(args[1]);
            //0 = amount
            //1 = heist
            if (amount>0) {
                if (id>-1) {
                    if (heistExists(id)) {
                        if((wasHeistSuccessful(id) === 1) && (wasHeistPaid(id) === 0)) {
                            if (heistPaymentCheck(id,amount) === -1) {
                                const filter = m => (m.content.endsWith("credits have been transferred to Bot's account.") && m.author.id === '194525847565238272');
                                msg.channel.awaitMessages(filter, { max: 1, time: 5000, errors: ['time'] })
                                 .then(function() {
                                     heistPayment(msg);
                                 })
                                 .catch(function() {
                                     refundPayment(msg);
                                 });
                            } else {
                                msg.channel.sendMessage("That is not the correct payment for that heist.");
                                const filter = m => (m.content.endsWith("credits have been transferred to Bot's account.") && m.author.id === '194525847565238272');
                                msg.channel.awaitMessages(filter, { max: 1, time: 5000, errors: ['time'] })
                                 .then(function() {
                                     refundPayment(msg);
                                 });
                            }
                        } else {
                            msg.channel.sendMessage("Heist " + args[1] + " was either not successful or winnings have already been split to the crew");
                            const filter = m => (m.content.endsWith("credits have been transferred to Bot's account.") && m.author.id === '194525847565238272');
                            msg.channel.awaitMessages(filter, { max: 1, time: 5000, errors: ['time'] })
                             .then(function() {
                                 refundPayment(msg);
                             });
                        }
                    } else {
                        msg.channel.sendMessage("That heist does not exist.");
                        const filter = m => (m.content.endsWith("credits have been transferred to Bot's account.") && m.author.id === '194525847565238272');
                        msg.channel.awaitMessages(filter, { max: 1, time: 5000, errors: ['time'] })
                         .then(function() {
                             refundPayment(msg);
                         });
                    }
                } else {
                    msg.channel.sendMessage("<@!" + msg.author.id + "> Please give a valid heist ID. *(If credits were transferred you'll receive an automatic refund in a few seconds)*\n`!hpay <credits> <heist_id>`");
                    const filter = m => (m.content.endsWith("credits have been transferred to Bot's account.") && m.author.id === '194525847565238272');
                    msg.channel.awaitMessages(filter, { max: 1, time: 5000, errors: ['time'] })
                     .then(function() {
                         refundPayment(msg);
                     });
                }
            } else {
                msg.channel.sendMessage("Please give more than 0 credits.\n`!hpay <credits> <heist_id>`");
            }
        }
        /********* /HEIST ASSISTANT  *********/
    }
});

discordBot.login("token");
