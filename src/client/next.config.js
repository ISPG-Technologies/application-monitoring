module.exports = {
  distDir: '../../.next',
  headers: [
    {
      key: 'X-XSS-Protection',
      value: '1; mode=block',
    },
  ],
};
