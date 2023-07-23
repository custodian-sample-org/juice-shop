import { readFiles, checkDiffs, getDataFromFile, checkData, seePatch } from './rsnUtil'
const colors = require('colors/safe')

const keys = readFiles()
checkDiffs(keys)
  .then(data => {
    const fileData = getDataFromFile();
    const filesWithDiff = checkData(data, fileData);
    if (filesWithDiff.length === 0) {
    } else {
      filesWithDiff.forEach(async (file) => await seePatch(file));
      process.exitCode = 1;
    }
  })
  .catch(err => {
    
    process.exitCode = 1;
  })
