const parser = require("@babel/parser");
const traverse = require("@babel/traverse");
const _ = require("lodash");
const fs = require("node:fs");
const fsPromise = require("node:fs/promises");
const path = require("path");

const writeToFile = (fileName, all) => {
  return new Promise((res, rej) => {
    fs.writeFile(
      path.resolve(".storybook", fileName),
      JSON.stringify(all, null, 2),
      (e1, d1) => {
        if (e1) {
          rej(e1);
        } else {
          res(d1);
        }
      }
    );
  });
};

const getAllFiles = (dirPath, arrayOfFiles = []) => {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach((file) => {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith(".tsx") || file.endsWith(".jsx")) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
};

const getASTforFileName = async (code) => {
  return parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });
};

const readFile = async () => {
  const files = getAllFiles(path.resolve("src"));

  return Promise.allSettled(
    files.map(async (fileName) => {
      const code = await fsPromise.readFile(fileName, {
        encoding: "utf8",
      });
      const ast = await getASTforFileName(code);

      let jsxElements = [];

      traverse.default(ast, {
        enter(path) {
          path.type;
          if (path.type === "JSXOpeningElement") {
            if (path.node.name.type === "JSXMemberExpression") {
              jsxElements.push({
                element: `${path.node.name.object.name}.${path.node.name.property.name}`,
              });
            } else {
              jsxElements.push({
                element: path.node.name.name || "unknown",
              });
            }
          }
        },
      });
      console.log(jsxElements);
      return { file: fileName, elements: jsxElements };
    })
  )
    .then((all) => {
      return all.map((item) => item.value);
    })
    .catch((why) => {
      console.log({ why });
    });
};

const countElementUsage = (data) => {
  const dataMap = {};
  data.forEach((file) =>
    file.elements.forEach((element) => {
      dataMap[element.element] = dataMap[element.element]
        ? {
            count: dataMap[element.element].count + 1,
          }
        : {
            count: 1,
          };
    })
  );
  const result = Object.keys(dataMap)
    .map((key) => {
      return {
        element: key,
        count: dataMap[key].count,
      };
    })
    .sort((a, b) => ((_.get(a) || 0) > (_.get(b) || 0) ? -1 : 1));
  return result;
};

const count = (json) => {
  return writeToFile("counts.json", countElementUsage(json));
};

readFile()
  .then((result) => {
    count(result);
  })
  .catch((e) => {
    console.log(e);
  })
  .finally(() => {
    console.log("Done Preparing Statistics for Storybook");
  });
