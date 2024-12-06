const { exec } = require('child_process');

const getStreamUrl = (query) => {
  return new Promise((resolve, reject) => {
    exec(`yt-dlp -f bestaudio --get-url "ytsearch1:${query}"`, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      resolve(stdout.trim());
    });
  });
};

module.exports = { getStreamUrl };
