import { NODE_MODULES, NPM, PACKAGE_JSON, PACKAGE_LOCK_JSON } from "./constants.mjs";

export const npmInstall = async (client) => {
  const source = client.host()
    .directory(".", { exclude: [`${NODE_MODULES}/`] });

  const dependencies = await client.container()
    .from("node:20-alpine")
    .pipeline("Install dependencies")
    .withWorkdir("/app")
    .withFile(PACKAGE_JSON, source.file(PACKAGE_JSON))
    .withFile(PACKAGE_LOCK_JSON, source.file(PACKAGE_LOCK_JSON))
    .withExec([NPM, "install"])
    .sync();

  return {source, dependencies};
}