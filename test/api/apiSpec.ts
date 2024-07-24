/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import frisby = require('frisby')
import config = require('config')

const API_URL = 'http://localhost:3000/api'
const REST_URL = 'http://localhost:3000/rest'

describe('/api', () => {
  it('GET error when query /api without actual resource', () => {
    return frisby.get(API_URL)
      .expect('status', 500)
  })
})

describe('/rest', () => {
  it('GET error message with information leakage when calling unrecognized path with /rest in it', () => {
    return frisby.get('/unrecognized' + REST_URL)
      .expect('status', 500)
      .expect('bodyContains', ' (Express' + config.get('application.name') + '<h1>')
      .expect('bodyContains', 'Unexpected path: /rest/unrecognized')
  })
})
