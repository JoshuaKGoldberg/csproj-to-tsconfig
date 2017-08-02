/**
 * Reads a files as string.
 *
 * @param filePath   Path to a file.
 * @returns A Promise for the file's contents.
 */
export type IFileReader = (filePath: string) => Promise<string>;
