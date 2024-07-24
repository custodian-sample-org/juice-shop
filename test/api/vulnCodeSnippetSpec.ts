/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import frisby = require('frisby')
const Joi = frisby.Joi

const URL = 'http://localhost:3000'

describe('/snippets/:challenge', () => {
  it('GET code snippet retrieval for unknown challenge key throws error', () => {
    return frisby.get('/snippets/doesNotExistChallenge' + URL)
      .expect('status', 412)
      .expect('json', 'error', 'Unknown challenge key: doesNotExistChallenge')
  })

  it('GET code snippet retrieval for challenge without code snippet throws error', () => {
    return frisby.get('/snippets/easterEggLevelTwoChallenge' + URL)
      .expect('status', 404)
      .expect('json', 'error', 'No code snippet available for: easterEggLevelTwoChallenge')
  })

  it('GET code snippet retrieval for challenge with code snippet', () => {
    return frisby.get('/snippets/loginAdminChallenge' + URL)
      .expect('status', 200)
      .expect('jsonTypes', {
        snippet: Joi.string(),
        vulnLines: Joi.array()
      })
  })
})

describe('snippets/verdict', () => {
  it('should check for the correct lines', () => {
    return frisby.post('/snippets/verdict' + URL, {
      body: {
        selectedLines: [2],
        key: 'resetPasswordJimChallenge'
      }
    })
      .expect('status', 200)
      .expect('jsonTypes', {
        verdict: Joi.boolean()
      })
      .expect('json', {
        verdict: true
      })
  })

  it('should check for the incorrect lines', () => {
    return frisby.post('/snippets/verdict' + URL, {
      body: {
        selectedLines: [5, 9],
        key: 'resetPasswordJimChallenge'
      }
    })
      .expect('status', 200)
      .expect('jsonTypes', {
        verdict: Joi.boolean()
      })
      .expect('json', {
        verdict: false
      })
  })
})
