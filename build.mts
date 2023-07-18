import Client, { connect } from "@dagger.io/dagger";

connect(async (client: Client) => {
    const source = client
      .host()
      .directory(".", { exclude: ["node_modules/"] });

    const node = client.container()
      .from("node:16");

    const runner = node
      .withDirectory("/src", source)
      .withWorkdir("/src")
      .withExec(["npm", "install"]);

    await runner
      .pipeline("Run unit tests")
      .withExec(["npm", "test"])
      .exitCode();

    await runner
      .pipeline("Run E2E tests")
      .withExec(["npm", "run", "test:e2e"])
      .exitCode();

    await runner
      .pipeline("Package application")
      .withExec(["npm", "run", "build"])
      .exitCode();
  },
  {
    LogOutput: process.stdout
  }
);
