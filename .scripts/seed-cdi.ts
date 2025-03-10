// h dev seed-cdi
// deno run -A ./.scripts/seed-cdi.ts

async function main() {
  const sourceFiles = await findComposeFiles(".nvidia.");

  for (const file of sourceFiles) {
    const outName = file.replace(".nvidia.", ".cdi.");
    const serviceName = resolveServiceName(file);
    const content = `
# This file is generated by seed-cdi.ts script,
# any updates will be overwritten.
services:
  ${serviceName}:
    deploy:
      resources:
        reservations:
          devices:
            - driver: cdi
              capabilities: [gpu]
              device_ids:
              - nvidia.com/gpu=all
    `.trim() + "\n";

    console.log(`Writing ${outName}...`);
    await Deno.writeTextFile(outName, content);
  }

  console.log("Done!");
}

function resolveServiceName(filename: string) {
  const ignored = new Set([
    "compose",
    "x",
    "nvidia",
    "yml",
  ]);
  const parts = filename.split(".").filter(
    (part) => !ignored.has(part),
  );

  if (parts.length !== 1) {
    throw new Error(
      `Unsupported seed Nvidia file: ${filename}, update the seed-cdi script`,
    );
  }

  return parts[0];
}

async function findComposeFiles(substring: string = "") {
  const files = [];
  for await (const entry of Deno.readDir(".")) {
    if (entry.isFile && entry.name.includes(substring)) {
      files.push(entry.name);
    }
  }
  return files;
}

main().catch(console.error);
