const { launch } = require('puppeteer')
const { createTransport } = require('nodemailer')
const { CronJob } = require("cron")
const env = require("env.json")

const names = [ "Juan", "Jerry", "Jerome", "Julio", "Julius", "July", "June", "Jack", "Jacob", "Jessica", "James", "Joshua", "Jake", "Jayden", "Jamie", "Julia", "Julie", "Jasmine", "Jenson", "Jac", "John", "Josh", "Jackson", "Jasper", "Joe", "Joel", "Jaden", "Jakub", "Jay", "Jade", "Jaiden", "Jan", "Jasmin", "Jason", "Jemima", "Jennifer", "Jessica", "Jesse", "Jessie", "Jimmy", "Joey", "Jonah", "Jonathan", "Josephine", "Joshuah", "Josie", "Junior", "Ja", "Jace", "Jacey", "Jackie", "Jacoby", "Jacon", "Jacque", "Jacqueline", "Jacques", "Jacy", "Jada", "Jadan", "Jadie", "Jadon", "Jadyn", "Jae", "Jaeden", "Jaedon", "Jagger", "Jago", "Jagoda", "Jaheim", "Jai", "Jaida", "Jaidan", "Jaidon", "Jaime", "Jaimee", "Jaimie", "Jak", "Jakob", "Jamaal", "Jamal", "Jame", "Jameel", "Jamel", "Jamelia", "Jameson", "Jamielee", "Jamil", "Jamilia", "Jamima", "Jammie", "Jana", "Janae", "Jane", "Janelle", "Janet", "Janey", "Janice", "Janie", "Janine", "Jannah", "Jannat", "Jared", "Jarod", "Jarrod", "Jarred", "Jarrad", "Jarvis", "Jase", "Jasleen", "Jasmina", "Jasmyn", "Jaspreet", "Javan", "Javier", "Jawad", "Jax", "Jaxon", "Jaxson", "Jaya", "Jayan", "Jayce", "Jaycee", "Jayda", "Jaydan", "Jayde", "Jaydon", "Jaye", "Jayjay", "Jayke", "Jayla", "Jaylan", "Jaylen", "Jayme", "Jaymee", "Jaymie", "Jayne", "Jayson", "Jazmin", "Jazmine", "Jaymyn", "Jazz", "Jazzmin", "Jean-Baptiste", "Jean", "Jed", "Jeevan", "Jeff", "Jeffrey", "Jem", "Jemimah", "Jemina", "Jemma", "Jen", "Jena", "Jenifer", "Jenna", "Jennah", "Jenni", "Jennie", "Jenny", "Jeremiah", "Jeremy", "Jericho", "Jermaine", "Jerome", "Jerry", "Jerry", "Jerry", "Jerry", "Perry the Platypus" ]

async function open(browser) {
  const page = await browser.newPage()
  await page.goto('https://www.instagram.com/accounts/login/?source=auth_switcher')
  await page.waitForSelector('input[name=\'username\']')
  await page.type('input[name=\'username\']', env.insta.name)
  await page.type('input[name=\'password\']', env.insta.pass)
  await (await page.$('button[type=\'submit\']')).click()
  return page
}

async function getImage(browser, page) {
  await page.goto('https://www.instagram.com/capywordoftheday')
  return page.waitForSelector('h2[class=\'_aacl _aacs _aact _aacx _aada\']')
    .then(async () => {
      return page.evaluate(() => {
        return document.querySelectorAll('img')[6].getAttribute('src')
      })
    })
    .catch(async (err) => {
      console.warn('ran into an issue getting image, retrying...', err)
      await page.close()
      return getImage(browser, await open(browser))
    })
}

const transporter = createTransport({
  service: 'gmail',
  auth: { user: env.mail.name, pass: env.mail.pass }
})

function compose(img) {
  transporter.sendMail({
    from: `${names[Math.floor(Math.random() * names.length}]} the Capybara <${env.mail.name}>`,
    to: env.mail.to,
    subject: 'Capybara Word of the Day',
    text: 'Want to know what today\'s word is? Click here to find out!',
    html: '<img src="cid:wotd"/>',
    attachments: [{
      filename: 'word-of-the-day.png',
      path: img,
      cid: 'wotd'
    }]
  }, (err, info) => {
    if (err) console.error(err)
    else console.log('Sent!', info.response)
  })
}

(async () => {
  let lastImage = ''
  const browser = await launch({ args: ['--no-sandbox'] })
  const ig = await open(browser)
  new CronJob('*/20 * * * *', async () => {
    const img = await getImage(browser, ig)
    if (img !== lastImage) {
      lastImage = img
      await ig.goto(img)
      compose(img)
    }
  }, null, true, 'America/New_York')
})()
