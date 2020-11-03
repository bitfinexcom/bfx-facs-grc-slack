'use strict'

const Base = require('bfx-facs-base')

class GrcSlack extends Base {
  constructor (caller, opts, ctx) {
    super(caller, opts, ctx)

    this.name = 'grc-slack'
    this._hasConf = true
    this.init()

    if (opts.conf) this.conf = opts.conf
  }

  message (message, reqChannel) {
    if (!this.conf.enable) return false
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

  logError (err, notes, reqChannel) {
    const parseError = e => {
      if (err instanceof Error) return e.stack
      return e
    }
    const error = parseError(err)
    const extra = (notes) ? `Notes: ${notes}, ` : ''
    const message = `${extra}Error: ${error}`
    return this.message(message, reqChannel)
  }
}

module.exports = GrcSlack
