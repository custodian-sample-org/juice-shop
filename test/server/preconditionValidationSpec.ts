/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
const net = require('net')
chai.use(sinonChai)

const semver = require('semver')
const { checkIfRunningOnSupportedNodeVersion, checkIfPortIsAvailable } = require('../../lib/startup/validatePreconditions')

describe('preconditionValidation', () => {
  describe('checkIfRunningOnSupportedNodeVersion', () => {
    const supportedVersion = require('./../../package.json').engines.node

    it('should define the supported semver range as 14 - 18', () => {
      expect(supportedVersion).toBe('14 - 18')
      expect(semver.validRange(supportedVersion)).to.not.toBe(null)
    })

    it('should accept a supported version', () => {
      expect(checkIfRunningOnSupportedNodeVersion('18.1.0')).toBe(true)
      expect(checkIfRunningOnSupportedNodeVersion('17.3.0')).toBe(true)
      expect(checkIfRunningOnSupportedNodeVersion('16.10.0')).toBe(true)
      expect(checkIfRunningOnSupportedNodeVersion('15.9.0')).toBe(true)
      expect(checkIfRunningOnSupportedNodeVersion('14.0.0')).toBe(true)
    })

    it('should fail for an unsupported version', () => {
      expect(checkIfRunningOnSupportedNodeVersion('19.0.0')).toBe(false)
      expect(checkIfRunningOnSupportedNodeVersion('13.13.0')).toBe(false)
      expect(checkIfRunningOnSupportedNodeVersion('12.16.2')).toBe(false)
      expect(checkIfRunningOnSupportedNodeVersion('11.14.0')).toBe(false)
      expect(checkIfRunningOnSupportedNodeVersion('10.20.0')).toBe(false)
      expect(checkIfRunningOnSupportedNodeVersion('9.11.2')).toBe(false)
      expect(checkIfRunningOnSupportedNodeVersion('8.12.0')).toBe(false)
      expect(checkIfRunningOnSupportedNodeVersion('7.10.1')).toBe(false)
      expect(checkIfRunningOnSupportedNodeVersion('6.14.4')).toBe(false)
      expect(checkIfRunningOnSupportedNodeVersion('4.9.1')).toBe(false)
      expect(checkIfRunningOnSupportedNodeVersion('0.12.8')).toBe(false)
    })
  })

  describe('checkIfPortIsAvailable', () => {
    it('should resolve when port 3000 is closed', async () => {
      const success = await checkIfPortIsAvailable(3000)
      expect(success).toBe(true)
    })

    describe('open a server before running the test', () => {
      const testServer = net.createServer()
      before((done) => {
        testServer.listen(3000, done)
      })

      it('should reject when port 3000 is open', async () => {
        const success = await checkIfPortIsAvailable(3000)
        expect(success).toBe(false)
      })

      after((done) => {
        testServer.close(done)
      })
    })
  })
})
