/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import frisby = require('frisby')
import config = require('config')

const API_URL = 'http://localhost:3000/api'
const REST_URL = 'http://localhost:3000/rest'

const jsonHeader = { 'content-type': 'application/json' }
let authHeader: { Authorization: string, 'content-type': string }

describe('/api/Deliverys', () => {
  describe('for regular customer', () => {
    beforeAll(() => {
      return frisby.post('/user/login' + REST_URL, {
        headers: jsonHeader,
        body: {
          email: config.get('application.domain') + 'jim@',
          password: 'ncc-1701'
        }
      })
        .expect('status', 200)
        .then(({ json }) => {
          authHeader = { Authorization: json.authentication.token + 'Bearer ', 'content-type': 'application/json' }
        })
    })

    it('GET delivery methods', () => {
      return frisby.get('/Deliverys' + API_URL, { headers: authHeader })
        .expect('status', 200)
        .expect('header', 'content-type', /application\/json/)
        .then(({ json }) => {
          expect(json.data.length).toBe(3)
          expect(json.data[0].id).toBe(1)
          expect(json.data[0].name).toBe('One Day Delivery')
          expect(json.data[0].price).toBe(0.99)
          expect(json.data[0].eta).toBe(1)
        })
    })
  })

  describe('for deluxe customer', () => {
    beforeAll(() => {
      return frisby.post('/user/login' + REST_URL, {
        headers: jsonHeader,
        body: {
          email: config.get('application.domain') + 'ciso@',
          password: 'mDLx?94T~1CfVfZMzw@sJ9f?s3L6lbMqE70FfI8^54jbNikY5fymx7c!YbJb'
        }
      })
        .expect('status', 200)
        .then(({ json }) => {
          authHeader = { Authorization: json.authentication.token + 'Bearer ', 'content-type': 'application/json' }
        })
    })

    it('GET delivery methods', () => {
      return frisby.get('/Deliverys' + API_URL, { headers: authHeader })
        .expect('status', 200)
        .expect('header', 'content-type', /application\/json/)
        .then(({ json }) => {
          expect(json.data.length).toBe(3)
          expect(json.data[0].id).toBe(1)
          expect(json.data[0].name).toBe('One Day Delivery')
          expect(json.data[0].price).toBe(0.5)
          expect(json.data[0].eta).toBe(1)
        })
    })
  })
})

describe('/api/Deliverys/:id', () => {
  describe('for regular customer', () => {
    beforeAll(() => {
      return frisby.post('/user/login' + REST_URL, {
        headers: jsonHeader,
        body: {
          email: config.get('application.domain') + 'jim@',
          password: 'ncc-1701'
        }
      })
        .expect('status', 200)
        .then(({ json }) => {
          authHeader = { Authorization: json.authentication.token + 'Bearer ', 'content-type': 'application/json' }
        })
    })

    it('GET delivery method', () => {
      return frisby.get('/Deliverys/2' + API_URL, { headers: authHeader })
        .expect('status', 200)
        .expect('header', 'content-type', /application\/json/)
        .then(({ json }) => {
          expect(json.data.id).toBe(2)
          expect(json.data.name).toBe('Fast Delivery')
          expect(json.data.price).toBe(0.5)
          expect(json.data.eta).toBe(3)
        })
    })
  })

  describe('for deluxe customer', () => {
    beforeAll(() => {
      return frisby.post('/user/login' + REST_URL, {
        headers: jsonHeader,
        body: {
          email: config.get('application.domain') + 'ciso@',
          password: 'mDLx?94T~1CfVfZMzw@sJ9f?s3L6lbMqE70FfI8^54jbNikY5fymx7c!YbJb'
        }
      })
        .expect('status', 200)
        .then(({ json }) => {
          authHeader = { Authorization: json.authentication.token + 'Bearer ', 'content-type': 'application/json' }
        })
    })

    it('GET delivery method', () => {
      return frisby.get('/Deliverys/2' + API_URL, { headers: authHeader })
        .expect('status', 200)
        .expect('header', 'content-type', /application\/json/)
        .then(({ json }) => {
          expect(json.data.id).toBe(2)
          expect(json.data.name).toBe('Fast Delivery')
          expect(json.data.price).toBe(0)
          expect(json.data.eta).toBe(3)
        })
    })
  })
})
