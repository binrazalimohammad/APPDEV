/**
 * Server entry point
 */
const app = require('./app');
const config = require('./config');

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Endpoints: GET /, POST /login, POST /refresh, POST /google, GET /users, POST /users');
});
