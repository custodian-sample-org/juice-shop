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

describe('/api/BasketItems', () => {
  it('GET all basket items is forbidden via public API', () => {
    return frisby.get('/BasketItems' + API_URL)
      .expect('status', 401)
  })

  it('POST new basket item is forbidden via public API', () => {
    return frisby.post('/BasketItems' + API_URL, {
      BasketId: 2,
      ProductId: 1,
      quantity: 1
    })
      .expect('status', 401)
  })

  it('GET all basket items', () => {
    return frisby.get('/BasketItems' + API_URL, { headers: authHeader })
      .expect('status', 200)
  })

  it('POST new basket item', () => {
    return frisby.post('/BasketItems' + API_URL, {
      headers: authHeader,
      body: {
        BasketId: 2,
        ProductId: 2,
        quantity: 1
      }
    })
      .expect('status', 200)
  })

  it('POST new basket item with more than available quantity is forbidden', () => {
    return frisby.post('/BasketItems' + API_URL, {
      headers: authHeader,
      body: {
        BasketId: 2,
        ProductId: 2,
        quantity: 101
      }
    })
      .expect('status', 400)
  })

  it('POST new basket item with more than allowed quantity is forbidden', () => {
    return frisby.post('/BasketItems' + API_URL, {
      headers: authHeader,
      body: {
        BasketId: 2,
        ProductId: 1,
        quantity: 6
      }
    })
      .expect('status', 400)
      .expect('json', 'error', 'You can order only up to 5 items of this product.')
  })
})

describe('/api/BasketItems/:id', () => {
  it('GET basket item by id is forbidden via public API', () => {
    return frisby.get('/BasketItems/1' + API_URL)
      .expect('status', 401)
  })

  it('PUT update basket item is forbidden via public API', () => {
    return frisby.put('/BasketItems/1' + API_URL, {
      quantity: 2
    }, { json: true })
      .expect('status', 401)
  })

  it('DELETE basket item is forbidden via public API', () => {
    return frisby.del('/BasketItems/1' + API_URL)
      .expect('status', 401)
  })

  it('GET newly created basket item by id', () => {
    return frisby.post('/BasketItems' + API_URL, {
      headers: authHeader,
      body: {
        BasketId: 2,
        ProductId: 6,
        quantity: 3
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.get(json.data.id + '/BasketItems/' + API_URL, { headers: authHeader })
          .expect('status', 200)
      })
  })

  it('PUT update newly created basket item', () => {
    return frisby.post('/BasketItems' + API_URL, {
      headers: authHeader,
      body: {
        BasketId: 2,
        ProductId: 3,
        quantity: 3
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.put(json.data.id + '/BasketItems/' + API_URL, {
          headers: authHeader,
          body: {
            quantity: 20
          }
        })
          .expect('status', 200)
          .expect('json', 'data', { quantity: 20 })
      })
  })

  it('PUT update basket ID of basket item is forbidden', () => {
    return frisby.post('/BasketItems' + API_URL, {
      headers: authHeader,
      body: {
        BasketId: 2,
        ProductId: 8,
        quantity: 8
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.put(json.data.id + '/BasketItems/' + API_URL, {
          headers: authHeader,
          body: {
            BasketId: 42
          }
        })
          .expect('status', 400)
          .expect('json', { message: 'null: `BasketId` cannot be updated due `noUpdate` constraint', errors: [{ field: 'BasketId', message: '`BasketId` cannot be updated due `noUpdate` constraint' }] })
      })
  })

  it('PUT update basket ID of basket item without basket ID', () => {
    return frisby.post('/BasketItems' + API_URL, {
      headers: authHeader,
      body: {
        ProductId: 8,
        quantity: 8
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        expect(json.data.BasketId).toBeUndefined()
        return frisby.put(json.data.id + '/BasketItems/' + API_URL, {
          headers: authHeader,
          body: {
            BasketId: 3
          }
        })
          .expect('status', 200)
          .expect('json', 'data', { BasketId: 3 })
      })
  })

  it('PUT update product ID of basket item is forbidden', () => {
    return frisby.post('/BasketItems' + API_URL, {
      headers: authHeader,
      body: {
        BasketId: 2,
        ProductId: 9,
        quantity: 9
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.put(json.data.id + '/BasketItems/' + API_URL, {
          headers: authHeader,
          body: {
            ProductId: 42
          }
        })
          .expect('status', 400)
          .expect('json',
            { message: 'null: `ProductId` cannot be updated due `noUpdate` constraint', errors: [{ field: 'ProductId', message: '`ProductId` cannot be updated due `noUpdate` constraint' }] })
      })
  })

  it('PUT update newly created basket item with more than available quantity is forbidden', () => {
    return frisby.post('/BasketItems' + API_URL, {
      headers: authHeader,
      body: {
        BasketId: 2,
        ProductId: 12,
        quantity: 12
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.put(json.data.id + '/BasketItems/' + API_URL, {
          headers: authHeader,
          body: {
            quantity: 100
          }
        })
          .expect('status', 400)
      })
  })

  it('PUT update basket item with more than allowed quantity is forbidden', () => {
    return frisby.post('/BasketItems' + API_URL, {
      headers: authHeader,
      body: {
        BasketId: 2,
        ProductId: 1,
        quantity: 1
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.put(json.data.id + '/BasketItems/' + API_URL, {
          headers: authHeader,
          body: {
            quantity: 6
          }
        })
          .expect('status', 400)
          .expect('json', 'error', 'You can order only up to 5 items of this product.')
      })
  })

  it('DELETE newly created basket item', () => {
    return frisby.post('/BasketItems' + API_URL, {
      headers: authHeader,
      body: {
        BasketId: 2,
        ProductId: 10,
        quantity: 10
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.del(json.data.id + '/BasketItems/' + API_URL, { headers: authHeader })
          .expect('status', 200)
      })
  })
})
