/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai = require('chai')
const expect = chai.expect

describe('utils', () => {
  const utils = require('../../lib/utils')

  describe('toSimpleIpAddress', () => {
    it('returns ipv6 address unchanged', () => {
      expect(utils.toSimpleIpAddress('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe('2001:0db8:85a3:0000:0000:8a2e:0370:7334')
    })

    it('returns ipv4 address fully specified as ipv6 unchanged', () => {
      expect(utils.toSimpleIpAddress('0:0:0:0:0:ffff:7f00:1')).toBe('0:0:0:0:0:ffff:7f00:1')
    })

    it('returns ipv6 loopback address as ipv4 address', () => {
      expect(utils.toSimpleIpAddress('::1')).toBe('127.0.0.1')
    })

    it('returns ipv4-mapped address as ipv4 address', () => {
      expect(utils.toSimpleIpAddress('::ffff:192.0.2.128')).toBe('192.0.2.128')
    })
  })

  describe('extractFilename', () => {
    it('returns standalone filename unchanged', () => {
      expect(utils.extractFilename('test.exe')).toBe('test.exe')
    })

    it('returns filename from http:// URL', () => {
      expect(utils.extractFilename('http://bla.blubb/test.exe')).toBe('test.exe')
    })

    it('ignores query part of http:// URL', () => {
      expect(utils.extractFilename('http://bla.blubb/test.exe?bla=blubb&a=b')).toBe('test.exe')
    })

    it('also works for file:// URLs', () => {
      expect(utils.extractFilename('file:///C//Bla/Blubb/test.exe')).toBe('test.exe')
    })
  })
})
