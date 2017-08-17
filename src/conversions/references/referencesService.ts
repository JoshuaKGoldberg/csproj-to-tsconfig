import { EOL } from "os";

import { IFileWriter } from "../../index";
import { IConversionServiceSettings } from "../conversionService";
import { createFriendlyTimestamp } from "../createFriendlyTimestamp";
import { parseCsprojSource } from "../sourceParser";

/**
 * Dependencies to initialize a new ReferencesConversionService.
 */
export interface IReferencesConversionServiceDependencies {
    /**
     * Writes strings to files.
     */
    fileWriter: IFileWriter;

    /**
     * @returns The current date.
     */
    getDate: () => Date;
}

/**
 * Generates output references files from csproj sources.
 */
export class ReferencesConversionService {
    /**
     * Initializes a new instance of the ReferencesConversionService class.
     *
     * @param dependencies   Dependencies to be used for initialization.
     */
    public constructor(private readonly dependencies: IReferencesConversionServiceDependencies) { }

    /**
     * Converts a csproj source into an output References file.
     *
     * @param settings   Settings to convert to the References file.
     * @returns A Promise for converting to the References file.
     */
    public async convert(settings: IConversionServiceSettings): Promise<void> {
        const date = this.dependencies.getDate();
        const sourceFiles = parseCsprojSource(settings.csprojContents, settings.output.replacements);
        const lines = [
            ...sourceFiles.map((sourceFile) => `/// <reference path="${sourceFile}" />`),
            "",
        ];

        if (settings.output.includeTimestamp) {
            lines.unshift(`// ${createFriendlyTimestamp(date, settings.output)}`, "");
        }

        await this.dependencies.fileWriter(settings.output.fileName, lines.join(EOL));
    }
}
