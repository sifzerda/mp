const fs = require("node:fs");
const path = require("node:path");

const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const ROOT = path.resolve(
  __dirname,
  "../node_modules/react-native-draggable-flatlist"
);

const HOOKS = new Map([
  ["useAnimatedReaction", 2],
  ["useDerivedValue", 1],
  ["useAnimatedStyle", 1],
  ["useAnimatedScrollHandler", 1],
]);

let changedFiles = 0;
let removedDependencies = 0;

function getHookName(node) {
  if (!node) return null;

  if (node.type === "Identifier") {
    return node.name;
  }

  if (node.type === "MemberExpression") {
    return node.property.name || node.property.value;
  }

  if (node.type === "SequenceExpression") {
    return getHookName(node.expressions.at(-1));
  }

  return null;
}

function processFile(file) {
  const source = fs.readFileSync(file, "utf8");

  const ast = parser.parse(source, {
    sourceType: "unambiguous",
    plugins: ["typescript", "jsx"],
  });

  const edits = [];

  traverse(ast, {
    CallExpression({ node }) {
      const name = getHookName(node.callee);

      if (!HOOKS.has(name)) return;

      const index = HOOKS.get(name);
      const dependency = node.arguments[index];

      if (
        node.arguments.length !== index + 1 ||
        dependency?.type !== "ArrayExpression"
      ) {
        return;
      }

      edits.push({
        start: node.arguments[index - 1].end,
        end: dependency.end,
      });
    },
  });

  if (!edits.length) return;

  let result = source;

  edits.sort((a, b) => b.start - a.start);

  for (const edit of edits) {
    result =
      result.slice(0, edit.start) +
      result.slice(edit.end);
  }

  // Validate syntax before saving.
  parser.parse(result, {
    sourceType: "unambiguous",
    plugins: ["typescript", "jsx"],
  });

  fs.writeFileSync(file, result, "utf8");

  changedFiles++;
  removedDependencies += edits.length;

  console.log(
    `Fixed ${path.relative(ROOT, file)} (${edits.length})`
  );
}

function walk(directory) {
  if (!fs.existsSync(directory)) return;

  for (const entry of fs.readdirSync(directory, {
    withFileTypes: true,
  })) {
    const file = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walk(file);
      continue;
    }

    if (
      /\.(js|jsx|ts|tsx)$/.test(file) &&
      !file.endsWith(".d.ts")
    ) {
      processFile(file);
    }
  }
}

walk(path.join(ROOT, "src"));
walk(path.join(ROOT, "lib/commonjs"));
walk(path.join(ROOT, "lib/module"));

console.log("\nCompatibility fix complete.");
console.log(`Files updated: ${changedFiles}`);
console.log(`Dependency arrays removed: ${removedDependencies}`);