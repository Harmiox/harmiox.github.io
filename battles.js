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
    "cards": [{
            "name": "knight",
            "type": "troop",
            "rarity": "common",
            "cost": 3,
            "scenarios": [{
                    "message": "and he reached the tower getting two swings off!",
                    "damage": 348
                },
                {
                    "message": "and he reached the tower but only gets one swing off.",
                    "damage": 174
                },
                {
                    "message": "and he reached the tower at full health! Maximum damage!",
                    "damage": 1000
                }
            ]
        },
        {
            "name": "archers",
            "type": "troop",
            "rarity": "common",
            "cost": 3,
            "scenarios": [{
                "message": "and they shoot, double damage!",
                "damage": 234
            }]
        },
        {
            "name": "freeze spell",
            "type": "spell",
            "rarity": "common",
            "cost": 4,
            "scenarios": [{
                "message": "but it was wasted.",
                "damage": 0
            }]
        },
        {
            "name": "spear goblins",
            "type": "troop",
            "rarity": "common",
            "cost": 2,
            "scenarios": [{
                    "message": "and they reached the tower, but only got to throw their spears once.",
                    "damage": 150
                },
                {
                    "message": "but they were quickly zapped! Zero damage.",
                    "damage": 0
                }
            ]
        },
        {
            "name": "bomber",
            "type": "troop",
            "rarity": "common",
            "cost": 3,
            "scenarios": [{
                "message": "and he landed two hits!",
                "damage": 542
            }]
        },
        {
            "name": "goblins",
            "type": "troop",
            "rarity": "common",
            "cost": 2,
            "scenarios": [{
                    "message": "and all three goblins quickly got a stab in!",
                    "damage": 318
                },
                {
                    "message": "but only two goblins got a stab in.",
                    "damage": 212
                },
                {
                    "message": "but only one goblin got a stab in.",
                    "damage": 106
                }
            ]
        },
        {
            "name": "minion horde",
            "type": "troop",
            "rarity": "common",
            "cost": 5,
            "scenarios": [{
                    "message": "but the horde got zapped, and only one minion reached the tower.",
                    "damage": 84
                },
                {
                    "message": "but the horde got arrowed! Zero damage.",
                    "damage": 0
                }
            ]
        },
        {
            "name": "skeletons",
            "type": "troop",
            "rarity": "common",
            "cost": 1,
            "scenarios": [{
                    "message": "but the doots were burned by incoming fire spirits. Zero damage.",
                    "damage": 0
                },
                {
                    "message": "but Larry got lost, so the other doots looked for him. Zero damage.",
                    "damage": 0
                }
            ]
        },
        {
            "name": "minions",
            "type": "troop",
            "rarity": "common",
            "cost": 3,
            "scenarios": [{
                "message": "and all three minions landed two hits!",
                "damage": 504
            }]
        },
        {
            "name": "barbarians",
            "type": "troop",
            "rarity": "common",
            "cost": 5,
            "scenarios": [{
                    "message": "and all four barbarians hit the tower twice!",
                    "damage": 1056
                },
                {
                    "message": "but they were fireballed, and only one barbarian got a hit.",
                    "damage": 159
                }
            ]
        },
        {
            "name": "fire spirits",
            "type": "troop",
            "rarity": "common",
            "cost": 2,
            "scenarios": [{
                    "message": "but two spirits took out a minion horde, so only the last spirit hit the tower.",
                    "damage": 169
                },
                {
                    "message": "and all three spirits hit the tower!",
                    "damage": 507
                },
                {
                    "message": "but one of the spirits got zapped, so only two hit the tower.",
                    "damage": 338
                }
            ]
        },
        {
            "name": "royal giant",
            "type": "troop",
            "rarity": "common",
            "cost": 6,
            "scenarios": [{
                    "message": "and the royal giant is able to land five shots!",
                    "damage": 795
                },
                {
                    "message": "but an ice wizard was slowing down the royal giant, so he only landed two shots",
                    "damage": 318
                }
            ]
        },
        {
            "name": "elite barbarians",
            "type": "troop",
            "rarity": "common",
            "cost": 6,
            "scenarios": [{
                    "message": "but the elite barbarians were shut down by an electro wizard. Zero damage.",
                    "damage": 0
                },
                {
                    "message": "and not only did the brothers reach the tower, they got raged!",
                    "damage": 1524
                },
                {
                    "message": "but one elite barbarian fell into the river. The remaining one got two hits off.",
                    "damage": 508
                }
            ]
        },
        {
            "name": "ice spirit",
            "type": "troop",
            "rarity": "common",
            "cost": 1,
            "scenarios": [{
                    "message": "and the ice spirit gleefully landed on the tower",
                    "damage": 95
                },
                {
                    "message": "but a wizard burned the spirit! Zero damage.",
                    "damage": 0
                }
            ]
        },
        {
            "name": "goblin gang",
            "type": "troop",
            "rarity": "common",
            "cost": 3,
            "scenarios": [{
                    "message": "but the gang was unfortunately crushed by the log. Zero damage.",
                    "damage": 0
                },
                {
                    "message": "but only the spear goblins made it to the tower. All three got two hits in.",
                    "damage": 300
                },
                {
                    "message": "but only the stab goblins made it to the tower. All three got two hits in.",
                    "damage": 636
                }
            ]
        },
        {
            "name": "arrows",
            "type": "spell",
            "rarity": "common",
            "cost": 3,
            "scenarios": [{
                    "message": "and it successfully clipped the tower!",
                    "damage": 98
                },
                {
                    "message": "but it missed! Zero damage.",
                    "damage": 0
                }
            ]
        },
        {
            "name": "zap",
            "type": "spell",
            "rarity": "common",
            "cost": 2,
            "scenarios": [{
                "message": "and not only did it kill an incoming skeleton army, it clipped the tower!",
                "damage": 159
            }]
        },
        {
            "name": "cannon",
            "type": "building",
            "rarity": "common",
            "cost": 3,
            "scenarios": [{
                    "message": "and it successfully defended a hog rider push!",
                    "damage": 0
                },
                {
                    "message": "but it was deployed too far! A giant got two hits in.",
                    "damage": 0
                }
            ]
        },
        {
            "name": "tesla",
            "type": "building",
            "rarity": "common",
            "cost": 4,
            "scenarios": [{
                "message": "and it popped out of the ground, which distracted a royal giant!",
                "damage": 0
            }]
        },
        {
            "name": "mortar",
            "type": "building",
            "rarity": "common",
            "cost": 4,
            "scenarios": [{
                    "message": "and it successfully hits the tower 4 times!",
                    "damage": 916
                },
                {
                    "message": "and it successfully hits the tower 2 times!",
                    "damage": 458
                }
            ]
        }
    ]
}
var players = [null, null];
var current;
var opponent;
var card;
var scenario;
var inSession = false;

function switchPlayer() {
    if (current === 0) {
        current = 1;
        opponent = 0;
    } else {
        current = 0;
        opponent = 1;
    }
}

function chooseCard() {
    card = battle.cards[(Math.floor((Math.random() * battle.cards.length) + 1) - 1)];
}

function chooseScenario() {
    scenario = card.scenarios[(Math.floor((Math.random() * card.scenarios.length) + 1) - 1)];
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

        current = (Math.floor((Math.random() * 2) + 1) - 1);
        if (current === 0) {
            opponent = 0;
        } else {
            opponent = 1;
        }
        msg.channel.sendMessage("**" + players[current].username + "** decides to play a card first!");

        let moves = [];
        while (battle.towers["king tower"][0] > 0 && battle.towers["king tower"][1] > 0) {
            chooseCard();
            chooseScenario();
            battle.towers["king tower"][opponent] -= scenario.damage;
            if (battle.towers["king tower"][opponent] <= 0) {
                moves.push("**" + players[current].username + "** played their " + card.name + " " + scenario.message + " (" + scenario.damage + "dmg | " + battle.towers["king tower"][opponent] + "hp)\n**" + players[current] + " three crowned " + players[opponent] + "!**");
            } else {
                moves.push("**" + players[current].username + "** played their " + card.name + " " + scenario.message + " (" + scenario.damage + "dmg | " + battle.towers["king tower"][opponent] + "hp)");
            }
            switchPlayer();
        }
        let gameInterval = setInterval(() => {
            let nextMove = moves.shift();
            if (!nextMove) {
                clearInterval(gameInterval);
                inSession = false;
            }
            if (nextMove != undefined) {
                msg.channel.sendMessage(nextMove);
            }
        }, 1000);
    } else {
        msg.channel.sendMessage("A battle is currently in progress.");
    }
}

var battles = function() {
    var self = this;
    self.returnJson = getJson();
    self.onReady = function(cogsFile) {
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
