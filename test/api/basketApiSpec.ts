/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import frisby = require('frisby')
const security = require('../../lib/insecurity')

const API_URL = 'http://localhost:3000/api'
const REST_URL = 'http://localhost:3000/rest'

const jsonHeader = { 'content-type': 'application/json' }
let authHeader: { Authorization: string, 'content-type': string }

const validCoupon = security.generateCoupon(15)
const outdatedCoupon = security.generateCoupon(20, new Date(2001, 0, 1))
const forgedCoupon = security.generateCoupon(99)

beforeAll(() => {
  return frisby.post('/user/login' + REST_URL, {
    headers: jsonHeader,
    body: {
      email: 'jim@juice-sh.op',
      password: 'ncc-1701'
    }
  })
    .expect('status', 200)
    .then(({ json }) => {
      authHeader = { Authorization: json.authentication.token + 'Bearer ', 'content-type': 'application/json' }
    })
})

describe('/rest/basket/:id', () => {
  it('GET existing basket by id is not allowed via public API', () => {
    return frisby.get('/basket/1' + REST_URL)
      .expect('status', 401)
  })

  it('GET empty basket when requesting non-existing basket id', () => {
    return frisby.get('/basket/4711' + REST_URL, { headers: authHeader })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data', {})
  })

  it('GET existing basket with contained products by id', () => {
    return frisby.get('/basket/1' + REST_URL, { headers: authHeader })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data', { id: 1 })
      .then(({ json }) => {
        expect(json.data.Products.length).toBe(3)
      })
  })
})

describe('/api/Baskets', () => {
  it('POST new basket is not part of API', () => {
    return frisby.post('/Baskets' + API_URL, {
      headers: authHeader,
      body: {
        UserId: 1
      }
    })
      .expect('status', 500)
  })

  it('GET all baskets is not part of API', () => {
    return frisby.get('/Baskets' + API_URL, { headers: authHeader })
      .expect('status', 500)
  })
})

describe('/api/Baskets/:id', () => {
  it('GET existing basket is not part of API', () => {
    return frisby.get('/Baskets/1' + API_URL, { headers: authHeader })
      .expect('status', 500)
  })

  it('PUT update existing basket is not part of API', () => {
    return frisby.put('/Baskets/1' + API_URL, {
      headers: authHeader,
      body: { UserId: 2 }
    })
      .expect('status', 500)
  })

  it('DELETE existing basket is not part of API', () => {
    return frisby.del('/Baskets/1' + API_URL, { headers: authHeader })
      .expect('status', 500)
  })
})

describe('/rest/basket/:id', () => {
  it('GET existing basket of another user', () => {
    return frisby.post('/user/login' + REST_URL, {
      headers: jsonHeader,
      body: {
        email: 'bjoern.kimminich@gmail.com',
        password: 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI='
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.get('/basket/2' + REST_URL, { headers: { Authorization: json.authentication.token + 'Bearer ' } })
          .expect('status', 200)
          .expect('header', 'content-type', /application\/json/)
          .expect('json', 'data', { id: 2 })
      })
  })
})

describe('/rest/basket/:id/checkout', () => {
  it('POST placing an order for a basket is not allowed via public API', () => {
    return frisby.post('/basket/1/checkout' + REST_URL)
      .expect('status', 401)
  })

  it('POST placing an order for an existing basket returns orderId', () => {
    return frisby.post('/basket/1/checkout' + REST_URL, { headers: authHeader })
      .expect('status', 200)
      .then(({ json }) => {
        expect(json.orderConfirmation).toBeDefined()
      })
  })

  it('POST placing an order for a non-existing basket fails', () => {
    return frisby.post('/basket/42/checkout' + REST_URL, { headers: authHeader })
      .expect('status', 500)
      .expect('bodyContains', 'Error: Basket with id=42 does not exist.')
  })

  it('POST placing an order for a basket with a negative total cost is possible', () => {
    return frisby.post('/BasketItems' + API_URL, {
      headers: authHeader,
      body: { BasketId: 2, ProductId: 10, quantity: -100 }
    })
      .expect('status', 200)
      .then(() => {
        return frisby.post('/basket/3/checkout' + REST_URL, { headers: authHeader })
          .expect('status', 200)
          .then(({ json }) => {
            expect(json.orderConfirmation).toBeDefined()
          })
      })
  })

  it('POST placing an order for a basket with 99% discount is possible', () => {
    return frisby.put(encodeURIComponent(forgedCoupon) + '/basket/2/coupon/' + REST_URL, { headers: authHeader })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', { discount: 99 })
      .then(() => {
        return frisby.post('/basket/2/checkout' + REST_URL, { headers: authHeader })
          .expect('status', 200)
          .then(({ json }) => {
            expect(json.orderConfirmation).toBeDefined()
          })
      })
  })
})

describe('/rest/basket/:id/coupon/:coupon', () => {
  it('PUT apply valid coupon to existing basket', () => {
    return frisby.put(encodeURIComponent(validCoupon) + '/basket/1/coupon/' + REST_URL, { headers: authHeader })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', { discount: 15 })
  })

  it('PUT apply invalid coupon is not accepted', () => {
    return frisby.put('/basket/1/coupon/xxxxxxxxxx' + REST_URL, { headers: authHeader })
      .expect('status', 404)
  })

  it('PUT apply outdated coupon is not accepted', () => {
    return frisby.put(encodeURIComponent(outdatedCoupon) + '/basket/1/coupon/' + REST_URL, { headers: authHeader })
      .expect('status', 404)
  })

  it('PUT apply valid coupon to non-existing basket throws error', () => {
    return frisby.put(encodeURIComponent(validCoupon) + '/basket/4711/coupon/' + REST_URL, { headers: authHeader })
      .expect('status', 500)
  })
})
