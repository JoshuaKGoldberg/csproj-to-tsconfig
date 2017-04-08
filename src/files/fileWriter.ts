/**
 * Writes strings to files.
 * 
 * @param filePath   Path to a file.
 * @param contents   New contents of the file.
 * @returns A Promise for writing to the file.
 */
export interface IFileWriter {
    (filePath: string, contents: string): Promise<void>;
}
