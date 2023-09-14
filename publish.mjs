import { connect } from "@dagger.io/dagger";

const DIST_FOLDER = "./dist";
const APP_FOLDER = "app";
const NODE_MODULES = "node_modules";

connect(async (client) => {
    const source = client
      .host()
      .directory(".", { exclude: [`${NODE_MODULES}/`] });

    const node = client.container()
      .from("node:20-alpine");

    const runner = node
      .withDirectory("/src", source)
      .withWorkdir("/src")
      .withExec(["npm", "install"]);

    const buildStage = await runner
      .pipeline("Package application")
      .withExec(["npm", "run", "build"]);

    const imageRef = await client.container()
      .pipeline("Publish application")
      .from("node:20-alpine")
      .withWorkdir("/opt/app")
      .withDirectory(NODE_MODULES, buildStage.directory(NODE_MODULES))
      .withDirectory(APP_FOLDER, buildStage.directory(DIST_FOLDER))
      .withExposedPort(3000)
      .withEntrypoint(["node" , "app/main"])
      .publish("ttl.sh/nestjs-with-dagger-" + Math.floor(Math.random() * 10000000));

    console.log(`Published image to: ${imageRef}`);
  },
  {
    LogOutput: process.stdout
  }
);
