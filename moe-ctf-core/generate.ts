const exportFolders = '../moe-ctf-admin/src/types';

const filesMap = new Set(['types.ts']);

let typesFiles = '';

const readAllFiles = async (dirName: string) => {
  const dir = Deno.readDir(new URL(dirName, import.meta.url));

  for await (const entry of dir) {
    if (entry.isDirectory) {
      await readAllFiles(`${dirName}/${entry.name}`);
    }

    if (entry.isFile && filesMap.has(entry.name)) {
      const types = await Deno.readTextFile(`${dirName}/types.ts`);

      typesFiles += `${types}\n\n`;
    }
  }
};

await readAllFiles('./app/resolvers');
await Deno.writeTextFile(new URL(`${exportFolders}/types.ts`, import.meta.url), typesFiles);

await Deno.copyFile(
  new URL('./app/utils/pogo-resolver/jsend.ts', import.meta.url),
  new URL(`${exportFolders}/jsend.ts`, import.meta.url),
);
