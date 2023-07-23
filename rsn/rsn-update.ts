import { readFiles, checkDiffs, writeToFile } from './rsnUtil'
const colors = require('colors/safe')

const keys = readFiles()
checkDiffs(keys)
  .then((data) => {
    writeToFile(data);
  })
  .catch((err) => {
    process.exitCode = 1;
  });
