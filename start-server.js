const { exec } = require('child_process');

const PORT = process.env.PORT

const command = `npx json-server --host 0.0.0.0 --watch db.json --port ${PORT} --middlewares ./node_modules/json-server-auth`;

console.log(`Starting server on port ${PORT}...`);

const child = exec(command, (err, stdout, stderr) => {
  if (err) {
    console.error(`Error: ${err.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Output: ${stdout}`);
});
