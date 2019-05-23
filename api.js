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

  async fetch(query) {
    const res = await fetch(`${base}${query}`)
    const json = await res.json()
    return json
  }

  async start(id) {
    const query = this.formatQuery({
      k: this.key,
      op: 'start',
      id
    })
    return await this.fetch(query)
  }

  async cancel(id) {
    const query = this.formatQuery({
      k: this.key,
      op: 'endctf',
      id
    })
    return await this.fetch(query)
  }

  async check(id, answer) {
    const query = this.formatQuery({
      k: this.key,
      op: 'answer',
      a: answer,
      id
    })
    return await this.fetch(query)
  }
}

module.exports = API