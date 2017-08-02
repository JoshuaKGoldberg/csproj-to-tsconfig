/**
 * MSBuild values to replace in raw source file paths.
 */
export interface IMSBuildReplacements {
    [i: string]: string;
}

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
                    line = line.replace(new RegExp(`\\$\\(${key}\\)`, "gi"), replacements[key]);
                }

                return line;
            })
            .filter((line) => line.indexOf("$") === -1)
            .map((line) => line
                .substring(line.indexOf('"') + 1, line.lastIndexOf('"'))
                .replace(/\\/g, "/"));
    }
}
