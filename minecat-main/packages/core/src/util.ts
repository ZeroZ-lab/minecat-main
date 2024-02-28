import fs, { readdirSync } from "node:fs";
import { homedir } from "node:os";
import shell from "shelljs";
import { defaultCfg } from "./postinstall";

// 获取某个目录下面的所有文件夹
export const getDirectories = (source) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

export function extractGitHubRepoInfo(url: string) {
  if (!url) return null;
  const match = url.match(
    /^https?:\/\/(www\.)?github.com\/(?<owner>[\w.-]+)\/(?<name>[\w.-]+)/
  );
  if (!match || !(match.groups?.owner && match.groups?.name)) return null;
  return { owner: match.groups.owner, name: match.groups.name };
}

export function getSafeHome(): string {
  const home = homedir + `/.minecat`;
  if (!shell.test("-d", home)) {
    shell.mkdir("-p", home);
  }

  return home;
}

export function getConfigFile(): string {
  return getSafeHome() + `/config.json`;
}

export function getConfig() {
  const configFile = getConfigFile();
  // console.dir(configFile);
  try {
    return JSON.parse(fs.readFileSync(configFile).toString());
  } catch (error) {
    if (error.errno === -2) {
      // if config.json is not exist， write default config to it.
      writeConfig(defaultCfg);
      return defaultCfg;
    } else {
      throw error;
    }
  }
}

export async function writeConfig(cfg) {
  const configFile = getConfigFile();

  try {
    fs.writeFileSync(configFile, JSON.stringify(cfg, null, 4));
  } catch (error) {
    console.dir(error);
  }
}
