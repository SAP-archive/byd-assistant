module.exports = {
    welcome: function (lang) {
        return message(lang, "welcome");
    },
    help: function (lang) {
        return message(lang, "help");
    },
    sales: function (lang, params) {
        return message(lang, "sales", params);
    },
    noSales: function (lang, params) {
        return message(lang, "noSales", params);
    },
    salesOrder: function (lang, params) {
        return message(lang, "salesOrder", params);
    },
    noSalesOrder: function (lang) {
        return message(lang, "noSalesOrder");
    },
};

function message(lang, type, params) {
    var messages = [];
    try {
        messages = require("../lang/" + lang + ".json");
        console.log("Messages json  are" + JSON.stringify(messages));
    } catch (error) {
        console.error(
            "Language " + lang + " not supported. Using default language"
        );
        messages = require("./lang/" + process.env.LANG + ".json");
    }
    messages = {
        title: messages[type].title,
        output:
            messages[type].message[
            getRandomInt(0, messages[type].message.length - 1)
            ],
        reprompt:
            messages[type].reprompt[
            getRandomInt(0, messages[type].reprompt.length - 1)
            ],
    };

    if (params != undefined) {
        messages.output = placeHolderReplacement(messages.output, params);
    }

    return messages;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function placeHolderReplacement(message, params) {
    message = message.replace(/%\w+%/g, function (all) {
        return params[all] || all;
    });
    return message;
}
