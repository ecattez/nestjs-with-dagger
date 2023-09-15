import { connect } from "@dagger.io/dagger";
import { npmInstall } from "./install.mjs";
import { NODE_MODULES, NPM } from "./constants.mjs";

const WORKDIR = "/opt/app";
const DIST_FOLDER = "dist";

connect(async (client) => {
    const { source, dependencies } = await npmInstall(client);

    const buildStage = dependencies
      .withDirectory(".", source)
      .pipeline("Package application")
      .withExec([NPM, "run", "build"]);

    const imageRef = await client.container()
      .pipeline("Publish application")
      .from("node:20-alpine")
      .withWorkdir(WORKDIR)
      .withDirectory(NODE_MODULES, buildStage.directory(NODE_MODULES))
      .withDirectory(DIST_FOLDER, buildStage.directory(DIST_FOLDER))
      .withExposedPort(3000)
      .withEntrypoint(["node" , `${DIST_FOLDER}/main`])
      .publish("ttl.sh/nestjs-with-dagger-" + Math.floor(Math.random() * 10000000));

    console.log(`Published image to: ${imageRef}`);
  },
  {
    LogOutput: process.stdout
  }
);
