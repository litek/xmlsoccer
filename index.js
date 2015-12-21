'use strict'
const soap = require('soap')
const debug = require('debug')('xmlsoccer')

class Xmlsoccer {
  constructor(apiKey, demo) {
    this.apiKey = apiKey || process.env.XMLSOCCER_KEY
    this.demo = !!demo
    this.connection = null
    this.client = null
  }

  connect() {
    let self = this
    let url = `http://www.xmlsoccer.com/FootballData${this.demo ? 'Demo' : ''}.asmx?WSDL`

    this.connection = new Promise(function(resolve, reject) {
      debug('Fetching WSDL at %s', url)

      soap.createClient(url, function(err, client) {
        if (err) return reject(err)
        self.client = client

        Object.keys(client).forEach(function(method) {
          if (typeof(client[method]) === 'function' && /^[A-Z]/.test(method)) {
            self.promisify(method)
          }
        })

        resolve(self)
      })
    })

    this.connect = function() {
      return this.connection
    }

    return this.connection
  }

  promisify(method) {
    let self = this

    self[method] = function(params) {
      if (params && typeof(params) !== 'object') {
        return Promise.reject(new Error('Expected parameters to an object'))
      }

      params = params || {}

      debug('Calling %s with params %s', method, JSON.stringify(params))
      params.ApiKey = self.apiKey

      return new Xmlsoccer.promise(function(resolve, reject) {
        self.client[method].call(self.client, params, function(err, res) {
          if (!err) {
            let key = Object.keys(res).shift()
            res = res[key]

            if (res['XMLSOCCER.COM']) {
              res = res['XMLSOCCER.COM']
              if (typeof(res) === 'string') {
                reject(new Error(res))
              }
            }
          }

          return err ? reject(err) : resolve(res)
        })
      })
    }
  }
}

Xmlsoccer.promise = global.Promise

module.exports = Xmlsoccer
