// tweet skill
'use strict';

var AlexaSkill = require('./AlexaSkill');
var OAuth = require('oauth');

var userToken = '';
var userSecret = '';

var APP_ID = secrets.alexa;

var Tweeter = function() {
    AlexaSkill.call(this, APP_ID);
};

Tweeter.prototype = Object.create(AlexaSkill.prototype);
Tweeter.prototype.constructor = Tweeter;

Tweeter.prototype.eventHandlers.onSessionStarted = function(sessionStartedRequest, session, response) {
    console.log('Twitter onSessionStarted requestId:' + sessionStartedRequest.requestId +', sessionId: ' + session.sessionId);

    if(session.user.accessToken) {
        var token = session.user.accessToken;
        var tokens = token.split('%20');
        userToken = tokens[0];
        userSecret = tokens[1];
    } else {
        var speechOutput = "You must have a Twitter account to use this skill. "
            + "Click on the card in the Alexa app to link your account now.";
        response.reject(speechOutput);
    }
};

Tweeter.prototype.eventHandlers.onLaunch = function(launchRequest, session, response) {
    console.log('Tweeter onLaunch requestId' + launchRequest.requestId + ', sessionId: ' + session.sessionId);
    var speechOutput = "Welcome to Tweeter. Say 'tweet' followed by what you'd like me to tweet for you.";
    var cardTitle = "Tweeter";
    response.askWithCard(speechOutput, speechOutput, cardTitle, speechOutput);
};

Tweeter.prototype.intentHandlers = {
    "TweetIntent": function(intent, session, response) {
        var oauth = new OAuth.OAuth(
            'https://api.twitter.com/oauth/request_token',
            'https://api.twitter.com/oauth/access_token',
            userToken,
            userSecret,
            '1.0A',
            null,
            'HMAC-SHA1'
        );
        var speechOutput = "";
        var cardTitle = "Tweeter";

        var input = intent.slots.input.value;
        var url = 'https://api.twitter.com/1.1/statuses/update.json?status=' + input;

        oauth.post(
            url,
            secrets.twitter.user.token,
            secrets.twitter.user.secret,
            null, // body
            function(err, data, res) {
                if(err) {
                    speechOutput = "There was an error communicating with Twitter. Try again later.";
                    response.tell(speechOutput);
                }
                speechOutput = "Okay, I tweeted: \"" + input + "\" for you.";
                response.tellWithCard(speechOutput, cardTitle, speechOutput);
            }
        )
    }
};

exports.handler = function(event, context) {
    var tweeterHelper = new Tweeter();
    tweeterHelper.execute(event, context);
};
