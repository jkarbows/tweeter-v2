# Tweeter 2.0 or How I Learned to Stop Worrying and Modify Amazon's Code

Welcome back, if you made it through [Part 1](link back to first tutorial) then you have an Alexa Skill to tweet with your voice and you're probably itching to share it with the world. But wait, there's a problem, you want to get your skill certified so anyone can log in and tweet from their Twitter account, so you've set up a page for users to log in with and that's all dandy. But, Amazon's [Account Linking](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/linking-an-alexa-user-with-a-user-in-your-system) flow requires you to support a different card type, specifically the "LinkAccount" card type, and the code we downloaded from Amazon in the first tutorial only supports the "Simple" card type. We'll have to do something about that.

We're going to modify [AlexaSkill.js](./AlexaSkill.js) to support the LinkAccount and Standard card types. Standard cards will allow you to attach an image to your cards. Although Amazon's requirements for where you host those images are [a bit tight](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/providing-home-cards-for-the-amazon-alexa-app#image_hosting), it's nice to have the option.

If you haven't had a chance to go over AlexaSkill.js in detail, you can find a decent breakdown of the code [here](http://tobuildsomething.com/2015/08/14/Amazon-Alexa-JavaScript-SDK-The-Ultimate-Guide/). Flip over the code and get familiar with it first, because we're about dive in and make some changes.

## But First, a Word on Alexa's Authorization Flow, Twitter, and your Account Linking Portal

First, we'll need a way for our skill to get our user's twitter authorization token and secret. Amazon's [Account Linking](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/linking-an-alexa-user-with-a-user-in-your-system) flow expects us to be using the [OAuth 2.0](https://oauth.net/2/) standard. Twitter, however, uses Oauth 1.0a. This means Amazon is expecting us to hand them back a single string back from our authorization url. To get around this we can pass back the user's key and secret joined by a set of unique characters, and split it back into separate pieces in our skill.

Actually building the login page is beyond the scope of this article, as there are countless options out there for hosting and web frameworks and the like. I've provided a sample login portal written with node's express framework with some basic instructions for setting it up on heroku over at the [tweeter-login](https://github.com/jkarbows/tweeter-login) repository on my [github profile](https://github.com/jkarbows). Feel free to use it as a base in your project and modify it, it should provide the basic needs for certification, such as pages for a privacy policy and terms of use. Amazon has a more in-depth [certification submission checklist](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-submission-checklist) for those interested in publishing their skill.

## Dive In to the LinkAccount Card

Now that we have our authorization tokens, we can set up our LinkAccount card in our skill to provide a card with a link to our login/authorization page to users who try to use the skill without logging in through Twitter. Our first stop is [AlexaSkill.js](./AlexaSkill.js).

Near the bottom, in the function that builds Response.prototype, we find our core methods of the response object: tell, tellWithCard, ask, and askWithCard. It's here that we'll add our reject method to provide users with the LinkAccount card. At the bottom of the return, after the askWithCard function, add the following:
```javascript
reject: function (speechOutput) {
	this._context.succeed(buildSpeechletResponse({
		session: this._session,
		output: speechOutput,
		cardType: "LinkAccount",
		shouldEndSession: true
	}));
}
```
This function will be used later to reject users who haven't authorized the skill with their twitter account with a LinkAccount card. Notice we'll only need to provide the speech output- we can't control the content or title of the LinkAccount card, only set the card type as such.

Near the top of the same Response.prototype function, in buildSpeechletResponse, we'll add a conditional to change the card type if the option is supplied. Add it after the cardTitle and cardContent are set, so we can use this again later to support images as well.
```javascript
if (options.cardType) {
	alexaResponse.card = {
		type: options.cardType
	}
}
```
Around the middle of the file, in the AlexaSkill.prototype.execute function, we'll find a conditional that controls what parameters get passed into a new session. We're going to modify this to pass in a new Response object along with the request and session.
```javascript
if (event.session.new) {
	this.eventHandlers.onSessionStarted(event.request, event.session, new Response(context, event.session));
}
```
Now we'll have access to our reject method when our session starts, so we can serve up those hot fresh LinkAccount cards.

Back near the top, in AlexaSkill.prototype.eventHandlers, we'll find the onSessionStarted function. This is the function we'll override in our skill to handle the LinkAccount card logic.
```javascript
onSessionStarted: function (sessionStartedRequest, session, response) {
},
```
We've added the response parameter on to the end of the function so we can use the reject function in our skill like so:
```javascript
Tweeter.prototype.eventHandlers.onSessionStarted = function(sessionStartedRequest, session, response) {
    console.log('Twitter onSessionStarted requestId:' + sessionStartedRequest.requestId +', sessionId: ' + session.sessionId);

    if(session.user.accessToken) {
        var token = session.user.accessToken;
        var tokens = token.split(/*your token separator*/);
        userToken = tokens[0];
        userSecret = tokens[1];
    } else {
        var speechOutput = "You must have a Twitter account to use this skill. "
            + "Click on the card in the Alexa app to link your account now.";
        response.reject(speechOutput);
    }
};
```
This will provide us access to the tokens in our oauth invocation in the TweetIntent function:
```javascript
oauth.post(
	url,
	userToken,
	userSecret,
	null, // body
	function(err, data, res) {
		//
	}
)
```
Now we can share our app with anyone, and provide them with a way to log in through their Twitter account!

## Standard Cards(the ones with images)

Amazon so far has provided very little in the way of support for card markup. Currently the only tools availalable to developers looking to style or format cards for their skill are newlines(\r\n or just \n) and [images](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/providing-home-cards-for-the-amazon-alexa-app#creating-a-home-card-to-display-text-and-an-image). You can only include a single image on a card, so choose wisely. You'll need to provide a small image url sized at 720 x 480 and a large image url sized at 1200 x 800 in png or jpg behind an https endpoint.

To enable cards with images, head back to the methods returned by the Response.prototype function and add these two functions, tellWithCardImage and askWithCardImage:
```javascript
tellWithCardImage: function (speechOutput, cardTitle, cardContent, images) {
	this._context.succeed(buildSpeechletResponse({
		session: this._session,
		output: speechOutput,
		cardTitle: cardTitle,
		cardContent: cardContent,
		cardImages: images,
		shouldEndSession: true
	}));
},
askWithCardImage: function (speechOutput, repromptSpeech, cardTitle, cardContent, images) {
	this._context.succeed(buildSpeechletResponse({
		session: this._session,
		output: speechOutput,
		reprompt: repromptSpeech,
		cardTitle: cardTitle,
		cardContent: cardContent,
		cardImages: images,
		shouldEndSession: false
	}));
},
```
These methods will accept an array of two images, your small image url and large image url, respectively.

Then, underneath the conditional we added earlier to change the card type add in the following:
```javascript
if (options.cardImages) {
	alexaResposne.card.type = "Standard";
	alexaResponse.card.images = {
		smallImageUrl: options.cardImages[0],
		largeImageUrl: options.cardImages[1]
	};
}
```
This will change the card type to Standard and set the images. If you've met Amazon's standards, you should be seeing an image along with those cards now.

## Thanks for reading :)

Hopefully this has been an informative journey. Voice experiences can be an exciting challenge to build, and Amazon's skill marketplace is in need of cool new things that are actually worth using. Be the developer you wish to see in the world.
