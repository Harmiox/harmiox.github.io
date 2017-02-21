let cogs = {};
function getJson() {
    fs = require('fs');
    let economyJson = JSON.parse(fs.readFileSync("./cogs/battles.json").toString());
    return economyJson;
}
let battle = {
    "towers": {
		"king tower": {
            "level": 1,
			"health": 2400,
			"0": 0,
            "1": 0
		}
	},
	"cards": [
        {
            "name":"knight",
            "type":"troop",
            "rarity": "common",
            "cost":3,
            "scenarios": [
                {
                    "message":"$user played their $card into $opponent's undefended lane, getting off $damage tower damage!",
                    "damage":348,
                    "author":"harmiox"
                }
            ]
        },
        {
            "name":"archers",
            "type":"troop",
            "rarity": "common",
            "cost":3,
            "scenarios": [
                {
                    "message":"",
                    "damage":0,
                    "author":""
                }
            ]
        },
        {
            "name":"freeze spell",
            "type":"spell",
            "rarity": "common",
            "cost":4,
            "scenarios": [
                {
                    "message":"",
                    "damage":0,
                    "author":""
                }
            ]
        },
        {
            "name":"spear goblins",
            "type":"troop",
            "rarity": "common",
            "cost":2,
            "scenarios": [
                {
                    "message":"",
                    "damage":0,
                    "author":""
                }
            ]
        },
        {
            "name":"bomber",
            "type":"troop",
            "rarity": "common",
            "cost":3,
            "scenarios": [
                {
                    "message":"",
                    "damage":0,
                    "author":""
                }
            ]
        },
        {
            "name":"goblins",
            "type":"troop",
            "rarity": "common",
            "cost":2,
            "scenarios": [
                {
                    "message":"",
                    "damage":0,
                    "author":""
                }
            ]
        },
        {
            "name":"minion horde",
            "type":"troop",
            "rarity": "common",
            "cost":5,
            "scenarios": [
                {
                    "message":"",
                    "damage":0,
                    "author":""
                }
            ]
        },
        {
            "name":"skeletons",
            "type":"troop",
            "rarity": "common",
            "cost":1,
            "scenarios": [
                {
                    "message":"",
                    "damage":0,
                    "author":""
                }
            ]
        },
        {
            "name":"minions",
            "type":"troop",
            "rarity": "common",
            "cost":3,
            "scenarios": [
                {
                    "message":"",
                    "damage":0,
                    "author":""
                }
            ]
        },
        {
            "name":"barbarians",
            "type":"troop",
            "rarity": "common",
            "cost":5,
            "scenarios": [
                {
                    "message":"",
                    "damage":0,
                    "author":""
                }
            ]
        },
        {
            "name":"fire spirits",
            "type":"troop",
            "rarity": "common",
            "cost":2,
            "scenarios": [
                {
                    "message":"",
                    "damage":0,
                    "author":""
                }
            ]
        },
        {
            "name":"royal giant",
            "type":"troop",
            "rarity": "common",
            "cost":6,
            "scenarios": [
                {
                    "message":"",
                    "damage":0,
                    "author":""
                }
            ]
        },
        {
            "name":"elite barbarians",
            "type":"troop",
            "rarity": "common",
            "cost":6,
            "scenarios": [
                {
                    "message":"",
                    "damage":0,
                    "author":""
                }
            ]
        },
        {
            "name":"ice spirit",
            "type":"troop",
            "rarity": "common",
            "cost":1,
            "scenarios": [
                {
                    "message":"",
                    "damage":0,
                    "author":""
                }
            ]
        },
        {
            "name":"goblin gang",
            "type":"troop",
            "rarity": "common",
            "cost":3,
            "scenarios": [
                {
                    "message":"",
                    "damage":0,
                    "author":""
                }
            ]
        },
        {
            "name":"arrows",
            "type":"spell",
            "rarity": "common",
            "cost":3,
            "scenarios": [
                {
                    "message":"",
                    "damage":0,
                    "author":""
                }
            ]
        },
        {
            "name":"zap",
            "type":"spell",
            "rarity": "common",
            "cost":2,
            "scenarios": [
                {
                    "message":"",
                    "damage":0,
                    "author":""
                }
            ]
        },
        {
            "name":"cannon",
            "type":"building",
            "rarity": "common",
            "cost":3,
            "scenarios": [
                {
                    "message":"",
                    "damage":0,
                    "author":""
                }
            ]
        },
        {
            "name":"tesla",
            "type":"building",
            "rarity": "common",
            "cost":4,
            "scenarios": [
                {
                    "message":"!",
                    "damage":0,
                    "author":""
                }
            ]
        },
        {
            "name":"mortar",
            "type":"building",
            "rarity": "common",
            "cost":4,
            "scenarios": [
                {
                    "message":"",
                    "damage":0,
                    "author":""
                }
            ]
        }
	]
}
var players = [null,null];
var current;
var opponent;
var card; 
var scenario;
var inSession = false;

function switchPlayer() {
    if (current === 0) {
        current = 1;
        opponent = 0;
    } else if (current === 1) {
        current = 0;
        opponent = 1;
    }
}
function chooseCard() {
    card = battle.cards[(Math.floor((Math.random() * battle.cards.length) + 1)-1)];
}
function chooseScenario() {
    scenario = card.scenarios[(Math.floor((Math.random() * card.scenarios.length) + 1)-1)];
}

function friendlyBattle(msg) {
    if (inSession === false) {
        inSession = true;
        players[0] = msg.author;
        players[1] = msg.mentions.users.first();
        if (!msg.mentions.users.first()) {
            msg.channel.sendMessage("You must battle someone! `!battle @user`");
            inSession = false;
            return;
        }
        if (msg.mentions.users.first().id === msg.author.id) {
            msg.channel.sendMessage("You can't battle yourself!");
            inSession = false;
            return;
        }
        
        msg.channel.sendMessage("**" + players[0].username + "** challenges **" + players[1].username + "** to a friendly battle! Let the battles begin!");
        
        battle.towers["king tower"][0] = battle.towers["king tower"].health;
        battle.towers["king tower"][1] = battle.towers["king tower"].health;
        
        current = (Math.floor((Math.random() * 2) + 1)-1);
        if (current === 0) {
            opponent = 0;
        } else {
            opponent = 1;
        }
        msg.channel.sendMessage("**" + players[current].username + "** decides to play a card first!");
        
        let moves = [];
        while(battle.towers["king tower"][0] > 0 && battle.towers["king tower"][1] > 0) {
            chooseCard();
            chooseScenario();
            battle.towers["king tower"][opponent] -= scenario.damage;
            let attacker = players[current].username;
            let defender = players[opponent].username;
            let damage = scenario.damage;
            let name = card.name;
            let hp = battle.towers["king tower"][opponent];
            let message = scenario.message.replace(/\$user/g,(`**${attacker}**`)).replace(/\$card/g,(`**${name}**`)).replace(/\$opponent/g,(`**${defender}**`)).replace(/\$damage/g,(`**${damage}**`));
            if (moves.length <= 16) {
                if (moves.length === 8) {
                    moves.push("**__Overtime!__**");
                }
                if (battle.towers["king tower"][opponent] <= 0) {
                    moves.push(`${message} **(${defender}: ${hp}hp)**`);
                    moves.push(`**${attacker} three crowned ${defender} !**`);
                } else {
                    moves.push(`${message} **(${defender}: ${hp}hp)**`);
                    switchPlayer();
                }
            } else {
                moves.push("**__Time ran out, the match ended in a draw!__**");
                break;
            }    
        }
        let gameInterval = setInterval(()=>{
            let nextMove = moves.shift();
            if (!nextMove) {clearInterval(gameInterval);inSession=false;}
            if (nextMove != undefined) {msg.channel.sendMessage(nextMove);}
        }, 1000);
    } else {
        msg.channel.sendMessage("A battle is currently in progress.");
    }
}

var battles = function() {
    var self = this;
    self.returnJson = getJson();
    self.onReady = function(cogsFile){ 
        cogs = cogsFile;
        console.log("battles.js loaded");
    }
    self.onMsg = function(msg) {
        let prefix = "!";
        if (msg.content.startsWith(prefix + "battle")) {
            friendlyBattle(msg);
        }
    }

}

module.exports = battles;
