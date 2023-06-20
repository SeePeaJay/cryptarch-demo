// The following crypto code (and installing eslint v7.32) are needed as of this writing due to using Node.js v18; otherwise run into issues when `npm run dev`: https://stackoverflow.com/a/72219174
const crypto = require('crypto');

/**
 * The MD4 algorithm is not available anymore in Node.js 17+ (because of library SSL 3).
 * In that case, silently replace MD4 by the MD5 algorithm.
 */
try {
  crypto.createHash('md4');
} catch (e) {
  console.warn('Crypto "MD4" is not supported anymore by this Node.js version');
  const origCreateHash = crypto.createHash;
  crypto.createHash = (alg, opts) => {
    return origCreateHash(alg === 'md4' ? 'md5' : alg, opts);
  };
}

module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/cryptarch-demo/'
    : '/'
};
