import { IOutputFileCreationSettings } from "./conversions/conversionService";
import { IMSBuildReplacer, IMSBuildReplacers } from "./conversions/sourceParser";
import { IExternalTsconfigFileCreationSettings } from "./conversions/tsconfig/tsconfigService";
import { IConversionSettings } from "./converter";

/**
 * Maps for an MSBuild replacers.
 */
type IReplacementSettings = {
    [P in keyof IMSBuildReplacers]: Map<string, string>;
};

/**
 * Raw conversion settings received from a CLI.
 */
export interface IRawConversionSettings {
    /**
     * File path to the source .csproj file.
     */
    csproj: string;

    /**
     * File path to the target .tsconfig file.
     */
    target?: string;

    /**
     * File path to the template .tsconfig file.
     */
    template?: string;

    /**
     * Whether to add a timestamp comment at the top of generated files.
     */
    timestamp?: boolean;

    /**
     * File path to the references file, if any.
     */
    reference?: string;

    /**
     * key=value MSBuild pairs to replace in raw source file paths.
     */
    replacement?: string | string[];
}

/**
 * Creates a replacer lookup over a replacements map.
 *
 * @param replacements   Replacements for values.
 * @returns A lookup over the replacements map.
 */
const createReplacementLookup = (replacements: Map<string, string>): IMSBuildReplacer =>
    (fileName: string) => replacements.has(fileName)
        ? replacements.get(fileName)! // tslint:disable-line:no-non-null-assertion
        : fileName;

/**
 * Creates replacement lookups for raw replacement lookups.
 *
 * @param rawReplacements   Raw replacements from a CLI.
 * @returns MSBuild replacements.
 */
export const generateKeyValueReplacements = (rawReplacements: string[]): IMSBuildReplacers => {
    const replacers: IReplacementSettings = {
        files: new Map<string, string>(),
        items: new Map<string, string>(),
        properties: new Map<string, string>(),
    };

    for (const rawReplacement of rawReplacements) {
        const [key, value] = rawReplacement.split("=");

        if (key[0] === "$") {
            replacers.properties.set(
                key.substring("$(".length, key.length - ")".length),
                value);
        } else if (key[0] === "@") {
            replacers.items.set(
                key.substring("@(".length, key.length - ")".length),
                value);
        } else {
            replacers.files.set(key, value);
        }
    }

    return {
        files: createReplacementLookup(replacers.files),
        items: createReplacementLookup(replacers.items),
        properties: createReplacementLookup(replacers.properties),
    };
};

/**
 * Converts raw CLI settings to runtime settings.
 *
 * @param rawConversionSettings   Raw CLI settings.
 * @returns The equivalent runtime settings.
 */
export const parseSettings = (rawConversionSettings: IRawConversionSettings): IConversionSettings => {
    const rawReplacements = typeof rawConversionSettings.replacement === "string"
        ? [rawConversionSettings.replacement]
        : rawConversionSettings.replacement;
    const replacements = rawReplacements instanceof Array
        ? generateKeyValueReplacements(rawReplacements)
        : undefined;

    const targetReferences: IOutputFileCreationSettings | undefined = rawConversionSettings.reference === undefined
        ? undefined
        : {
            fileName: rawConversionSettings.reference,
            includeTimestamp: rawConversionSettings.timestamp,
            replacements,
        };

    const targetTsconfig: IExternalTsconfigFileCreationSettings | undefined = rawConversionSettings.target === undefined
        ? undefined
        : {
            fileName: rawConversionSettings.target,
            includeTimestamp: rawConversionSettings.timestamp,
            replacements,
            templateTsconfig: rawConversionSettings.template,
        };

    return {
        csproj: rawConversionSettings.csproj,
        targetReferences,
        targetTsconfig,
    };
};
