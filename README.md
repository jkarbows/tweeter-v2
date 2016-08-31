# Tweeter 2.0 or How I Learned to Stop Worrying and Modify Amazon's Code

Welcome back, if you made it through [Part 1](link back to first tutorial) then you have an Alexa Skill to tweet with your voice and you're probably itching to share it with the world. But wait, there's a problem, you want to get your skill certified so anyone can log in and tweet from their Twitter account, so you've set up a page for users to log in with and that's all dandy. But, Amazon's [Account Linking](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/linking-an-alexa-user-with-a-user-in-your-system) flow requires you to support a different card type, specifically the "LinkAccount" card type, and the code we downloaded from Amazon in the first tutorial only supports the "Simple" card type. We'll have to do something about that.

We're going to modify [AlexaSkill.js](./AlexaSkill.js) to support the LinkAccount and Standard card types. Standard cards will allow you to attach an image to your cards. Although Amazon's requirements for where you host those images are [a bit tight](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/providing-home-cards-for-the-amazon-alexa-app#image_hosting), it's nice to have the option.

If you haven't had a chance to go over AlexaSkill.js in detail, you can find a decent breakdown of the code [here](http://tobuildsomething.com/2015/08/14/Amazon-Alexa-JavaScript-SDK-The-Ultimate-Guide/). Flip over the code and get familiar with it first, because we're about dive in and make some changes.

# But First, a Word on Alexa's Authorization Flow, Twitter, and your Account Linking Portal

First, we'll need a way for our skill to get our user's twitter authorization token and secret. Amazon's [Account Linking](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/linking-an-alexa-user-with-a-user-in-your-system) flow expects us to be using the [OAuth 2.0](https://oauth.net/2/) standard. Twitter, however, uses Oauth 1.0a. This means Amazon is expecting us to hand them back a single string back from our authorization url. To get around this we can pass back the user's key and secret joined by a set of unique characters, and split it back into separate pieces in our skill.

Actually building the login page is beyond the scope of this article, as there are countless options out there for hosting and web frameworks and the like. I've provided a sample login portal written with node's express framework with some basic instructions for setting it up on heroku over at the [tweeter-login](https://github.com/jkarbows/tweeter-login) repository on my [github profile](https://github.com/jkarbows). Feel free to use it as a base in your project and modify it, it should provide the basic needs for certification, such as pages for a privacy policy and terms of use. Amazon has a more in-depth [certification submission checklist](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-submission-checklist) for those interested in publishing their skill.

# Dive In to the LinkAccount Card

Now that we have our authorization tokens, we can set up our LinkAccount card in our skill to provide a card with a link to our login/authorization page to users who try to use the skill without logging in through Twitter. Our first stop is [AlexaSkill.js](./AlexaSkill.js)

# Standard Cards(the ones with images)

Amazon's has so far provided very little support for card markup. Currently the only tools availalable to skill developers looking to format their cards are newlines(\r\n or just \n) and images.
