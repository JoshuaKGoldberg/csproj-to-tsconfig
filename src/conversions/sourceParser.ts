export interface IMSBuildReplacements {
    files?: IMSBuildReplacer;
    items?: IMSBuildReplacer;
    properties?: IMSBuildReplacer;
}

/**
 * Converts MSBuild PropertyGroup values.
 */
export type IMSBuildReplacer = (value: string) => string;

const replaceMatchesWith = (fileName: string, matcher: RegExp, replacer: IMSBuildReplacer | undefined): string => {
    if (replacer === undefined) {
        return fileName;
    }

    let result: RegExpMatchArray | null;
    while (true) {
        result = matcher.exec(fileName);
        if (!result) {
            break;
        }

        // A @() matcher, for example, will give result = ["@(abc)", "abc"]
        fileName = [
            fileName.substring(0, result.index),
            replacer(result[1]),
            fileName.substring((result.index || 0) + result[0].length),
        ].join("");
    }

    return fileName;
};

const extractMatch = (line: string, replacements: IMSBuildReplacements): string => {
    // tslint:disable-next-line:no-non-null-assertion
    const matches = /Include=('|")(.*(\.d\.ts|\.ts))/gi.exec(line)!;
    let fileName = matches[2];

    fileName = replaceMatchesWith(fileName, /\$\((.+)\)/gi, replacements.properties);
    fileName = replaceMatchesWith(fileName, /\@\((.+)\)/gi, replacements.items);

    if (replacements.files !== undefined) {
        fileName = replacements.files(fileName);
    }

    return fileName;
};

/**
 * Parses source file paths from .csproj files.
 */
export class SourceParser {
    /**
     * Retrieves input file names from raw .csproj contents.
     *
     * @param contents   Raw contents of a .csproj file.
     * @param replacer   Replaces PropertyGroup
     * @returns The .csproj's source file paths.
     */
    public parse(contents: string, replacements: IMSBuildReplacements = {}): string[] {
        const lines = contents.match(/\<TypeScriptCompile Include=('|")(.*).ts('|")( )*(\/)*\>/gi);
        if (!lines) {
            return [];
        }

        return lines
            .map((line) => extractMatch(line, replacements))
            .filter((line) => line.indexOf("$") === -1);
    }
}
