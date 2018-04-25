/**
 * This code implements an integration of SAP Business by Design with Amazon Echo
 * It is a fork from the B1 Assistant - A SAP Business One Integration with Amazon Echo 
 * See at: (https://github.com/B1SA/b1Assistant/)
 * 
 * For instrunctions, changelog and License please check the GitHub Repository
 * - https://github.com/Ralphive/byDAssistant
 * 
 */

var g_hdbServer = process.env.SMB_SERVER;
var g_hdbPort = process.env.SMB_PORT;
var g_hdbService = process.env.SMB_PATH;

exports.handler = function (event, context) {
    try {
        //console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * prevent someone else from configuring a skill that sends requests to this function.
         * To be uncommented when SKill is ready
        
        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.c014e6d6-a7a4-44ee-8b2f-9b10c7969743") {
             context.fail("Invalid Application ID");
        }p
         */

        if (event.session.new) {
            onSessionStarted({
                requestId: event.request.requestId
            }, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        //context.fail("Exception: " + e);
        console.log('exception: ' + e.message);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {

    console.log(intentRequest);
    var intent = intentRequest.intent;
    intentName = extractValue('PreviousIntent', intent, session);

    console.log('CURRENT Itent is ' + intent.name);
    console.log('PREVIOUS intent was ' + intentName);

    if ("AMAZON.StopIntent" === intent.name ||
        "AMAZON.CancelIntent" === intent.name) {
        handleSessionEndRequest(callback);
    }

    if (intentName === null) {
        intentName = intent.name;
    }

    // Dispatch to your skill's intent handlers
    switch (intentName) {
        case "SayHello":
            sayHello(intent, session, callback);
            break;

        case "SalesInfo":
            getSalesInfo(intent, session, callback);
            break;

        case "MakePurchase":
            postPurchase(intent, session, callback);
            break;

        case "AMAZON.HelpIntent":
            getWelcomeResponse(callback);
            break;

        default:
            throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------
function getWelcomeResponse(callback) {

    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = getWelcomeMessage();

    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = 'What is my command, master?';
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    var cardTitle = "Session Ended";
    //var speechOutput = "Thank you for using B1 Assistant. Have a nice day!";
    var speechOutput = "Okay.";

    // Setting this to true ends the session and exits the skill.
    var shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}


/**
 * BYD Interactions
 */
function sayHello(intent, session, callback) {

    var cardTitle = intent.name;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "";

    speechOutput = "Hi there! I am the Be One Assistant. I am here to help you with S-A-P Business One! Just ask!"

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}


function getSalesInfo(intent, session, callback) {

    //Default
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    var SalesQuarter = extractValue('SalesQuarter', intent, session)
    var SalesYear = extractValue('SalesYear', intent, session)

    sessionAttributes = handleSessionAttributes(sessionAttributes, 'SalesQuarter', SalesQuarter);
    sessionAttributes = handleSessionAttributes(sessionAttributes, 'SalesYear', SalesYear);

    if (SalesQuarter == null) {
        speechOutput = "Got it! What quarter?";
        repromptText = "Tell me the quarter and the year.";
    } else if (SalesYear == null) {
        speechOutput = "What year do you need?";
        repromptText = "You can do it, tell me a year.";
    } else {

        var b1Quarter = formatQuarter(SalesQuarter);
        var oDataEndpoint = "/SalesOrderCollection"
        var oDataFilter = '$select=NetAmount,currencyCode,DateTime&$filter=' +
            'DateTime' + op('ge') + beginQuarter(b1Quarter, SalesYear) + op('and') +
            'DateTime' + op('le') + endQuarter(b1Quarter, SalesYear);

        //Avoid unescaped characters
        oDataFilter = oDataFilter.replace(/ /g, "%20");

        console.log('OdataFilter = ' + oDataFilter);

        getCall(
            oDataEndpoint, // Endpoint
            "?$format=json&" + oDataFilter, //Filter

            function (response) {
                console.log("response is " + response);
                response = response.d.results;

                if (response.length == 0) {
                    speechOutput = "I am sorry, but there are no" +
                        " sales in the " + SalesQuarter + " quarter of " + SalesYear;

                } else {
                    var totalSales = 0;
                    for (var i = 0; i < response.length; i++) {
                        totalSales += Math.round(response[i].NetAmount, 2);
                    }
                    speechOutput = "The sales for the " + stringQuarter(b1Quarter) + " quarter of " +
                        SalesYear + " are " + totalSales + " " +
                        response[0].currencyCode + ".";
                }
                shouldEndSession = true;

                // call back with result
                callback(sessionAttributes,
                    buildSpeechletResponse(
                        intent.name, speechOutput,
                        repromptText, shouldEndSession
                    )
                );
            }
        );
        return;
    }

    sessionAttributes = handleSessionAttributes(sessionAttributes, 'PreviousIntent', intent.name);


    // Call back while there still questions to ask
    callback(sessionAttributes,
        buildSpeechletResponse(
            intent.name, speechOutput,
            repromptText, shouldEndSession
        )
    );
}


function postPurchase(intent, session, callback) {

    //Default
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    var ItemName = extractValue('ItemName', intent, session)
    var Quantity = extractValue('Quantity', intent, session)

    sessionAttributes = handleSessionAttributes(sessionAttributes, 'ItemName', ItemName);
    sessionAttributes = handleSessionAttributes(sessionAttributes, 'Quantity', Quantity);
    sessionAttributes = handleSessionAttributes(sessionAttributes, 'PreviousIntent', intent.name);


    if (ItemName == null) {
        speechOutput = "Should I get you a compressor, a gas boiler or maybe a stove?.";
        repromptText = "You can say. I need a gas boiler. Or Buy me a stove";
    } else if (Quantity == null) {
        speechOutput = "Ok, how many do you need?";
        repromptText = "Tell me the quantity you need.";
    } else {

        /* ByD Requires a CSRF Token in every POST Request.
        This token is provided by a GET with Authentication */
        getCall("/", "", function (body, response) { //Callback Function

            console.log("response is " + response);
            if (response.statusCode != 200) {
                speechOutput = "I am sorry, but there was an error processing this request";
            } else {

                var http = require('request');

                var body = {
                    "ExternalReference": "From Alexa",
                    "DataOriginTypeCode": "1",
                    "Name": "Order created via Alexa on " + getDateTime(true),
                    "SalesOrderBuyerParty": {
                        "PartyID": process.env.SMB_DEFAULT_BP
                    },
                    "SalesOrderItem": [
                        {
                            "ID": "10",
                            "SalesOrderItemProduct": {
                                "ProductID": getByDProduct(ItemName)
                            },
                            "SalesOrderItemScheduleLine": [
                                {
                                    "Quantity": Quantity
                                }
                            ]
                        }
                    ]
                }

                var options = {
                    uri: g_hdbServer + g_hdbPort + g_hdbService + "/SalesOrderCollection",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "x-csrf-token": response.headers["x-csrf-token"], //Damm Token
                        "cookie": response.headers["set-cookie"]
                    },
                    body: JSON.stringify(body)
                };

                console.log('start request to ' + options.uri)

                http.post(options, function (error, res, body) {
                    console.log("Response: " + res.statusCode);
                    if (!error && res.statusCode == 201) {

                        body = JSON.parse(body);
                        body = body.d.results;
                        console.log("Order " + body.ID + " created!")

                        speechOutput = "Your order number " + body.ID + " was placed successfully! " +
                            "The total amount of your purchase is " + body.NetAmount +
                            " " + body.currencyCode;

                        shouldEndSession = true;
                    }
                    else {
                        speechOutput = "I am sorry, but there was an error creating your order.";
                    }

                    // call back with result
                    callback(sessionAttributes,
                        buildSpeechletResponse(
                            intent.name, speechOutput,
                            repromptText, shouldEndSession)
                    );
                });

            }
        })
        return
    }
    // Call back while there still questions to ask
    callback(sessionAttributes,
        buildSpeechletResponse(
            intent.name, speechOutput,
            repromptText, shouldEndSession
        )
    );
}

function getCall(endPoint, filter, callback) {

    var http = require('request');

    var options = {
        uri: g_hdbServer + g_hdbPort + g_hdbService + endPoint + filter,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Basic " + process.env.SMB_AUTH,
            "x-csrf-token": "fetch"
        }
    };

    console.log('start request to ' + options.uri)

    http.get(options, function (error, res, body) {
        console.log("Response: " + res.statusCode);
        if (!error && res.statusCode == 200 || res.statusCode == 201) {
            var parsed = JSON.parse(body);
            callback(parsed, res);
        }
        else {
            console.log("Error message: " + error);
            callback(false)

        }
    });
}

// --------------- Handle of Session variables -----------------------
function extractValue(attr, intent, session) {

    console.log("Extracting " + attr);

    if (session.attributes) {
        if (attr in session.attributes) {
            console.log("Session attribute " + attr + " is " + session.attributes[attr]);
            return session.attributes[attr];
        }
    }

    console.log("No session attribute for " + attr);

    if (intent.slots) {
        if (attr in intent.slots && 'value' in intent.slots[attr]) {
            return intent.slots[attr].value;
        }
    };
    return null;
}


function handleSessionAttributes(sessionAttributes, attr, value) {

    //if Value exists as attribute than returns it
    console.log("Previous " + attr + "is: " + value)
    if (value) {
        sessionAttributes[attr] = value;
    }
    return sessionAttributes;
}

// --------------- Auxiliar Functions Formatting -----------------------

function quotes(val) {
    return "%27" + val + "%27";
}

function op(op) {
    return "%20" + op + "%20";
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatQuarter(input) {

    if (input == 'first' || input == '1st' || input == 'Q1') {
        return '01';
    }

    if (input == 'second' || input == '2nd' || input == 'Q2') {
        return '02';
    }

    if (input == 'third' || input == '3rd' || input == 'Q3') {
        return '03';
    }

    if (input == 'fourth' || input == '4th' || input == 'Q4') {
        return '04';
    }

}

function stringQuarter(input) {

    if (input == '01' || input == 'Q1') {
        return 'first';
    }

    if (input == '02' || input == 'Q2') {
        return 'second';
    }

    if (input == '03' || input == 'Q3') {
        return 'third';
    }

    if (input == '04' || input == 'Q4') {
        return 'fourth';
    }

}

function beginQuarter(quarter, year) {

    var ret = 'datetimeoffset'

    if (quarter == '01' || quarter == 'Q1') {
        ret += quotes(year + "-01-01T00:00:01Z")
        return ret
    }

    if (quarter == '02' || quarter == 'Q2') {
        ret += quotes(year + "-04-01T00:00:01Z")
        return ret
    }

    if (quarter == '03' || quarter == 'Q3') {
        ret += quotes(year + "-07-01T00:00:01Z")
        return ret
    }

    if (quarter == '04' || quarter == 'Q4') {
        ret += quotes(year + "-10-01T00:00:01Z")
        return ret
    }
}

function endQuarter(quarter, year) {

    var ret = 'datetimeoffset'

    if (quarter == '01' || quarter == 'Q1') {
        ret += quotes(year + "-03-31T23:59:59Z")
        return ret
    }

    if (quarter == '02' || quarter == 'Q2') {
        ret += quotes(year + "-06-30T23:59:59Z")
        return ret
    }

    if (quarter == '03' || quarter == 'Q3') {
        ret += quotes(year + "-09-30T23:59:59Z")
        return ret
    }

    if (quarter == '04' || quarter == 'Q4') {
        ret += quotes(year + "-12-31T23:59:59Z")
        return ret
    }
}


function formatItemGrp(itemGrp) {
    //Assures the item group name is formatted correctly

    itemGrp = itemGrp.toLowerCase();

    if (itemGrp == 'pc') {
        return 'PC';
    }
    return toTitleCase(itemGrp)
}

function toTitleCase(str) {
    //Capitlize the first letter of each word on a given string
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function getDateTime(withHour) {
    var currentdate = new Date();
    var datetime = currentdate.getFullYear() + "-"
        + (currentdate.getMonth() + 1) + "-"
        + currentdate.getDate();

    if (withHour) {
        datetime += " @ "
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds();
    }

    return datetime;
}

function getByDProduct(item) {
    item = formatItemGrp(item);

    if (item == "Boiler")
        return "P100401";

    if (item == "Stove")
        return "P110401";

    if (item == "Compressor")
        return "P120101";
    return "";

}


// -------------------- Speech Functions Formatting -----------------------
function getWelcomeMessage() {
    var message = [];

    message[0] = "Welcome to BYD Assistant. How can I help?"
    message[1] = "Hi, I am your BYD assistant. How can I help you today?"
    message[2] = "This is BYD assistant speaking. What is my command?"
    message[3] = "Hello! Here is BYD assistant. Let me know what do you wish."

    return message[getRandomInt(0, message.length - 1)];
}

// --------------- Helpers that build all of the responses -----------------------


function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    console.log("ALEXA: "+output);
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Standard",
            title: title,
            text: output,
            image: {
                smallImageUrl: "https://i.imgur.com/ZJFFyRa.png"
            }
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}