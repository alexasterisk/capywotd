/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'dotenv/config';

import { Browser, Page, launch } from 'puppeteer';
import { createTransport } from 'nodemailer';
import { CronJob } from 'cron';
import { getRandomName } from './names.js';

const transporter = createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_EMAIL!,
        pass: process.env.GMAIL_PASSWORD!
    }
});

function composeEmail(data: string) {
    transporter.sendMail(
        {
            from:
                getRandomName() + ` the Capybara <${process.env.GMAIL_EMAIL!}>`,
            to: process.env.EMAIL_RECIPIENT!,
            subject: 'Capybara Word of the Day',
            text: "Want to know what today's word is? Click here to find out!",
            html: '<img src="cid:wotd"/>',
            attachments: [
                {
                    filename: 'word-of-the-day.png',
                    path: data,
                    cid: 'wotd'
                }
            ]
        },
        (err, info) => {
            if (err) console.error(err);
            else console.log('Sent!', info.response);
        }
    );
}

async function openInstagram(browser: Browser): Promise<Page> {
    const page = await browser.newPage();
    await page.goto('https://www.instagram.com/accounts/?source=auth_switcher');
    await page.waitForSelector('input[name="username"]');
    await page.type('input[name="username"]', process.env.INSTAGRAM_USERNAME!);
    await page.type('input[name="password"]', process.env.INSTAGRAM_PASSWORD!);
    await (await page.$('button[type="submit"]'))?.click();
    return page;
}

async function getWordOfTheDay(
    browser: Browser,
    page: Page
): Promise<string | null> {
    await page.goto('https://www.instagram.com/capywordoftheday');
    return page
        .waitForSelector('h2[class="_aacl _aacs _aact _aacx _aada"]')
        .then(async () => {
            return page.evaluate(() => {
                return document.querySelectorAll('img')[6].getAttribute('src');
            });
        })
        .catch(async (err) => {
            console.warn('ran into an issue getting image, retrying...', err);
            await page.close();
            return getWordOfTheDay(browser, await openInstagram(browser));
        });
}

let lastImage = '';
const browser = await launch({ args: ['--no-sandbow'] });

const instagram = await openInstagram(browser);

new CronJob(
    '*/20 * * * *',
    async () => {
        const image = await getWordOfTheDay(browser, instagram);
        if (image && image !== lastImage) {
            lastImage = image;
            await instagram.goto(image);
            composeEmail(image);
        }
    },
    null,
    true,
    'America/New_York'
);
