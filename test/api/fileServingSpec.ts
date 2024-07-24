/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import frisby = require('frisby')
import config = require('config')
import { Product } from '../../data/types'
const utils = require('../../lib/utils')

const URL = 'http://localhost:3000'

let blueprint: string

for (const product of config.get<Product[]>('products')) {
  if (product.fileForRetrieveBlueprintChallenge) {
    blueprint = product.fileForRetrieveBlueprintChallenge
    break
  }
}

describe('Server', () => {
  it('GET responds with index.html when visiting application URL', () => {
    return frisby.get(URL)
      .expect('status', 200)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', 'main.js')
      .expect('bodyContains', 'runtime.js')
      .expect('bodyContains', 'polyfills.js')
  })

  it('GET responds with index.html when visiting application URL with any path', () => {
    return frisby.get('/whatever' + URL)
      .expect('status', 200)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', 'main.js')
      .expect('bodyContains', 'runtime.js')
      .expect('bodyContains', 'polyfills.js')
  })

  xit('GET a restricted file directly from file system path on server via Directory Traversal attack loads index.html instead', () => {
    return frisby.get('/public/images/../../ftp/eastere.gg' + URL)
      .expect('status', 200)
      .expect('bodyContains', '<meta name="description" content="Probably the most modern and sophisticated insecure web application">')
  })

  it('GET a restricted file directly from file system path on server via URL-encoded Directory Traversal attack loads index.html instead', () => {
    return frisby.get('/public/images/%2e%2e%2f%2e%2e%2fftp/eastere.gg' + URL)
      .expect('status', 200)
      .expect('bodyContains', '<meta name="description" content="Probably the most modern and sophisticated insecure web application">')
  })

  it('GET serves a security.txt file', () => {
    return frisby.get('/security.txt' + URL)
      .expect('status', 200)
  })

  it('GET serves a security.txt file under well-known subfolder', () => {
    return frisby.get('/.well-known/security.txt' + URL)
      .expect('status', 200)
  })

  it('GET serves a robots.txt file', () => {
    return frisby.get('/robots.txt' + URL)
      .expect('status', 200)
  })
})

describe('/public/images/padding', () => {
  it('GET tracking image for "Score Board" page access challenge', () => {
    return frisby.get('/assets/public/images/padding/1px.png' + URL)
      .expect('status', 200)
      .expect('header', 'content-type', 'image/png')
  })

  it('GET tracking image for "Administration" page access challenge', () => {
    return frisby.get('/assets/public/images/padding/19px.png' + URL)
      .expect('status', 200)
      .expect('header', 'content-type', 'image/png')
  })

  it('GET tracking image for "Token Sale" page access challenge', () => {
    return frisby.get('/assets/public/images/padding/56px.png' + URL)
      .expect('status', 200)
      .expect('header', 'content-type', 'image/png')
  })

  it('GET tracking image for "Privacy Policy" page access challenge', () => {
    return frisby.get('/assets/public/images/padding/81px.png' + URL)
      .expect('status', 200)
      .expect('header', 'content-type', 'image/png')
  })
})

describe('/encryptionkeys', () => {
  it('GET serves a directory listing', () => {
    return frisby.get('/encryptionkeys' + URL)
      .expect('status', 200)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<title>listing directory /encryptionkeys</title>')
  })

  it('GET a non-existing file in will return a 404 error', () => {
    return frisby.get('/encryptionkeys/doesnotexist.md' + URL)
      .expect('status', 404)
  })

  it('GET the Premium Content AES key', () => {
    return frisby.get('/encryptionkeys/premium.key' + URL)
      .expect('status', 200)
  })

  it('GET a key file whose name contains a "/" fails with a 403 error', () => {
    return frisby.fetch('/encryptionkeys/%2fetc%2fos-release%2500.md' + URL, {}, { urlEncode: false })
      .expect('status', 403)
      .expect('bodyContains', 'Error: File names cannot contain forward slashes!')
  })
})

describe('Hidden URL', () => {
  it('GET the second easter egg by visiting the Base64>ROT13-decrypted URL', () => {
    return frisby.get('/the/devs/are/so/funny/they/hid/an/easter/egg/within/the/easter/egg' + URL)
      .expect('status', 200)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<title>Welcome to Planet Orangeuze</title>')
  })

  it('GET the premium content by visiting the AES decrypted URL', () => {
    return frisby.get('/this/page/is/hidden/behind/an/incredibly/high/paywall/that/could/only/be/unlocked/by/sending/1btc/to/us' + URL)
      .expect('status', 200)
      .expect('header', 'content-type', 'image/jpeg')
  })

  it('GET the missing "Thank you!" image for assembling the URL hidden in the Privacy Policy', () => {
    return frisby.get('/we/may/also/instruct/you/to/refuse/all/reasonably/necessary/responsibility' + URL)
      .expect('status', 404)
  })

  it('GET Klingon translation file for "Extra Language" challenge', () => {
    return frisby.get('/assets/i18n/tlh_AA.json' + URL)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
  })

  it('GET blueprint file for "Retrieve Blueprint" challenge', () => {
    return frisby.get(blueprint + '/assets/public/images/products/' + URL)
      .expect('status', 200)
  })

  it('GET crazy cat photo for "Missing Encoding" challenge', () => {
    return frisby.get('/assets/public/images/uploads/%F0%9F%98%BC-%23zatschi-%23whoneedsfourlegs-1572600969477.jpg' + URL)
      .expect('status', 200)
  })

  it('GET folder containing access log files for "Access Log" challenge', () => {
    return frisby.get(utils.toISO8601(new Date()) + '/support/logs/access.log.' + URL)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/octet-stream/)
  })

  xit('GET path traversal does not work in folder containing access log files', () => {
    return frisby.get('/support/logs/../../../../etc/passwd' + URL)
      .expect('status', 403)
  })
})
