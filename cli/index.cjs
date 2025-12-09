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
    const templateFile = getTemplateFile(component);

    if (!fs.existsSync(templateFile)) {
      console.log(chalk.red(`❌ Component '${component}' does not exist.`));
      return;
    }

    // Copy as a flat file into user's project
    // const destFile = path.join(config.componentDir, component + ".tsx");
    // fs.ensureDirSync(config.componentDir);
    // fs.copyFileSync(templateFile, destFile);

    // console.log(
    //   chalk.green(`✓ Installed ${component} component as ${destFile}`)
    // );
    const utilsDir = path.join(cwd, "src/utils");
    fs.ensureDirSync(utilsDir);

    let mergeSuccess = true;

    // --- Step 1: Merge utils ---
    fs.readdirSync(templateDir).forEach((file) => {
      const filePath = path.join(templateDir, file);
      const content = fs.readFileSync(filePath, "utf-8").trim();

      let targetPath;
      if (file.endsWith("-data.ts")) targetPath = path.join(utilsDir, "dt.ts");
      else if (file === "type.ts") targetPath = path.join(utilsDir, "type.ts");
      else if (file.startsWith("use-") && file.endsWith(".ts"))
        targetPath = path.join(utilsDir, "hook.ts");
      else return; // skip other files

      try {
        let targetContent = "";
        if (fs.existsSync(targetPath))
          targetContent = fs.readFileSync(targetPath, "utf-8");

        if (!targetContent.includes(content)) {
          if (targetContent.length > 0) targetContent += "\n\n";
          targetContent += content;
          fs.writeFileSync(targetPath, targetContent);
          console.log(
            chalk.green(`✓ Merged ${file} → ${path.relative(cwd, targetPath)}`)
          );
        } else {
          console.log(
            chalk.yellow(
              `⚠ ${file} already exists in ${path.relative(
                cwd,
                targetPath
              )}, skipping`
            )
          );
        }
      } catch (err) {
        mergeSuccess = false;
        console.log(chalk.red(`❌ Failed merging ${file}: ${err.message}`));
      }
    });

    if (!mergeSuccess) {
      console.log(
        chalk.red(
          "❌ Failed to merge required files. Component installation aborted."
        )
      );
      return;
    }

    // --- Step 2: Copy remaining files flat into componentDir ---
    fs.ensureDirSync(config.componentDir);
    fs.readdirSync(templateDir).forEach((file) => {
      if (
        file === "index.ts" ||
        file === "type.ts" ||
        file.endsWith("-data.ts") ||
        file.endsWith(".stories.tsx") ||
        (file.startsWith("use-") && file.endsWith(".ts"))
      )
        return;

      const srcFile = path.join(templateDir, file);
      const destFile = path.join(config.componentDir, file); // flat copy
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
