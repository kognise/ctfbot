require('dotenv').config()

const Discord = require('discord.js')
const API = require('./api')

const client = new Discord.Client()
const api = new API(process.env.API_KEY)

const prefix = '>ctf'
const colors = {
  success: 6937468,
  error: 16405074,
  info: 3382000
}
const embedBase = {
  color: colors.success,
  footer: {
    icon_url: 'https://pwnsquad.net/static/logo.png',
    text: 'A bot by PwnSquad'
  },
  author: {
    name: 'CTFBot'
  }
}

async function sendError(msg, error) {
  await msg.channel.send({
    embed: {
      ...embedBase,
      title: 'Error',
      description: `Oh no! It looks like an error occurred while running your command. The error was \`${error}\`.`,
      color: colors.error
    }
  })
}

client.on('ready', () => {
  client.user.setActivity('for attacks | >ctfhelp', { type: 'WATCHING' })
  embedBase.author.icon_url = client.user.avatarURL
  console.log(`> Logged in as ${client.user.tag}`)
})

async function start(msg) {
  const json = await api.start(msg.author.id)
  if (json.error) {
    if (json.error === 'id in use') {
      await msg.channel.send({
        embed: {
          ...embedBase,
          title: 'CTF Already Started',
          description: `It looks like you've already started a CTF! You can run \`${prefix}check <ANSWER>\` to check your results and \`${prefix}cancel\` to cancel it.`,
          color: colors.error
        }
      })
    } else {
      await sendError(json.error)
    }
  } else {
    await msg.channel.send({
      embed: {
        ...embedBase,
        title: 'CTF Started',
        description: `Good job! You started a CTF. Good luck and have fun, and remember: beware programmers with screwdrivers. **Make sure to input your invite code quickly! It can only be used once.** You can submit an answer with \`${prefix}check <ANSWER>\`, and cancel the CTF with \`${prefix}cancel\`.`,
        fields: [
          {
            name: 'Target',
            value: 'https://pwned.website/'
          },
          {
            name: 'Goal',
            value: json.result.goal
          },
          {
            name: 'Level',
            value: json.result.level,
            inline: true
          },
          {
            name: 'Tries',
            value: json.result.maxTries.toString(),
            inline: true
          },
          {
            name: 'Invite code',
            value: `\`${json.result.invite}\``
          }
        ]
      }
    })
  }
}

async function cancel(msg) {
  const json = await api.cancel(msg.author.id)
  if (json.error) {
    if (json.error === 'invalid id') {
      await msg.channel.send({
        embed: {
          ...embedBase,
          title: 'CTF Not Started',
          description: `You haven't started a CTF yet! You can start one by running \`${prefix}start\` (but it would be silly to start a CTF just to cancel it).`,
          color: colors.error
        }
      })
    } else {
      await sendError(msg, json.error)
    }
  } else {
    await msg.channel.send({
      embed: {
        ...embedBase,
        title: 'CTF Canceled',
        description: `Your currently running CTF has been canceled! You can start a new one by runnig \`${prefix}start\` again.`
      }
    })
  }
}

async function check(msg) {
  const answer = msg.content.split(' ')[1]
  if (!answer) {
    await msg.channel.send({
      embed: {
        ...embedBase,
        title: 'Error',
        description: `Please specify an answer! The correct format is \`${prefix}check <ANSWER>\`.`,
        color: colors.error
      }
    })
    return
  }
  const json = await api.check(msg.author.id, answer)
  if (json.error) {
    if (json.error === 'invalid id') {
      await msg.channel.send({
        embed: {
          ...embedBase,
          title: 'CTF Not Started',
          description: `You haven't started a CTF yet! You can start one by running \`${prefix}start\`.`,
          color: colors.error
        }
      })
    } else {
      await sendError(msg, json.error)
    }
  } else {
    if (json.result.failure === 'true') {
      await msg.channel.send({
        embed: {
          ...embedBase,
          title: 'Out of Tries',
          description: `It looks like you ran out of tries! You can end the CTF by running \`${prefix}cancel\`.`,
          color: colors.error
        }
      })
    } else if (json.result.correct === 'false') {
      await msg.channel.send({
        embed: {
          ...embedBase,
          title: 'Incorrect Answer',
          description: 'Sorry, but that\'s the wrong answer.',
          color: colors.error,
          fields: [
            {
              name: 'Tries left',
              value: (json.result.maxTries - json.result.tries).toString(),
              inline: true
            },
            {
              name: 'Total tries',
              value: json.result.maxTries.toString(),
              inline: true
            }
          ]
        }
      })
    } else {
      await msg.channel.send({
        embed: {
          ...embedBase,
          title: 'Correct Answer',
          description: `Congratulations! You got the correct answer. You can start another CTF by running \`${prefix}start\` again.`
        }
      })
    }
  }
}

async function help(msg) {
  await msg.channel.send({
    embed: {
      ...embedBase,
      title: 'Help',
      description: `
Hi! I'm a bot for playing hacking CTFs. Here are my commands:
- \`${prefix}help\`
- \`${prefix}start\`
- \`${prefix}cancel\`
- \`${prefix}check <ANSWER>\`
      `.trim(),
      color: colors.info
    }
  })
}

client.on('message', async (msg) => {
  if (msg.content.startsWith(`${prefix}start`)) {
    await start(msg)
  } else if (msg.content.startsWith(`${prefix}cancel`)) {
    await cancel(msg)
  } else if (msg.content.startsWith(`${prefix}check`)) {
    await check(msg)
  } else if (msg.content.startsWith(`${prefix}help`)) {
    await help(msg)
  }
})

client.login(process.env.BOT_TOKEN)