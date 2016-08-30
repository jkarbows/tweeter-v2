# Tweeter 2.0 or How I Learned to Stop Worrying and Modify Amazon's Code

Welcome back, if you made it through [Part 1](link back to first tutorial) then you have an Alexa Skill to tweet with your voice and you're probably itching to share it with the world. But wait, there's a problem, you want to get your skill certified so anyone can log in and tweet from their Twitter account, so you've set up a page for users to log in with and that's all dandy. But, Amazon's [Account Linking](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/linking-an-alexa-user-with-a-user-in-your-system) flow requires you to support a different card type, specifically the "LinkAccount" card type, and the code we downloaded from Amazon in the first tutorial only supports the "Simple" card type. We'll have to do something about that.

We're going to modify AlexaSkill.js to support the LinkAccount and Standard card types. Standard cards will allow you to attach an image to your cards. Although Amazon's requirements for where you host those images are [a bit tight](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/providing-home-cards-for-the-amazon-alexa-app#image_hosting), it's nice to have the option.

# Dive In

If you haven't had a chance to go over AlexaSkill.js in detail, you can find a decent breakdown of the code [here](http://tobuildsomething.com/2015/08/14/Amazon-Alexa-JavaScript-SDK-The-Ultimate-Guide/). Flip over the code and get familiar with it first,
