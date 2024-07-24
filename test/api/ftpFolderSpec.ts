/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import frisby = require('frisby')

const URL = 'http://localhost:3000'

describe('/ftp', () => {
  it('GET serves a directory listing', () => {
    return frisby.get('/ftp' + URL)
      .expect('status', 200)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<title>listing directory /ftp</title>')
  })

  it('GET a non-existing Markdown file in /ftp will return a 404 error', () => {
    return frisby.get('/ftp/doesnotexist.md' + URL)
      .expect('status', 404)
  })

  it('GET a non-existing PDF file in /ftp will return a 404 error', () => {
    return frisby.get('/ftp/doesnotexist.pdf' + URL)
      .expect('status', 404)
  })

  it('GET a non-existing file in /ftp will return a 403 error for invalid file type', () => {
    return frisby.get('/ftp/doesnotexist.exe' + URL)
      .expect('status', 403)
  })

  it('GET an existing file in /ftp will return a 403 error for invalid file type .gg', () => {
    return frisby.get('/ftp/eastere.gg' + URL)
      .expect('status', 403)
  })

  it('GET existing file /ftp/coupons_2013.md.bak will return a 403 error for invalid file type .bak', () => {
    return frisby.get('/ftp/coupons_2013.md.bak' + URL)
      .expect('status', 403)
  })

  it('GET existing file /ftp/package.json.bak will return a 403 error for invalid file type .bak', () => {
    return frisby.get('/ftp/package.json.bak' + URL)
      .expect('status', 403)
  })

  it('GET existing file /ftp/suspicious_errors.yml will return a 403 error for invalid file type .yml', () => {
    return frisby.get('/ftp/suspicious_errors.yml' + URL)
      .expect('status', 403)
  })

  it('GET the confidential file in /ftp', () => {
    return frisby.get('/ftp/acquisitions.md' + URL)
      .expect('status', 200)
      .expect('bodyContains', '# Planned Acquisitions')
  })

  it('GET the KeePass database in /ftp', () => {
    return frisby.get('/ftp/incident-support.kdbx' + URL)
      .expect('status', 200)
  })

  it('GET the easter egg file by using Poison Null Byte attack with .pdf suffix', () => {
    return frisby.get('/ftp/eastere.gg%00.pdf' + URL)
      .expect('status', 200)
      .expect('bodyContains', 'Congratulations, you found the easter egg!')
  })

  it('GET the easter egg file by using Poison Null Byte attack with .md suffix', () => {
    return frisby.get('/ftp/eastere.gg%00.md' + URL)
      .expect('status', 200)
      .expect('bodyContains', 'Congratulations, you found the easter egg!')
  })
  it('GET the SIEM signature file by using Poison Null Byte attack with .pdf suffix', () => {
    return frisby.get('/ftp/suspicious_errors.yml%00.pdf' + URL)
      .expect('status', 200)
      .expect('bodyContains', 'Suspicious error messages specific to the application')
  })

  it('GET the SIEM signature file by using Poison Null Byte attack with .md suffix', () => {
    return frisby.get('/ftp/suspicious_errors.yml%00.md' + URL)
      .expect('status', 200)
      .expect('bodyContains', 'Suspicious error messages specific to the application')
  })

  it('GET the 2013 coupon code file by using Poison Null Byte attack with .pdf suffix', () => {
    return frisby.get('/ftp/coupons_2013.md.bak%00.pdf' + URL)
      .expect('status', 200)
      .expect('bodyContains', 'n<MibgC7sn')
  })

  it('GET the 2013 coupon code file by using an Poison Null Byte attack with .md suffix', () => {
    return frisby.get('/ftp/coupons_2013.md.bak%00.md' + URL)
      .expect('status', 200)
      .expect('bodyContains', 'n<MibgC7sn')
  })

  it('GET the package.json.bak file by using Poison Null Byte attack with .pdf suffix', () => {
    return frisby.get('/ftp/package.json.bak%00.pdf' + URL)
      .expect('status', 200)
      .expect('bodyContains', '"name": "juice-shop",')
  })

  it('GET the package.json.bak file by using Poison Null Byte attack with .md suffix', () => {
    return frisby.get('/ftp/package.json.bak%00.md' + URL)
      .expect('status', 200)
      .expect('bodyContains', '"name": "juice-shop",')
  })

  it('GET a restricted file directly from file system path on server by tricking route definitions fails with 403 error', () => {
    return frisby.get('/ftp///eastere.gg' + URL)
      .expect('status', 403)
  })

  it('GET a restricted file directly from file system path on server by appending URL parameter fails with 403 error', () => {
    return frisby.get('/ftp/eastere.gg?.md' + URL)
      .expect('status', 403)
  })

  it('GET a file whose name contains a "/" fails with a 403 error', () => {
    return frisby.fetch('/ftp/%2fetc%2fos-release%2500.md' + URL, {}, { urlEncode: false })
      .expect('status', 403)
      .expect('bodyContains', 'Error: File names cannot contain forward slashes!')
  })

  it('GET an accessible file directly from file system path on server', () => {
    return frisby.get('/ftp/legal.md' + URL)
      .expect('status', 200)
      .expect('bodyContains', '# Legal Information')
  })

  it('GET a non-existing file via direct server file path /ftp will return a 404 error', () => {
    return frisby.get('/ftp/doesnotexist.md' + URL)
      .expect('status', 404)
  })

  it('GET the package.json.bak file contains a dependency on epilogue-js for "Typosquatting" challenge', () => {
    return frisby.get('/ftp/package.json.bak%00.md' + URL)
      .expect('status', 200)
      .expect('bodyContains', '"epilogue-js": "~0.7",')
  })

  it('GET file /ftp/quarantine/juicy_malware_linux_amd_64.url', () => {
    return frisby.get('/ftp/quarantine/juicy_malware_linux_amd_64.url' + URL)
      .expect('status', 200)
  })

  it('GET file /ftp/quarantine/juicy_malware_linux_arm_64.url', () => {
    return frisby.get('/ftp/quarantine/juicy_malware_linux_arm_64.url' + URL)
      .expect('status', 200)
  })

  it('GET existing file /ftp/quarantine/juicy_malware_macos_64.url', () => {
    return frisby.get('/ftp/quarantine/juicy_malware_macos_64.url' + URL)
      .expect('status', 200)
  })

  it('GET existing file /ftp/quarantine/juicy_malware_windows_64.exe.url', () => {
    return frisby.get('/ftp/quarantine/juicy_malware_windows_64.exe.url' + URL)
      .expect('status', 200)
  })
})
