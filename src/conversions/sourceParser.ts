/**
 * Parses source file paths from .csproj files.
 */
export class SourceParser {
    /**
     * Retrieves input file names from raw .csproj contents.
     * 
     * @param contents   Raw contents of a .csproj file.
     * @returns The .csproj's source file paths.
     */
    public intake(contents: string): string[] {
        const lines = contents.match(/\<TypeScriptCompile Include="(.*).ts" \/\>/gi);

        if (!lines) {
            return [];
        }

        return lines
            .filter(line => line.indexOf("$") === -1)
            .map(line => line
                .substring(line.indexOf(`"`) + 1, line.lastIndexOf(`"`))
                .replace(/\\/g, "/"));
    }
}
