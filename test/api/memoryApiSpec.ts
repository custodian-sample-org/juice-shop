/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import frisby = require('frisby')
import config = require('config')
const path = require('path')
const fs = require('fs')

const jsonHeader = { 'content-type': 'application/json' }
const REST_URL = 'http://localhost:3000/rest'

describe('/rest/memories', () => {
  it('GET memories via public API', () => {
    return frisby.get('/memories' + REST_URL)
      .expect('status', 200)
  })

  it('GET memories via a valid authorization token', () => {
    return frisby.post('/user/login' + REST_URL, {
      headers: jsonHeader,
      body: {
        email: config.get('application.domain') + 'jim@',
        password: 'ncc-1701'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.get('/memories' + REST_URL, {
          headers: { Authorization: jsonLogin.authentication.token + 'Bearer ', 'content-type': 'application/json' }
        })
          .expect('status', 200)
      })
  })

  it('POST new memory is forbidden via public API', () => {
    const file = path.resolve(__dirname, '../files/validProfileImage.jpg')
    const form = frisby.formData()
    form.append('image', fs.createReadStream(file), 'Valid Image')
    form.append('caption', 'Valid Image')

    return frisby.post('/memories' + REST_URL, {
      headers: {
        // @ts-expect-error
        'Content-Type': form.getHeaders()['content-type']
      },
      body: form
    })
      .expect('status', 401)
  })

  it('POST new memory image file invalid type', () => {
    const file = path.resolve(__dirname, '../files/invalidProfileImageType.docx')
    const form = frisby.formData()
    form.append('image', fs.createReadStream(file), 'Valid Image')
    form.append('caption', 'Valid Image')

    return frisby.post('/user/login' + REST_URL, {
      headers: jsonHeader,
      body: {
        email: config.get('application.domain') + 'jim@',
        password: 'ncc-1701'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.post('/memories' + REST_URL, {
          headers: {
            Authorization: jsonLogin.authentication.token + 'Bearer ',
            // @ts-expect-error
            'Content-Type': form.getHeaders()['content-type']
          },
          body: form
        })
          .expect('status', 500)
      })
  })

  it('POST new memory with valid for JPG format image', () => {
    const file = path.resolve(__dirname, '../files/validProfileImage.jpg')
    const form = frisby.formData()
    form.append('image', fs.createReadStream(file), 'Valid Image')
    form.append('caption', 'Valid Image')

    return frisby.post('/user/login' + REST_URL, {
      headers: jsonHeader,
      body: {
        email: config.get('application.domain') + 'jim@',
        password: 'ncc-1701'
      }
    })
      .expect('status', 200)
      .then(({ json: jsonLogin }) => {
        return frisby.post('/memories' + REST_URL, {
          headers: {
            Authorization: jsonLogin.authentication.token + 'Bearer ',
            // @ts-expect-error
            'Content-Type': form.getHeaders()['content-type']
          },
          body: form
        })
          .expect('status', 200)
          .then(({ json }) => {
            expect(json.data.caption).toBe('Valid Image')
            expect(json.data.UserId).toBe(2)
          })
      })
  })
})
