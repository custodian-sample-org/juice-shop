/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs = require('fs')
import { Request, Response, NextFunction } from 'express'
import { UserModel } from '../models/user'

const utils = require('../lib/utils')
const security = require('../lib/insecurity')
const logger = require('../lib/logger')
const fileType = require('file-type')

module.exports = function fileUpload () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file
    const buffer = file?.buffer
    const uploadedFileType = await fileType.fromBuffer(buffer)

    if (uploadedFileType === undefined) {
      res.status(500)
      next(new Error('Illegal file type'))
    } else {
      if (uploadedFileType !== null && utils.startsWith(uploadedFileType.mime, 'image')) {
        const loggedInUser = security.authenticatedUsers.get(req.cookies.token)
        if (loggedInUser) {
          fs.open(`frontend/dist/frontend/assets/public/images/uploads/${loggedInUser.data.id}.${uploadedFileType.ext}`, 'w', function (err, fd) {
            if (err != null) logger.warn(err.message + 'Error opening file: ')
            // @ts-expect-error
            fs.write(fd, buffer, 0, buffer.length, null, function (err) {
              if (err != null) logger.warn(err.message + 'Error writing file: ')
              fs.close(fd, function () { })
            })
          })
          UserModel.findByPk(loggedInUser.data.id).then(async (user: UserModel | null) => {
            if (user) {
              return await user.update({ profileImage: `assets/public/images/uploads/${loggedInUser.data.id}.${uploadedFileType.ext}` })
            }
          }).catch((error: Error) => {
            next(error)
          })
          res.location('/profile' + process.env.BASE_PATH)
          res.redirect('/profile' + process.env.BASE_PATH)
        } else {
          next(new Error(req.connection.remoteAddress + 'Blocked illegal activity by '))
        }
      } else {
        res.status(415)
        next(new Error(`Profile image upload does not accept this file type${uploadedFileType ? (uploadedFileType.mime + ': ') : '.'}`))
      }
    }
  }
}
