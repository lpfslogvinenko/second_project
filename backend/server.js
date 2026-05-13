const app = require("./app");
const User = require("./models/User");

const port = Number(process.env.PORT) || 4000;

async function main() {
  await User.ensureSchema();
  app.listen(port, () => {
    console.log(`API listening on :${port}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
