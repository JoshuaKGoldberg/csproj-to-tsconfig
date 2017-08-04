import { IMSBuildReplacer } from "./conversions/sourceParser";
import { IConversionSettings } from "./converter";

/**
 * Raw conversion settings received from a CLI.
 */
export interface IRawConversionSettings {
    /**
     * File path to the source .csproj file.
     */
    csproj: string;

    /**
     * key=value MSBuild pairs to replace in raw source file paths.
     */
    replacement?: string | string[];

    /**
     * File path to the target .tsconfig file.
     */
    target: string;

    /**
     * File path to the template .tsconfig file.
     */
    template: string;
}

const generateReplacer = (rawReplacements: string[]): IMSBuildReplacer => {
    const replacements = new Map<string, string>();

    for (const rawReplacement of rawReplacements) {
        const split = rawReplacement.split("=");

        replacements.set(split[0], split[1]);
    }

    return (fileName: string) => replacements.has(fileName)
        ? replacements.get(fileName)! // tslint:disable-line:no-non-null-assertion
        : fileName;
};

/**
 * Converts raw CLI settings to runtime settings.
 */
export class SettingsParser {
    /**
     * Converts raw CLI settings to runtime settings.
     *
     * @param rawConversionSettings   Raw CLI settings.
     * @returns The equivalent runtime settings.
     */
    public parse(rawConversionSettings: IRawConversionSettings): IConversionSettings {
        const rawReplacements = typeof rawConversionSettings.replacement === "string"
            ? [rawConversionSettings.replacement]
            : rawConversionSettings.replacement;
        const replacer = rawReplacements instanceof Array
            ? generateReplacer(rawReplacements)
            : undefined;

        return {
            ...(rawConversionSettings as IConversionSettings),
            replacements: {
                properties: replacer,
            },
        };
    }
}
