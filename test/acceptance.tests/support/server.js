const { features, log } = require('./settings');

let server = null;

const startServer = () => {
  if (features.enableServer) {
    // [i] https://nodejs.org/api/child_process.html#child_process_event_message
    server = require('child_process').spawn('node', ['src/adapters/web/server.js']);

    server.stdout.on('data', (data) => {
      log(`stdout: ${data}`);
    });
  }
}

const stopServer = () => {
  if (server) {
    log('Stopping server...');
    server.kill();
  }
}

before( () => startServer())
after(  () => stopServer())