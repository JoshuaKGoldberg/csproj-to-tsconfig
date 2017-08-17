import { EOL } from "os";

import { IFileReader, IFileWriter } from "../../index";
import { IConversionServiceSettings, IOutputFileCreationSettings } from "../conversionService";
import { createFriendlyTimestamp, ITimestampSettings } from "../createFriendlyTimestamp";
import { parseCsprojSource } from "../sourceParser";
import { mergeSettings } from "./mergeSettings";
import { ITemplateStructure, parseTsconfigTemplate } from "./parseTsconfigTemplate";

/**
 * Dependencies to initialize a new TSconfigConversionService.
 */
export interface ITsconfigConversionServiceDependencies {
    /**
     * Reads files as strings.
     */
    fileReader: IFileReader;

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
 * External settings to create an output tsconfig file.
 */
export interface IExternalTsconfigFileCreationSettings extends IOutputFileCreationSettings {
    /**
     * Any overrides to copy onto the tsconfig structure.
     */
    overrides?: {};

    /**
     * Path to a template tsconfig file to merge settings onto.
     */
    templateTsconfig: string;
}

/**
 * Runtime settings to generate an output tsconfig file.
 */
export interface ITsconfigConversionServiceSettings extends IConversionServiceSettings {
    /**
     * External settings to create an output tsconfig file.
     */
    output: IExternalTsconfigFileCreationSettings;
}

/**
 * How much to indent created JSON files.
 */
const indentation = 4;

/**
 * Generates output tsconfig files from csproj sources.
 */
export class TsconfigConversionService {
    /**
     * Initializes a new instance of the TsconfigConversionService class.
     *
     * @param dependencies   Dependencies to be used for initialization.
     */
    public constructor(private readonly dependencies: ITsconfigConversionServiceDependencies) { }

    /**
     * Converts a csproj source into an output tsconfig file.
     *
     * @param settings   Settings to convert to the tsconfig file.
     * @returns A Promise for converting to the tsconfig file.
     */
    public async convert(settings: ITsconfigConversionServiceSettings): Promise<void> {
        const sourceFiles = parseCsprojSource(settings.csprojContents, settings.output.replacements);
        const templateStructure = parseTsconfigTemplate(await this.dependencies.fileReader(settings.output.templateTsconfig));
        const mergedSettings = mergeSettings(templateStructure, settings.output.overrides);

        const result = this.createTargetTsconfig(mergedSettings, sourceFiles, settings.output);

        await this.dependencies.fileWriter(settings.output.fileName, result);
    }

    /**
     * Joins source file paths into a tsconfig.json template.
     *
     * @param templateStructure   Template for a tsconfig.json.
     * @param sourceFiles   Source file paths.
     * @returns The resultant completed tsconfig.json.
     */
    private createTargetTsconfig(
        templateStructure: Partial<ITemplateStructure>,
        sourceFiles: string[],
        timestampSettings?: ITimestampSettings): string {

        const date = this.dependencies.getDate();
        let result = JSON.stringify(
            {
                ...templateStructure,
                files: sourceFiles,
            },
            undefined,
            indentation);

        if (timestampSettings !== undefined && timestampSettings.includeTimestamp) {
            result = `// ${createFriendlyTimestamp(date, timestampSettings)}${EOL}${result}`;
        }

        return result;
    }
}
