#!/usr/bin/env node
/**
 * Skills Sync CLI
 *
 * Sync AI skills to Cursor, Claude, Codex and more
 */
import { fetch } from "./commands/fetch.js";
import { sync } from "./commands/sync.js";
import { status } from "./commands/status.js";
import { list } from "./commands/list.js";
import { sourceCommand } from "./commands/source.js";
import { targetCommand } from "./commands/target.js";
import { init } from "./commands/init.js";
import { showConfig } from "./commands/config.js";
import { bold, dim, red } from "./lib/colors.js";

const VERSION = "1.0.0";

function printHelp(): void {
  console.log(`
${bold("skillsync")} - Sync AI skills to various tools

${bold("Usage:")}
  skills <command> [options]

${bold("Commands:")}
  init               Initialize config (~/.skillsync/)
  fetch [source]     Fetch skills from Git
  sync               Sync to all enabled targets
  status             View sync status
  ls, list           List all skills
  config             Show configuration

  source             Manage skill sources
    add <name>       Add source (e.g., owner/repo)
    remove <name>    Remove source
    on <name>        Enable source
    off <name>       Disable source
    list             List sources

  target             Manage sync targets
    add <name>       Add target (e.g., cursor, claude)
    remove <name>    Remove target
    on <name>        Enable target
    off <name>       Disable target
    list             List targets

${bold("Examples:")}
  skills init
  skills source add anthropics/skills
  skills target add cursor
  skills fetch
  skills sync
  skills status

${bold("Version:")} ${VERSION}
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case "init":
        await init();
        break;
      case "fetch":
        await fetch(args[1]);
        break;
      case "sync":
        await sync();
        break;
      case "status":
        await status();
        break;
      case "ls":
      case "list":
        await list();
        break;
      case "config":
        await showConfig();
        break;
      case "source":
        await sourceCommand(args.slice(1));
        break;
      case "target":
        await targetCommand(args.slice(1));
        break;
      case "help":
      case "--help":
      case "-h":
        printHelp();
        break;
      case "version":
      case "--version":
      case "-v":
        console.log(VERSION);
        break;
      default:
        if (command) {
          console.log(red(`Unknown command: ${command}\n`));
        }
        printHelp();
        process.exit(command ? 1 : 0);
    }
  } catch (error) {
    console.error(red(`Error: ${error instanceof Error ? error.message : error}`));
    process.exit(1);
  }
}

main();
