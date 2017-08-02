/**
 * MSBuild values to replace in raw source file paths.
 */
export interface IMSBuildReplacements {
    [i: string]: string | IMSBuildReplacer;
}

/**
 * Replaces a raw source file path with a computed value.
 */
export type IMSBuildReplacer = (sourceFilePath: string) => string;

/**
 * Converts a source file path to a replaced value.
 *
 * @param line   Line with a raw source file path.
 * @param replacer   New value or a computer to generate it.
 * @returns The equivalent replacement for the line.
 */
const getReplacement = (line: string, replacer: string | IMSBuildReplacer): string =>
    typeof replacer === "string"
        ? replacer
        : replacer(line);

/**
 * Parses source file paths from .csproj files.
 */
export class SourceParser {
    /**
     * Retrieves input file names from raw .csproj contents.
     *
     * @param contents   Raw contents of a .csproj file.
     * @param replacements   MSBuild values to replace in raw source file paths.
     * @returns The .csproj's source file paths.
     */
    public intake(contents: string, replacements: IMSBuildReplacements = {}): string[] {
        const lines = contents.match(/\<TypeScriptCompile Include=('|")(.*).ts('|")( )*(\/)*\>/gi);

        if (!lines) {
            return [];
        }

        return lines
            .map((line) => {
                for (const key in replacements) {
                    line = line.replace(new RegExp(`\\$\\(${key}\\)`, "gi"), getReplacement(line, replacements[key]));
                }

                return line;
            })
            .filter((line) => line.indexOf("$") === -1)
            .map((line) => line
                .substring(line.indexOf('"') + 1, line.lastIndexOf('"'))
                .replace(/\\/g, "/"));
    }
}
