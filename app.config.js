// Dynamic Expo config — extends the static values in app.json.
//
// The web build for GitHub Pages is served from a repository subpath
// (https://jpopesculian.github.io/weather/), so its assets must be prefixed with
// that base URL. We only apply it when DEPLOY_TARGET=gh-pages (set by the deploy
// workflow), leaving local `expo start`/export and native builds rooted at "/".
module.exports = ({ config }) => {
  if (process.env.DEPLOY_TARGET === 'gh-pages') {
    config.experiments = { ...config.experiments, baseUrl: '/weather' };
  }
  return config;
};
