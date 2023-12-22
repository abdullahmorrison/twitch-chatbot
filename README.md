# Abdullah's Twitch Chatbot
![GitHub issues](https://img.shields.io/github/issues/abdullahmorrison/twitch-chatbot)
![GitHub last commit (by committer)](https://img.shields.io/github/last-commit/abdullahmorrison/twitch-chatbot)

A chatbot that queries multiple free APIs to tell jokes, fun facts, and link fun images for Twitch chatters to enjoy! It also saves links that other chatters paste into the chat to a self-hosted MongoDB database.

# Usage

You need to have a Twitch account in order to type in a Twitch chat. Some channels require that you follow the channel and/or have a verified account to type in their chat. Login to Twitch and type [a command](https://github.com/abdullahmorrison/twitch-chatbot#chatbot-commands) in one of the [channels the bot is connected to](https://github.com/abdullahmorrison/twitch-chatbot#twitch-channels-connected-to-the-chatbot).

### Twitch Channels Connected to the Chatbot
If you type a [chatbot command](https://github.com/abdullahmorrison/twitch-chatbot#chatbot-commands) in these channels' chatrooms, the bot will get triggered
- [abdullahmorrison](https://twitch.tv/abdullahmorrison) (my twitch channel, used for testing)
- [erobb221](https://twitch.tv/erobb221)
- [Brittt](https://twitch.tv/brittt)
- [zomballr](https://twitch.tv/zomballr) (he requested that I add the bot to his channel)

### Chatbot Commands
- `!abdullahcommands`: displays the list of commands a user can type to trigger the chatbot
- `!tellmeajoke`: Tells a random joke by making a `GET` request to [official-joke-api.appspot.com/random_joke](https://official-joke-api.appspot.com/random_joke)
- `!randomfact`: Tells a random fact by making a `GET` request to [uselessfacts.jsph.pl](https://uselessfacts.jsph.pl/)
- `!dn`: Tells a random "deez nuts" joke by querying a JSON file stored [in the codebase](https://github.com/abdullahmorrison/twitch-chatbot/blob/main/apps/client/src/data/deeznuts.json)
- `!insult [user]`: Insults [user] by making a `GET` request to [https://evilinsult.com](https://evilinsult.com/generate_insult.php?lang=en&type=json)
- `!compliment [user]`: Compliments [user] by making a query to the [cheer-me-up npm package](https://github.com/gargeesuresh/cheer-me-up)
- `!riddle`: Tells a random riddle by making a `GET` request to [https://riddles-api.vercel.app/random](https://riddles-api.vercel.app/random)
- `!catfact`: Tells a random cat fact by making a `GET` request to [catfact.ninja](https://catfact.ninja/)
- `!catimage`: Links a random picture of a cat to the chat by making a `GET` request to [api.thecatapi.com](https://api.thecatapi.com/)
- `!dogimage`: Links a random picture of a dog to the chat by making a `GET` request to [random.dog/woof.json](https://random.dog/woof.json)
- `!wouldyourather` : Tells a 'would you rather' question by making a `GET` request to [https://would-you-rather-api.abaanshanid.repl.co/](https://would-you-rather-api.abaanshanid.repl.co/)
  
### Commands that are Exclusive to a Specific Twitch Channel
### [Brittt](https://twitch.tv/brittt):
- `!recipe`: Brittt usually cooks during her streams. This command gives her ideas on what she can cook by making a `GET` request to [themealdb.com](https://themealdb.com/api.php) to get a random recipe and pasting a TikTok-search URL to that recipe in chat so she can view the instructions on how to make it on TikTok (she loves finding recipes through TikTok).
- `!whyisbritttnotlive`: Tells a random excuse about why Brittt is not streaming today by querying a JSON file [in the codebase](https://github.com/abdullahmorrison/twitch-chatbot/blob/main/apps/client/src/data/whyisbritttnotlive.json) that contains a list of the many excuses she uses to explain why she is not streaming today.
  - If Britt types the command herself, the bot says this:
      <img src="https://github.com/abdullahmorrison/twitch-chatbot/assets/49528805/502dec33-30d5-4acd-a6d2-7f204a4a29cf" width=600/>



# Demo
**#1 Context:** I am typing bot commands into my channel.

 **#2 Context:** Chatters are typing the `!dn` command which triggers my bot `@AbdullahMorrisonBot` to tell a "deez nuts" joke. The chatters are responding with the emote [GotEEM](https://7tv.app/emotes/62872732dcdfd1fbbebf80c7) to show that they are laughing.
#1 Example Commands        |  #2 Used in a Live Twitch Stream
:-------------------------:|:-------------------------:
<video src="https://github.com/abdullahmorrison/TwitchChatBot/assets/49528805/80f9da2d-023e-4d68-97dc-7cbca528f49a" /> | <video src="https://github.com/abdullahmorrison/twitch-chatbot/assets/49528805/1e050776-fdc7-4750-82c1-db29af3e832c"/> 

# Architecture Diagram
![image](https://github.com/abdullahmorrison/twitch-chatbot/assets/49528805/28e8aebd-6bfa-4037-8871-b95fba4771bc)

# Testimonial
<img src="https://github.com/abdullahmorrison/twitch-chatbot/assets/49528805/522c8658-de8b-42db-92b4-3bf726884774" width=500/>
<img src="https://github.com/abdullahmorrison/twitch-chatbot/assets/49528805/72666f6f-9d2d-49b7-bcf3-1764c8215f34" align="right" width=800/>
