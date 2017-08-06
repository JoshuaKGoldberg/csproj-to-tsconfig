import * as fs from "mz/fs";

import { mergeSettings } from "./conversions/mergeSettings";
import { IMSBuildReplacers, ISourceParser, parseCsprojSource } from "./conversions/sourceParser";
import { createTargetTsconfig, ITargetCreator } from "./conversions/targetCreator";
import { ITemplateParser, parseTsconfigTemplate } from "./conversions/templateParser";
import { IFileReader } from "./files/fileReader";
import { IFileWriter } from "./files/fileWriter";

/**
 * Dependencies to initialize a new Converter.
 */
export interface IConverterDependencies {
    /**
     * Reads files as strings.
     */
    fileReader?: IFileReader;

    /**
     * Writes strings to files.
     */
    fileWriter?: IFileWriter;

    /**
     * Parses source file paths from .csproj files.
     */
    sourceParser?: ISourceParser;

    /**
     * Joins source file paths into tsconfig.json templates.
     */
    targetCreator?: ITargetCreator;

    /**
     * Parses tsconfig.json files.
     */
    templateParser?: ITemplateParser;
}

/**
 * Settings to convert files.
 */
export interface IConversionSettings {
    /**
     * File path to the source .csproj file.
     */
    csproj: string;

    /**
     * Any overrides to copy onto the tsconfig.json structure.
     */
    overrides?: object;

    /**
     * MSBuild values to replace in raw source file paths.
     */
    replacements?: IMSBuildReplacers;

    /**
     * File path to the target tsconfig.json file.
     */
    target: string;

    /**
     * File path to the template tsconfig.json file.
     */
    template: string;
}

/**
 * Converts .csproj files to their tsconfig.json.json equivalents.
 */
export class Converter {
    /**
     * Reads files as strings.
     */
    private readonly fileReader: IFileReader;

    /**
     * Writes strings to files.
     */
    private readonly fileWriter: IFileWriter;

    /**
     * Parses source file paths from .csproj files.
     */
    private readonly sourceParser: ISourceParser;

    /**
     * Joins source file paths into tsconfig.json templates.
     */
    private readonly targetCreator: ITargetCreator;

    /**
     * Parses tsconfig.json files.
     */
    private readonly templateParser: ITemplateParser;

    /**
     * Initializes a new instance of the Converter class.
     *
     * @param dependencies   Dependencies to be used for initialization.
     */
    public constructor(dependencies: IConverterDependencies = {}) {
        this.fileReader = dependencies.fileReader || (async (fileName) => (await fs.readFile(fileName)).toString());
        this.fileWriter = dependencies.fileWriter || (async (fileName, contents) => {
            await fs.writeFile(fileName, contents);
        });
        this.sourceParser = dependencies.sourceParser || parseCsprojSource;
        this.targetCreator = dependencies.targetCreator || createTargetTsconfig;
        this.templateParser = dependencies.templateParser || parseTsconfigTemplate;
    }

    /**
     * Converts a .csproj file to its tsconfig.json equivalent.
     *
     * @param settings   Settings for conversion.
     * @returns A Promise for completing the conversion.
     */
    public async convert(settings: IConversionSettings): Promise<void> {
        const [csprojContents, templateContents] = await Promise.all([
            this.fileReader(settings.csproj),
            this.fileReader(settings.template),
        ]);

        const sourceFiles = this.sourceParser(csprojContents, settings.replacements);
        const templateStructure = this.templateParser(templateContents);
        const mergedSettings = mergeSettings(templateStructure, settings.overrides || {});

        const result = this.targetCreator(mergedSettings, sourceFiles);

        await this.fileWriter(settings.target, result);
    }
}
