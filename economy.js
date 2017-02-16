//Global Functions
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function readFile(theFile) {
    fs = require('fs');
    let data = fs.readFileSync(theFile).toString();
    return data;
}
function writeFile(theFile,fileData) {
    var fs = require('fs');
    fs.writeFile(theFile, fileData, function(err) {
        if(err) {
            return console.log("Something went wrong when writing to file.");
        }
    });
}
function getEconomyJson() {
    let economyJson = JSON.parse(readFile("./cogs/economy.json"));
    return economyJson;
}
function userRarity(user){
    //TODO
}
function chestLevel(amount) {
    let economyJson = getEconomyJson();
    let chestLevel = "`Error`"
    for (var chest in economyJson.chests) {
        if(economyJson.chests.hasOwnProperty(chest) ) {
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
var economy = function (){  
   var self = this;
   self.onMsg = function (msg){
       let prefix = "!";
       if (msg.content.startsWith(prefix + "chest")) {
           let economyJson = getEconomyJson();
           let args = msg.content.split(" ");
           if (args.length == 1) {
               if (!economyJson.vaults[msg.author.id]) {msg.channel.sendMessage(msg.author + " you don't own a chest, use `!chest open` to open a chest!");return;}
               msg.channel.sendMessage(msg.author + " your " + chestLevel(economyJson.vaults[msg.author.id].amount) + " currently holds **" + numberWithCommas(economyJson.vaults[msg.author.id].amount) + "** gems.");
           }
           if (args.length >= 2) {
               if (args[1] === "open") {
                   if (economyJson.vaults[msg.author.id]) {msg.channel.sendMessage(msg.author + " you already own a chest!");return;}
                   economyJson.vaults[msg.author.id] = {"amount":0};
                   writeFile("./cogs/economy.json",JSON.stringify(economyJson,null,"\t"));
                   msg.channel.sendMessage(msg.author + " you've successfully opened up a chest!");
               } else if (args[1] === "transfer") {
                   if (args.length === 4) {
                       if (!args[2].startsWith("<@")){msg.channel.sendMessage(msg.author + " Example: `!chest transfer @harmiox 10000`");return;}
                       let toSend = msg.mentions.users.first();
                       if (!toSend) {msg.channel.sendMessage(msg.author + " Example: `!chest transfer @harmiox 10000`");return;}
                       if (!economyJson.vaults[msg.author.id]) {msg.channel.sendMessage(msg.author + " you don't own a chest, use `!chest open` to open a chest!");return;}
                       if (!economyJson.vaults[toSend.id]) {msg.channel.sendMessage(msg.author + " that user does not own a chest!");return;}
                       if(parseInt(args[3]) > economyJson.vaults[msg.author.id].amount) {msg.channel.sendMessage(msg.author + " you don't have that amount of gems in your chest!");return;}
                       if (parseInt(args[3])<=0) {msg.channel.sendMessage(msg.author + " you must transfer at least **1** gem.");return;}
                       economyJson.vaults[msg.author.id].amount -= parseInt(args[3]);
                       economyJson.vaults[toSend.id].amount += parseInt(args[3]);
                       writeFile("./cogs/economy.json",JSON.stringify(economyJson,null,"\t"));
                       msg.channel.sendMessage(msg.author + " the transfer of **" + parseInt(args[3]) + "** gems to " + toSend.username + " was successful");   
                   } else {
                       msg.channel.sendMessage("Invalid Use `!chest transfer <@user> <amount>`");
                   }
                } else if (args[1].startsWith("<@") || args[1].startsWith("<@!")) {
                    let toSend = msg.mentions.users.first();
                    if (!toSend) {msg.channel.sendMessage(msg.author + " Example: `!chest @harmiox`");return;}
                    if (!economyJson.vaults[toSend.id]) {msg.channel.sendMessage(msg.author + " that user does not own a chest!");return;}
                    msg.channel.sendMessage(toSend.username + "'s " + chestLevel(economyJson.vaults[toSend.id].amount) + " currently holds **" + numberWithCommas(economyJson.vaults[toSend.id].amount) + "** gems.");
                } else {
                   msg.channel.sendMessage("Invalid Use");
               }
           }
        }
   };
};

module.exports = economy;
