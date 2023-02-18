import * as fs from 'fs';
import * as path from 'path';

let configJson: any = {};
try {
  configJson = JSON.parse(
    fs
      .readFileSync(path.join(__dirname, '../', 'config.json'))
      .toString('utf8'),
  );
} catch (error) {
  console.warn("Can't find config.json, use default config.", error);
}

const dataPath = configJson.dataPath || '/usr/share/com.zjffun.dochub';
const mongodbUri =
  configJson.mongodbUri ||
  'mongodb://127.0.0.1:27017/relation?directConnection=true';
const secret =
  configJson.secret ||
  'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.';
const githubClientID = configJson.githubClientID;
const githubClientSecret = configJson.githubClientSecret;
const githubCallbackURL = configJson.githubCallbackURL;

export {
  dataPath,
  mongodbUri,
  secret,
  githubClientID,
  githubClientSecret,
  githubCallbackURL,
};
