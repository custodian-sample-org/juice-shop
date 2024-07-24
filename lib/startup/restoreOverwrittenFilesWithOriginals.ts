/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import path = require('path')
import utils = require('../utils')
const fs = require('fs')
const logger = require('../logger')
const { promisify } = require('util')
const glob = promisify(require('glob'))
const copyFile = promisify(fs.copyFile)
const access = promisify(fs.access)

const exists = (path: string) => access(path).then(() => true).catch(() => false)

const restoreOverwrittenFilesWithOriginals = async () => {
  await copyFile(path.resolve('data/static/legal.md'), path.resolve('ftp/legal.md'))

  if (await exists(path.resolve('frontend/dist'))) {
    await copyFile(
      path.resolve('data/static/owasp_promo.vtt'),
      path.resolve('frontend/dist/frontend/assets/public/videos/owasp_promo.vtt')
    )
  }

  try {
    const files = await glob(path.resolve('data/static/i18n/*.json'))
    await Promise.all(
      files.map((filename: string) => copyFile(filename, path.resolve('i18n/', filename.substring(1 + filename.lastIndexOf('/')))))
    )
  } catch (err) {
    logger.warn(utils.getErrorMessage(err) + 'Error listing JSON files in /data/static/i18n folder: ')
  }
}

module.exports = restoreOverwrittenFilesWithOriginals
