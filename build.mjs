import { connect } from "@dagger.io/dagger";

connect(async (client) => {
    const source = client
      .host()
      .directory(".", { exclude: ["node_modules/"] });

    const node = client.container()
      .from("node:20");

    const runner = node
      .withDirectory("/src", source)
      .withWorkdir("/src")
      .withExec(["npm", "install"]);

    await runner
      .pipeline("Run unit tests")
      .withExec(["npm", "test"])
      .sync();

    await runner
      .pipeline("Run E2E tests")
      .withExec(["npm", "run", "test:e2e"])
      .sync();

    await runner
      .pipeline("Package application")
      .withExec(["npm", "run", "build"])
      .sync();

  },
  {
    LogOutput: process.stdout
  }
);
