import { connect } from "@dagger.io/dagger";
import { npmInstall } from "./install.mjs";
import { NPM } from "./constants.mjs";

connect(async (client) => {
    const { source, dependencies } = await npmInstall(client);

    const runner = dependencies
      .withDirectory(".", source);

    await runner
      .pipeline("Run unit tests")
      .withExec([NPM, "test"])
      .sync();

    await runner
      .pipeline("Run E2E tests")
      .withExec([NPM, "run", "test:e2e"])
      .sync();
  },
  {
    LogOutput: process.stdout
  }
);
