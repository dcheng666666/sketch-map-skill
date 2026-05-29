#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderRoute, RouteInputSchema } from "sketch-map-sdk";

interface CliArgs {
  input?: string;
  output?: string;
  help: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--input" || a === "-i") args.input = argv[++i];
    else if (a === "--output" || a === "-o") args.output = argv[++i];
    else if (a.startsWith("--input=")) args.input = a.slice("--input=".length);
    else if (a.startsWith("--output=")) args.output = a.slice("--output=".length);
    else throw new Error(`Unknown argument: ${a}`);
  }
  return args;
}

function printHelp(): void {
  process.stderr.write(
    `render-sketch-map — generate a watercolor sketch-map PNG\n\n` +
      `Usage:\n` +
      `  render-sketch-map --input <route.json> --output <map.png>\n` +
      `  cat <route.json> | render-sketch-map --output <map.png>\n`,
  );
}

async function readInput(inputPath: string | undefined): Promise<string> {
  if (inputPath) return readFile(inputPath, "utf8");
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }
  if (!args.output) {
    process.stderr.write("Error: --output is required.\n");
    process.exit(2);
  }

  const rawText = await readInput(args.input);
  const input = RouteInputSchema.parse(JSON.parse(rawText));
  const result = await renderRoute(input, { kind: "png" });

  if (result.status === "error") {
    process.stderr.write(`${result.message}\n`);
    process.exit(1);
  }

  const outPath = path.resolve(args.output);
  const pngBuffer = Buffer.from(await result.png.arrayBuffer());
  await writeFile(outPath, pngBuffer);

  process.stdout.write(
    `${JSON.stringify(
      {
        output: outPath,
        status: result.status,
        message: result.message,
        ...result.summary,
      },
      null,
      2,
    )}\n`,
  );
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
