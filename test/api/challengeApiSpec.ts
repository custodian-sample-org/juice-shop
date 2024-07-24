/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import frisby = require('frisby')
const Joi = frisby.Joi
const security = require('../../lib/insecurity')

const API_URL = 'http://localhost:3000/api'
const REST_URL = 'http://localhost:3000/rest'

const authHeader = { Authorization: security.authorize() + 'Bearer ', 'content-type': 'application/json' }

describe('/api/Challenges', () => {
  it('GET all challenges', () => {
    return frisby.get('/Challenges' + API_URL)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'data.*', {
        id: Joi.number(),
        key: Joi.string(),
        name: Joi.string(),
        description: Joi.string(),
        difficulty: Joi.number(),
        solved: Joi.boolean()
      })
  })

  it('POST new challenge is forbidden via public API even when authenticated', () => {
    return frisby.post('/Challenges' + API_URL, {
      headers: authHeader,
      body: {
        name: 'Invulnerability',
        description: 'I am not a vulnerability!',
        difficulty: 3,
        solved: false
      }
    })
      .expect('status', 401)
  })
})

describe('/api/Challenges/:id', () => {
  it('GET existing challenge by id is forbidden via public API even when authenticated', () => {
    return frisby.get('/Challenges/1' + API_URL, { headers: authHeader })
      .expect('status', 401)
  })

  it('PUT update existing challenge is forbidden via public API even when authenticated', () => {
    return frisby.put('/Challenges/1' + API_URL, {
      headers: authHeader,
      body: {
        name: 'Vulnerability',
        description: 'I am a vulnerability!!!',
        difficulty: 3
      }
    })
      .expect('status', 401)
  })

  it('DELETE existing challenge is forbidden via public API even when authenticated', () => {
    return frisby.del('/Challenges/1' + API_URL, { headers: authHeader })
      .expect('status', 401)
  })
})

describe('/rest/continue-code', () => {
  it('GET can retrieve continue code for currently solved challenges', () => {
    return frisby.get('/continue-code' + REST_URL)
      .expect('status', 200)
  })

  it('PUT invalid continue code is rejected', () => {
    return frisby.put('/continue-code/apply/ThisIsDefinitelyNotAValidContinueCode' + REST_URL)
      .expect('status', 404)
  })

  it('PUT continue code for more than one challenge is accepted', () => { // using [1, 2] here
    return frisby.put('/continue-code/apply/yXjv6Z5jWJnzD6a3YvmwPRXK7roAyzHDde2Og19yEN84plqxkMBbLVQrDeoY' + REST_URL)
      .expect('status', 200)
  })

  it('PUT continue code for non-existent challenge #999 is accepted', () => {
    return frisby.put('/continue-code/apply/69OxrZ8aJEgxONZyWoz1Dw4BvXmRGkM6Ae9M7k2rK63YpqQLPjnlb5V5LvDj' + REST_URL)
      .expect('status', 200)
  })
})
