/**
 * Replacers for each type of replaceable content.
 */
export interface IMSBuildReplacers {
    /**
     * Replacers for full file names, including extensions.
     */
    files?: IMSBuildReplacer;

    /**
     * Replacers for ItemGroup values, excluding "@(" and ")".
     */
    items?: IMSBuildReplacer;

    /**
     * Replacers for PropertyGroup values, excluding "$(" and ")".
     */
    properties?: IMSBuildReplacer;
}

/**
 * Converts MSBuild PropertyGroup values.
 */
export type IMSBuildReplacer = (value: string) => string;

/**
 * Parses source file paths from .csproj files.
 *
 * @param contents   Raw contents of a .csproj file.
 * @param replacer   Replaces PropertyGroup
 * @returns The .csproj's source file paths.
 */
export type ISourceParser = (contents: string, replacements?: IMSBuildReplacers) => string[];

/**
 * Replaces out a type of MSBuild replacement logic from a raw file name.
 *
 * @param fileName   Raw name of a file.
 * @param matcher   Finds MSBuild logic in the name.
 * @param replacer   Replaces the MSBuid logic with real contents.
 * @returns A usable version of the file name.
 */
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

/**
 * Parses a file name out of a raw MSBuild line.
 *
 * @param rawLine   Raw line from an MSBuild file.
 * @param replacements   Replacers for MSBuild logic.
 * @returns A usable file name from the line.
 */
const parseFileLine = (rawLine: string, replacements: IMSBuildReplacers): string => {
    // tslint:disable-next-line:no-non-null-assertion
    const matches = /Include=('|")(.*(\.d\.ts|\.ts))/gi.exec(rawLine)!;
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
 *
 * @param contents   Raw contents of a .csproj file.
 * @param replacer   Replaces PropertyGroup
 * @returns The .csproj's source file paths.
 */
export const parseCsprojSource = (contents: string, replacements: IMSBuildReplacers = {}): string[] => {
    const lines = contents.match(/\<TypeScriptCompile Include=('|")(.*).ts('|")( )*(\/)*\>/gi);
    if (!lines) {
        return [];
    }

    return lines.map((line) => parseFileLine(line, replacements));
};
