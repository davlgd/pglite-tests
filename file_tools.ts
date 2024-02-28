export async function init_file(path: string) {
    // If the file doesn't exist, create it
    const file_exists = await Bun.file(path).exists();
    if (!file_exists) {
        const error_message = `Error while creating '${path}':`;

        // There is a bug in Bun: it can't create an empty file in a subfolder
        // So we create a non empty file, then we empty it
        try {
            await Bun.write(path, "_");
            await Bun.write(path, "");
            console.log(`Created the '${path}' pglite db file`);
        }
        catch (e) {
            console.log(error_message, e);
        }

    }
}