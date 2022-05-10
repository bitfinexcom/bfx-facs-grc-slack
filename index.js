'use strict'

const util = require('util')
const Base = require('bfx-facs-base')

class GrcSlack extends Base {
  constructor (caller, opts, ctx) {
    super(caller, opts, ctx)

    this.name = 'grc-slack'
    this._hasConf = true
    this.init()

    if (opts.conf) this.conf = opts.conf
  }

  message (reqChannel, message) {
    if (!this.conf.enable) return Promise.resolve(false) // Add promise to keep consistency between returns
    const slack = this.conf
    const worker = slack.worker || 'rest:ext:slack'
    const maxLength = slack.max_length || 1024
    const env = (slack.env) ? `Env: ${slack.env}, ` : ''
    const rawText = env + message
    const text = (maxLength) ? rawText.substr(0, maxLength) : rawText
    const channel = reqChannel || slack.channel
    const send = [{ channel, text }]

    return this.caller.grc_bfx.req(
      worker,
      'postSlackMsg',
      send,
      { timeout: 10000 })
  }

  logError (reqChannel, err, ...extra) {
    const parseError = e => {
      if (err instanceof Error) return e.stack
      return e
    }
    const error = parseError(err)

    const extraP = (extra.length)
      ? `Extra: ${util.format(...extra.map(el => typeof el === 'object' ? util.inspect(el, { depth: 10 }) : el))}, `
      : ''
    const message = `${extraP}Error: ${error}`
    return this.message(reqChannel, message)
  }
}

module.exports = GrcSlack
