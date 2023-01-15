import * as fs from 'fs';
import * as path from 'path';

let configJson: any = {};
try {
  configJson = JSON.stringify(
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

export { dataPath, mongodbUri };
