import assert from 'node:assert/strict';
import {verifySoundCode} from '../dist/sound-access.mjs';
assert.equal(await verifySoundCode('2884'),true);
for(const value of ['','2885',' 2884','2884 ','02884','abcd',2884])assert.equal(await verifySoundCode(value),false);
console.log('Passed: exact sound code and malformed input.');
