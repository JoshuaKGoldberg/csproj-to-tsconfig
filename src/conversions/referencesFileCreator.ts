import { EOL } from "os";

/**
 * Settings to generate a /// references file.
 */
export interface IReferencesFileCreationSettings {
    /**
     * Whether to include a timestamp before files.
     */
    includeTimestamp?: boolean;

    /**
     * Timestamp locale, if not en-US.
     */
    locale?: string;
}

/**
 * External settings to generate a /// references file.
 */
export interface IReferencesFileSettings extends IReferencesFileCreationSettings {
    /**
     * File name to output a /// references file into.
     */
    fileName: string;
}

/**
 * Creates the contents of a /// references file.
 *
 * @param sourceFiles   Source file contents of the file.
 * @param date   Timestamp to generate on top of the file.
 * @param settings   Settings to generate the /// references file.
 */
export const createReferencesFile = (sourceFiles: string[], date: Date, settings: IReferencesFileCreationSettings) => {
    const lines = [
        ...sourceFiles.map((sourceFile) => `/// <reference path="${sourceFile}" />`),
        "",
    ];

    if (settings.includeTimestamp) {
        const dateFormatted = date.toLocaleString(
            settings.locale === undefined
                ? "en-US"
                : settings.locale);

        lines.unshift(`// Generated ${dateFormatted}`, "");
    }

    return lines.join(EOL);
};
