#!/bin/bash
cd /Users/Residentialist/.openclaw/workspace/residentialist
node -e "
require('dotenv').config();
const {runWithAutoCorrection} = require('./auto_runner');
runWithAutoCorrection('Sierra Pacific', 'CSM', 'windows')
  .then(r => {
    require('fs').writeFileSync('/tmp/sierra_pacific_result.json', JSON.stringify(r, null, 2));
    console.log('DONE');
  })
  .catch(e => {
    require('fs').writeFileSync('/tmp/sierra_pacific_result.json', JSON.stringify({error: e.message}));
    console.error(e);
  });
" >> /tmp/sierra_pacific_run.log 2>&1
