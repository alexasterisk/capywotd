# CapyWOTD
Capybara Word of the Day

### What it does
Exactly what it says. Capybara Word of the Day.
You will need to set up your own email account and Instagram account to use this. This simply uses an automated sandbox browser to work, it is not a bot.

Just a quick project I made, there's a lot of things that could be changed to your liking, it's pretty barebones. There's no exports so it cannot be required, but that I plan to change.

This currently only supports one recipient, it can be modified to support multiple or BCC, when I get to it this will become a feature. (also a Discord bot, because that's the only thing I'm good at)

If I get access to the Instagram API, this will be updated. You could also probably use Mailgun to automate the emailing process, I just used Gmail for this.

### Setup
1. [Cloning the repo](#cloning)
2. [Setting up the environment](#environment)
3. [Using](#using)


#### Cloning
Clone the repo to your local machine. You can do this multiple ways:
1. Download the zip file and extract it
2. Use GitHub Desktop
3. Using the command line

#### Environment
Once you have the repo installed, you will want to install the dependencies. You can do this simply by running `npm install` in the command line.

After that, you will need to set up your own `.env` file. This is where you will store your email and Instagram credentials. You can do this by creating a file called **.env** in the root directory of the project. You will need to add the following to the file:
```env
GMAIL_EMAIL={{YOUR EMAIL}}
GMAIL_PASSWORD={{YOUR PASSWORD}}
INSTAGRAM_USERNAME={{YOUR USERNAME}}
INSTAGRAM_PASSWORD={{YOUR PASSWORD}}

EMAIL_RECIPIENT={{WHO TO SEND IT TO}}
```

Make sure to replace the values with your own, the curly braces should also be removed. The email recipient is the person who will receive the email. This can be yourself, or someone else.

#### Using
Once you have the environment set up, you can run the program by running `npm run deploy` in the command line.
This will run the program and send the email to the recipient every time a new Word of the Day is posted (margin of error is 20 minutes).

This also has support for [PM2](https://pm2.keymetrics.io/), so you can run it in the background. When using `npm run pm2` it will run **deploy** and name the PM2 process **capy-wotd**.

### Contributing
Since this was a quickly made project, there's a lot of things that could be changed. If you want to contribute, feel free to make a pull request. This is also a MIT licensed project, so modify and do whatever you want with it.