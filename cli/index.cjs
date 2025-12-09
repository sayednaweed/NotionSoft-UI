#!/usr/bin/env node

const { program } = require("commander");
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { execSync } = require("child_process");

/* ------------------------------
   Helper: get template path
------------------------------- */
function getTemplateFile(component) {
  // Library template: src/notion-ui/button/button.tsx
  return path.join(
    __dirname,
    "../src/notion-ui",
    component,
    component + ".tsx"
  );
}

/* ------------------------------
   Install dependencies in project
------------------------------- */
function installDependencies() {
  try {
    console.log(chalk.cyan("Installing dependencies: clsx, tailwind-merge..."));
    execSync("npm install clsx tailwind-merge", { stdio: "inherit" });
    console.log(chalk.green("✓ Dependencies installed"));
  } catch (err) {
    console.log(chalk.red("❌ Failed to install dependencies"));
    console.error(err);
  }
}

/* ------------------------------
   Update tsconfig.json for absolute imports
------------------------------- */
function updateTsConfig() {
  const tsconfigPath = path.join(process.cwd(), "tsconfig.json");

  if (!fs.existsSync(tsconfigPath)) {
    console.log(
      chalk.yellow("⚠ tsconfig.json not found, skipping baseUrl setup.")
    );
    return;
  }

  const tsconfig = fs.readJsonSync(tsconfigPath);
  tsconfig.compilerOptions = tsconfig.compilerOptions || {};
  tsconfig.compilerOptions.baseUrl = "src";
  tsconfig.compilerOptions.paths = tsconfig.compilerOptions.paths || {};
  tsconfig.compilerOptions.paths["@utils/*"] = ["utils/*"];
  tsconfig.compilerOptions.paths["@components/*"] = ["components/*"];

  fs.writeJsonSync(tsconfigPath, tsconfig, { spaces: 2 });
  console.log(
    chalk.green(
      "✓ tsconfig.json updated for absolute imports (@utils/*, @components/*)"
    )
  );
}

/* ------------------------------
   Command: init
------------------------------- */
program
  .command("init")
  .description("Initialize NotionSoft-UI in your project")
  .action(() => {
    const cwd = process.cwd();
    const configPath = path.join(cwd, ".notionsoft-ui.json");

    if (fs.existsSync(configPath)) {
      console.log(chalk.yellow("⚠ NotionSoft-UI already initialized."));
      return;
    }

    // Create config
    fs.writeFileSync(
      configPath,
      JSON.stringify({ componentDir: "src/components/notion-ui" }, null, 2)
    );

    // Ensure component folder
    const componentDir = path.join(cwd, "src/components/notion-ui");
    fs.ensureDirSync(componentDir);

    // Create utils folder and cn helper
    const utilsDir = path.join(cwd, "src/utils");
    fs.ensureDirSync(utilsDir);
    const cnPath = path.join(utilsDir, "cn.ts");

    if (!fs.existsSync(cnPath)) {
      fs.writeFileSync(
        cnPath,
        `import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(...inputs));
}`
      );
      console.log(chalk.green("✓ cn helper created at src/utils/cn.ts"));
    }

    // Install dependencies
    installDependencies();

    // Update tsconfig.json for absolute imports
    updateTsConfig();

    console.log(chalk.green("✓ NotionSoft-UI initialized and ready!"));
  });

/* ------------------------------
   Command: add <component>
------------------------------- */
program
  .command("add <component>")
  .description("Install a NotionSoft-UI component")
  .action((component) => {
    const cwd = process.cwd();
    const configFile = path.join(cwd, ".notionsoft-ui.json");

    if (!fs.existsSync(configFile)) {
      console.log(chalk.red("❌ Run `npx notionsoft-ui init` first."));
      return;
    }

    const config = fs.readJSONSync(configFile);
    const templateDir = path.join(__dirname, "../src/notion-ui", component);

    if (!fs.existsSync(templateDir)) {
      console.log(chalk.red(`❌ Component '${component}' does not exist.`));
      return;
    }

    // Utility function to append content if not exists
    const appendIfNotExist = (srcFile, destFile) => {
      const srcContent = fs.readFileSync(srcFile, "utf-8");

      if (fs.existsSync(destFile)) {
        const destContent = fs.readFileSync(destFile, "utf-8");
        const newLines = srcContent
          .split("\n")
          .filter((line) => !destContent.includes(line))
          .join("\n");
        if (newLines.trim()) fs.appendFileSync(destFile, "\n" + newLines);
      } else {
        fs.writeFileSync(destFile, srcContent);
      }
    };

    // Handle type.ts → src/utils/type.ts
    const typeFile = path.join(templateDir, "type.ts");
    if (fs.existsSync(typeFile)) {
      const destTypeFile = path.join(cwd, "src/utils/type.ts");
      appendIfNotExist(typeFile, destTypeFile);
      console.log(chalk.green("✓ type.ts merged to src/utils/type.ts"));
    }

    // Handle *-data.ts → src/utils/dt.ts
    fs.readdirSync(templateDir)
      .filter((f) => f.endsWith("-data.ts"))
      .forEach((dataFile) => {
        const srcDataFile = path.join(templateDir, dataFile);
        const destDataFile = path.join(cwd, "src/utils/dt.ts");
        appendIfNotExist(srcDataFile, destDataFile);
        console.log(chalk.green(`✓ ${dataFile} merged to src/utils/dt.ts`));
      });

    // Handle use-*.ts → src/utils/hook.ts
    fs.readdirSync(templateDir)
      .filter((f) => f.startsWith("use-") && f.endsWith(".ts"))
      .forEach((hookFile) => {
        const srcHookFile = path.join(templateDir, hookFile);
        const destHookFile = path.join(cwd, "src/utils/hook.ts");
        appendIfNotExist(srcHookFile, destHookFile);
        console.log(chalk.green(`✓ ${hookFile} merged to src/utils/hook.ts`));
      });

    // Handle utils.ts → src/utils/helper.ts
    const utilsFile = path.join(templateDir, "utils.ts");
    if (fs.existsSync(utilsFile)) {
      const destUtilsFile = path.join(cwd, "src/utils/helper.ts");
      appendIfNotExist(utilsFile, destUtilsFile);
      console.log(chalk.green("✓ utils.ts merged to src/utils/helper.ts"));
    }

    // Copy remaining files (exclude index.ts, *.stories.tsx, type.ts, *-data.ts, use-*.ts, utils.ts)
    fs.readdirSync(templateDir).forEach((file) => {
      if (
        file === "index.ts" ||
        file === "type.ts" ||
        file.endsWith("-data.ts") ||
        file.endsWith(".stories.tsx") ||
        (file.startsWith("use-") && file.endsWith(".ts")) ||
        file === "utils.ts"
      )
        return;

      const srcFile = path.join(templateDir, file);
      const destFile = path.join(config.componentDir, file); // flat copy
      fs.ensureDirSync(config.componentDir);
      fs.copyFileSync(srcFile, destFile);
    });

    console.log(
      chalk.green(`✓ Installed ${component} to ${config.componentDir}`)
    );
  });

/* ------------------------------
   Command: list
------------------------------- */
program
  .command("list")
  .description("List available components")
  .action(() => {
    const templatesDir = path.join(__dirname, "../src/notion-ui");
    const components = fs.readdirSync(templatesDir).filter((folder) => {
      const file = path.join(templatesDir, folder, folder + ".tsx");
      return fs.existsSync(file);
    });
    console.log(chalk.cyan("Available components:"));
    components.forEach((c) => console.log(" • " + c));
  });

program.parse();
