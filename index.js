const mineflayer = require("mineflayer")
const vec3 = require("vec3")
const config = require("./config.json")
const color = require("./lib/colors")
var creset = color.reset

// Print ERRORS
function addError(err) {
    if (config.errorLog) {
        console.log(color.bg.red + color.dim + "[ERROR]" + creset + " " + color.fg.red + err + creset);
    }
}

// Print Infos
function setInfo(info) {
    if (config.infoLog) {
        console.log(color.bg.green + color.dim + "[INFO]" + creset + " " + color.fg.green + info + creset)
    }
}

// Manage Server Chat And Commands
function chatManager(bot) {
    bot.on("chat", (username, message) => {

        // Check if chat Log is true in the config.json
        if (bot.config.chatLog) {
            console.log(username, "||", message);
        }

        // Run commands
        const command = message.split(" ")
        if (config.admins.includes(username)) { // Check if message is from admins
            switch (command[1]) {

                // put items in trash Dispenser
                case "trash":
                    trash(bot)
                    break;

                    // log inventory items
                case "inv":
                    logInventory(bot)
                    break
            }
        }
    })

}

// log inventory items
function logInventory(bot) {
    console.log(bot.inventory.item());
}

// put items in trash Dispenser
async function trash(bot) {
    bot.unequip("hand")

    // fined trash Dispenser
    const POSdistrash = bot.blockAt(vec3(bot.config.trash_pos.x, bot.config.trash_pos.y, bot.config.trash_pos.z))
    const items = bot.inventory.items();
    const itemTyps = []
    items.forEach(item => {
        if (item != 685) {
            itemTyps.push({
                'type': item.type,
                'meta': item.metadata,
                'count': item.count
            });
        }
    });

    bot.openDispenser(POSdistrash).then((distrash) => {

        function dipositor(i) {
            if (i >= itemTyps.length) {
                distrash.close();
                setInfo("all items are in trash")
                return
            }
            distrash.deposit(itemTyps[i].type, itemTyps[i].metadata, itemTyps[i].count)
            setTimeout(() => {
                dipositor(i + 1)
            }, 500)
        }

        dipositor(0)
    }).catch((err) => {
        addError("Can not fined Trash Dispenser!")
    });


}

function Login(bot) {
    bot.once("spawn", () => {
        var timeout = setTimeout(function () {
            addError(`Timeout ${bot.config.timeout}`)
            bot.quit();
        }, bot.config.timeout * 1000)
        bot.chat("/register 99099909 99099909")
        bot.once("spawn", () => {
            bot.chat("/server opprison")
            bot.once("spawn", () => {
                bot.chat("/c v " + bot.config.cell_name)
                bot.once("spawn", () => {
                    setTimeout(() => {
                        Gapple(bot, timeout)
                    }, 300);
                })
            })
        })
    })
}

// get Gapple function
function Gapple(bot, timeout) {
    bot.chat("/kit member pvp")
    bot.once("windowOpen", (window) => {
        setTimeout(() => {
            bot.simpleClick.leftMouse(11)
            bot.once("windowClose", (window) => {
                setTimeout(() => {
                    const pos = bot.blockAt(vec3(bot.config.g_apple_pos.x, bot.config.g_apple_pos.y, bot.config.g_apple_pos.z))
                    bot.openDispenser(pos).then((dis) => {
                        dis.deposit(651, 0, 1).then(() => {
                            setTimeout(() => {
                                dis.close()
                                if (bot.config.on_done_log) {
                                    setInfo("Done!")
                                }
                                bot.quit('done');
                                clearTimeout(timeout)
                            }, 500)
                        }).catch((err) => {
                            addError("can not fined Gapple in inventory")
                            bot.quit();
                        })
                    }).catch((err) => {
                        addError("can not fined Gapple Dispenser Or something else")
                        bot.quit();
                    })
                })
            })
        }, 300)
    })
}

// make Random ID
function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

// Create Bot
function CreateBot(i = 0, user) {

    if (i >= config.nummber_of_acc) {
        return
    }
    if (config.userNameLog) {
        console.log(color.bg.blue + "User " + i + ":" + creset + " " + color.fg.blue + config.bot_info.user_prefix + user + creset);
    }

    const bot = mineflayer.createBot({
        username: config.bot_info.user_prefix + user,
        host: config.bot_info.host,
        port: config.bot_info.port,
        version: config.bot_info.version,
    })

    bot.config = config
    chatManager(bot)
    Login(bot)

    bot.on('end', () => {
        CreateBot(i + 1, makeid(config.bot_info.user_len))
    })

}

CreateBot(0, makeid(config.bot_info.user_len))