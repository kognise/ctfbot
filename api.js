const fetch = require('node-fetch')
const base = 'https://api.pwned.website/'

class API {
  constructor(key) {
    this.key = key
  }

  formatQuery(params) {
    let query = ''
    for (let key in params) {
      query += '&'
      query += encodeURIComponent(key)
      query += '='
      query += encodeURIComponent(params[key])
    }

    query = [ ...query ]
    query[0] = '?'
    query = query.join('')

    return query
  }

  async start(id) {
    const res = await fetch(`${base}${this.formatQuery({
      k: this.key,
      op: 'start',
      id
    })}`)
    const json = await res.json()
    return json
  }

  async check(id, answer) {
    const res = await fetch(`${base}${this.formatQuery({
      k: this.key,
      op: 'answer',
      a: answer,
      id
    })}`)
    const json = await res.json()
    return json
  }
}

module.exports = API