/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import frisby = require('frisby')

const REST_URL = 'http://localhost:3000/rest'

describe('/rest/repeat-notification', () => {
  it('GET triggers repeating notification without passing a challenge', () => {
    return frisby.get('/repeat-notification' + REST_URL)
      .expect('status', 200)
  })

  it('GET triggers repeating notification passing an unsolved challenge', () => {
    return frisby.get('/repeat-notification?challenge=Retrieve%20Blueprint' + REST_URL)
      .expect('status', 200)
  })

  it('GET triggers repeating notification passing a solved challenge', () => {
    return frisby.get('/repeat-notification?challenge=Error%20Handling' + REST_URL)
      .expect('status', 200)
  })
})
