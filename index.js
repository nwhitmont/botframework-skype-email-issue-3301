//require('dotenv').config()

const botBuilder = require('botbuilder');
const randomInt = require('random-int');
const emailjs = require('emailjs');

const restify = require('restify');

//const emailAccess = require('./../utilities/emailapp.js');
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`${server.name} listening to ${server.url}`);
});

var connector = new botBuilder.ChatConnector({MICROSOFT_APP_ID: process.env.MICROSOFT_APP_ID, MICROSOFT_APP_PASSWORD: process.env.MICROSOFT_APP_PASSWORD});

var bot = new botBuilder.UniversalBot(connector);

server.post('/api/messages', connector.listen());
server.get('/', function (request, response) {
    response.send(200, {status: 'online'});
});


bot.on('conversationUpdate', function (message) {
    if (message.membersAdded) {
        message
            .membersAdded
            .forEach(function (identity) {
                if (identity.id === message.address.bot.id) {
                    bot.beginDialog(message.address, '/');
                }
            });
    }
});

// waterfall model -- where one function is calling the other and passing down
// the results
bot.dialog('/', [
    function (session) {

        session.send('Welcome to byte sized learning an experimental approach to learning small bytes ' +
                'of curated content at your own pace. You can get more details around this concep' +
                't by visiting this web page http://bytebasedlearning.blogspot.in/p/justintimelea' +
                'rning.html \n. There have been a few updates since the last rollout. You can get' +
                ' to know the new features in place by visiting the above web page. In order you ' +
                'to get kick started we require a few details');
        session.beginDialog('/askEmailId');
    },
    function (session, results) {
        session.endConversation('Thanks, hope you had a great learning. Type hi to come back');
    }
]);

bot.dialog('/askEmailId', [
    function (session) {
        botBuilder
            .Prompts
            .text(session, 'Please share your emailId so that your progress can be tracked?');
    },
    function (session, results) {
        session.userData.userName = results.response;
        session.userData.securityCode = randomInt(1000000);

        sendEmail(session.userData.securityCode, session.userData.userName, (err, pretrievedContent) => {
            if (err) {
                console.log('\n');
                console.log(`There was an error sending the email: ${err}`);
                console.log('\n');
            } else {
                console.log('\n');
                console.log(`Email sent successfully to: ${session.userData.userName}`);
                console.log('\n');
            }
        });

        botBuilder
            .Prompts
            .number(session, `A few more steps and you will get started. \n Looks like this is your first adventure with the bot, Welcome!!!\n Please share the security code that has been sent to your emailid ${session.userData.userName}. \
            In the scenario you had shared an incorrect email id just type in 123 to reenter the email id`);

    },
    function (session, results) {
        userEnteredSecurityCode = results.response;
        if (session.userData.securityCode === userEnteredSecurityCode) {

            botBuilder
                .Prompts
                .text(session, 'Great, you are all setup, its time to explore JitLearning, \n Thanks for your su' +
                        'pport and hope you have a great learning experience \n Please note that the foll' +
                        'owing commands will help you navigate through the learning, \n "next" : for goin' +
                        'g over the content , \n "quit" : to quit the learning module , \n "help" : to li' +
                        'st the commands , \n Key in any command to get started');
        } else {
            session.send('Looks like, there is an issue with email id, can you please re enter it');
            session.replaceDialog('/askEmailId');
        }
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);

var sendEmail = function (pRandomNumber, pEmailId, callback) {

    var server = emailjs
        .server
        .connect({
            user: process.env.EMAIL_USERNAME,
            password: process.env.EMAIL_PASSWORD,
            host: 'smtp-mail.outlook.com',
            tls: {
                ciphers: "SSLv3"
            }
        });

    var message = {
        text: `Thanks for your interest in JitLearning. This is a one time setup. Please key in this number ${pRandomNumber} in the app to verify your email address`,
        from: 'Bot Framework <botframework1987@outlook.com>',
        to: `<${pEmailId}>`,
        subject: `One Time Setup: Please key in this number ${pRandomNumber} in the app to verify your email address`
    };

    server.send(message, function (err, message) {
        if (err) {
            callback('Unable to connect to the Server');
        }
    });

};

// END OF LINE
