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

        /********* EXIT CASES  *********/
        if (!msg.content.startsWith(prefix)) return;
        if ((msg.content.startsWith(prefix + "userinfo")) || (msg.content.startsWith(prefix + "serverinfo"))) {return;}
        /********* /EXIT CASES  *********/
              
        /********* TOURNAMENTS  *********/
        if (msg.content.startsWith(prefix + "tournament")) {
            let tournamentsChannel = msg.guild.channels.get('278309528049811459'); //#tournaments
            var args = msg.content.match(/\w+|"[^"]+"/g).slice(1);
            if (args.length == 6) {
                var tournamentTitle = args[0].replace(/["]+/g, '');
                var tournamentDetails = args[1].replace(/["]+/g, '');
                tournamentDetails = tournamentDetails.replace(/;/g,'\n');
                var tournamentRules = args[2].replace(/['"]+/g, '').split(";");
                var tournamentName = args[3].replace(/['"]+/g, '');
                var tournamentTag = args[4].replace(/['"]+/g, '');
                var tournamentPass = args[5].replace(/['"]+/g, '');
                var rules = "No Rules!";
                if (tournamentRules[0].length > 1) {
                    rules = "```Markdown\n";
                    for (i = 0; i < tournamentRules.length; i += 1) {
                        rules += (i+1) + ". " + tournamentRules[i] + "\n";
                    }
                    rules += "```";
                }
                tournamentsChannel.sendMessage("", {embed: {
                  color: 3851353,
                  author: {
                    name: '',
                    icon_url: '',
                  },
                  title: '',
                  url: '',
                  description: '',
                  fields: [
                    {
                      name: (tournamentTitle),
                      value: (tournamentDetails)
                    },
                    {
                      name: 'Rules',
                      value: (rules)
                    },
                    {
                      name: 'Tournament',
                      value: ('```HTTP\nTournament Name: ' + tournamentName + '\nTournament Tag: ' + tournamentTag + '\nTournmanet Pass: ' + tournamentPass + '\n```')
                    }
                  ],
                  timestamp: new Date(),
                  footer: {
                    icon_url: msg.author.avatarURL,
                    text: ('Posted by ' + msg.author.username + '')
                  }
                }});
                msg.channel.sendMessage("<@!" + msg.author.id + "> the tournament has successfully been posted to #tournaments");
            } else {
                msg.channel.sendMessage("<@!" + msg.author.id + '> invalid use of command!\n**Ex: ** `!tournament "Tournament Title" "Tournament Details" "Rule1;Rule2;..." "Tournament Name" "Tournament Tag" "Tournament Password"`\n> __Text formatting__ does work for the **Tournament Title & Details**\n> To leave a field blank, just put `" "`.\n> For a new line in **Tournament Detais** put a `;` wherever you want a new line. You can use it multiple time in a row for extra line breaks.');
            }
        }
        /********* /TOURNAMENTS  *********/
    }
});

discordBot.login("token");
