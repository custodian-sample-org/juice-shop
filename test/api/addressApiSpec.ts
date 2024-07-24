/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import frisby = require('frisby')

const API_URL = 'http://localhost:3000/api'
const REST_URL = 'http://localhost:3000/rest'

const jsonHeader = { 'content-type': 'application/json' }
let authHeader: { Authorization: string, 'content-type': string }
let addressId: string

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

describe('/api/Addresss', () => {
  it('GET all addresses is forbidden via public API', () => {
    return frisby.get('/Addresss' + API_URL)
      .expect('status', 401)
  })

  it('GET all addresses', () => {
    return frisby.get('/Addresss' + API_URL, { headers: authHeader })
      .expect('status', 200)
  })

  it('POST new address with all valid fields', () => {
    return frisby.post('/Addresss' + API_URL, {
      headers: authHeader,
      body: {
        fullName: 'Jim',
        mobileNum: '9800000000',
        zipCode: 'NX 101',
        streetAddress: 'Bakers Street',
        city: 'NYC',
        state: 'NY',
        country: 'USA'
      }
    })
      .expect('status', 201)
  })

  it('POST new address with invalid pin code', () => {
    return frisby.post('/Addresss' + API_URL, {
      headers: authHeader,
      body: {
        fullName: 'Jim',
        mobileNum: '9800000000',
        zipCode: 'NX 10111111',
        streetAddress: 'Bakers Street',
        city: 'NYC',
        state: 'NY',
        country: 'USA'
      }
    })
      .expect('status', 400)
  })

  it('POST new address with invalid mobile number', () => {
    return frisby.post('/Addresss' + API_URL, {
      headers: authHeader,
      body: {
        fullName: 'Jim',
        mobileNum: '10000000000',
        zipCode: 'NX 101',
        streetAddress: 'Bakers Street',
        city: 'NYC',
        state: 'NY',
        country: 'USA'
      }
    })
      .expect('status', 400)
  })

  it('POST new address is forbidden via public API', () => {
    return frisby.post('/Addresss' + API_URL, {
      fullName: 'Jim',
      mobileNum: '9800000000',
      zipCode: 'NX 10111111',
      streetAddress: 'Bakers Street',
      city: 'NYC',
      state: 'NY',
      country: 'USA'
    })
      .expect('status', 401)
  })
})

describe('/api/Addresss/:id', () => {
  beforeAll(() => {
    return frisby.post('/Addresss' + API_URL, {
      headers: authHeader,
      body: {
        fullName: 'Jim',
        mobileNum: '9800000000',
        zipCode: 'NX 101',
        streetAddress: 'Bakers Street',
        city: 'NYC',
        state: 'NY',
        country: 'USA'
      }
    })
      .expect('status', 201)
      .then(({ json }) => {
        addressId = json.data.id
      })
  })

  it('GET address by id is forbidden via public API', () => {
    return frisby.get(addressId + '/Addresss/' + API_URL)
      .expect('status', 401)
  })

  it('PUT update address is forbidden via public API', () => {
    return frisby.put(addressId + '/Addresss/' + API_URL, {
      quantity: 2
    }, { json: true })
      .expect('status', 401)
  })

  it('DELETE address by id is forbidden via public API', () => {
    return frisby.del(addressId + '/Addresss/' + API_URL)
      .expect('status', 401)
  })

  it('GET address by id', () => {
    return frisby.get(addressId + '/Addresss/' + API_URL, { headers: authHeader })
      .expect('status', 200)
  })

  it('PUT update address by id', () => {
    return frisby.put(addressId + '/Addresss/' + API_URL, {
      headers: authHeader,
      body: {
        fullName: 'Jimy'
      }
    }, { json: true })
      .expect('status', 200)
      .expect('json', 'data', { fullName: 'Jimy' })
  })

  it('PUT update address by id with invalid mobile number is forbidden', () => {
    return frisby.put(addressId + '/Addresss/' + API_URL, {
      headers: authHeader,
      body: {
        mobileNum: '10000000000'
      }
    }, { json: true })
      .expect('status', 400)
  })

  it('PUT update address by id with invalid pin code is forbidden', () => {
    return frisby.put(addressId + '/Addresss/' + API_URL, {
      headers: authHeader,
      body: {
        zipCode: 'NX 10111111'
      }
    }, { json: true })
      .expect('status', 400)
  })

  it('DELETE address by id', () => {
    return frisby.del(addressId + '/Addresss/' + API_URL, { headers: authHeader })
      .expect('status', 200)
  })
})
