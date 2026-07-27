import { createHash } from "node:crypto";
import {
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const ALLOWED_FILES = Object.freeze([
  "files/i2.png",
  "files/ii3.png",
  "manifest.json",
  "popup.css",
  "popup.html",
  "tokens.css",
]);

const modulePath = fileURLToPath(import.meta.url);
const repositoryRoot = resolve(dirname(modulePath), "..");
const dosDate = 0x0021;
const dosTime = 0;

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = (value & 1) === 1
      ? 0xedb88320 ^ (value >>> 1)
      : value >>> 1;
  }
  return value >>> 0;
});

function crc32(buffer) {
  let value = 0xffffffff;
  for (const byte of buffer) {
    value = crcTable[(value ^ byte) & 0xff] ^ (value >>> 8);
  }
  return (value ^ 0xffffffff) >>> 0;
}

function localHeader(name, data, checksum) {
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(dosTime, 10);
  header.writeUInt16LE(dosDate, 12);
  header.writeUInt32LE(checksum, 14);
  header.writeUInt32LE(data.length, 18);
  header.writeUInt32LE(data.length, 22);
  header.writeUInt16LE(name.length, 26);
  header.writeUInt16LE(0, 28);
  return header;
}

function centralHeader(name, data, checksum, localOffset) {
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(0x0314, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(dosTime, 12);
  header.writeUInt16LE(dosDate, 14);
  header.writeUInt32LE(checksum, 16);
  header.writeUInt32LE(data.length, 20);
  header.writeUInt32LE(data.length, 24);
  header.writeUInt16LE(name.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(localOffset, 42);
  return header;
}

function endOfCentralDirectory(entryCount, centralSize, centralOffset) {
  const record = Buffer.alloc(22);
  record.writeUInt32LE(0x06054b50, 0);
  record.writeUInt16LE(0, 4);
  record.writeUInt16LE(0, 6);
  record.writeUInt16LE(entryCount, 8);
  record.writeUInt16LE(entryCount, 10);
  record.writeUInt32LE(centralSize, 12);
  record.writeUInt32LE(centralOffset, 16);
  record.writeUInt16LE(0, 20);
  return record;
}

function readEntries() {
  const rootPrefix = repositoryRoot + sep;

  return ALLOWED_FILES.map((relativePath) => {
    const sourcePath = resolve(repositoryRoot, relativePath);
    if (!sourcePath.startsWith(rootPrefix)) {
      throw new Error(`Refusing to package out-of-repository path: ${relativePath}`);
    }
    if (!statSync(sourcePath).isFile()) {
      throw new Error(`Runtime package entry is not a file: ${relativePath}`);
    }

    return {
      name: Buffer.from(relativePath, "utf8"),
      data: readFileSync(sourcePath),
    };
  });
}

function createZip(entries) {
  const localParts = [];
  const centralParts = [];
  let localOffset = 0;

  for (const entry of entries) {
    const checksum = crc32(entry.data);
    const header = localHeader(entry.name, entry.data, checksum);
    localParts.push(header, entry.name, entry.data);
    centralParts.push(
      centralHeader(entry.name, entry.data, checksum, localOffset),
      entry.name,
    );
    localOffset += header.length + entry.name.length + entry.data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  return Buffer.concat([
    ...localParts,
    centralDirectory,
    endOfCentralDirectory(entries.length, centralDirectory.length, localOffset),
  ]);
}

export function buildPackage(outputPath) {
  const manifest = JSON.parse(
    readFileSync(resolve(repositoryRoot, "manifest.json"), "utf8"),
  );
  const targetPath = outputPath
    ?? resolve(
      repositoryRoot,
      ".artifacts",
      `amazon-minitv-adblocker-${manifest.version}.zip`,
    );
  const entries = readEntries();
  const archive = createZip(entries);

  mkdirSync(dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, archive);

  return {
    outputPath: targetPath,
    entries: ALLOWED_FILES,
    bytes: archive.length,
    sha256: createHash("sha256").update(archive).digest("hex"),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === modulePath) {
  const result = buildPackage(
    process.argv[2] ? resolve(process.argv[2]) : undefined,
  );
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
