import * as fs from "mz/fs";

import { SourceParser } from "./conversions/sourceParser";
import { TargetCreator } from "./conversions/targetCreator";
import { TemplateParser } from "./conversions/templateParser";
import { IFileReader } from "./files/fileReader";
import { IFileWriter } from "./files/fileWriter";

/**
 * 
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
    sourceParser?: SourceParser;

    /**
     * Joins source file paths into tsconfig.json templates.
     */
    targetCreator?: TargetCreator;

    /**
     * Parses tsconfig.json files.
     */
    templateParser?: TemplateParser;

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
     * File path to the target .tsconfig file.
     */
    target: string;

    /**
     * File path to the template .tsconfig file.
     */
    template: string;
}

/**
 * Converts .csproj files to their .tsconfig.json equivalents.
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
    private readonly sourceParser: SourceParser;

    /**
     * Joins source file paths into tsconfig.json templates.
     */
    private readonly targetCreator: TargetCreator;

    /**
     * Parses tsconfig.json files.
     */
    private readonly templateParser: TemplateParser;

    /**
     * Initializes a new instance of the Converter class.
     * 
     * @param dependencies   Dependencies to be used for initialization.
     */
    public constructor(dependencies: IConverterDependencies = {}) {
        this.fileReader = dependencies.fileReader || (async (fileName) => (await fs.readFile(fileName)).toString());
        this.fileWriter = dependencies.fileWriter || ((fileName, contents) => fs.writeFile(fileName, contents));
        this.sourceParser = dependencies.sourceParser || new SourceParser();
        this.targetCreator = dependencies.targetCreator || new TargetCreator();
        this.templateParser = dependencies.templateParser || new TemplateParser();
    }

    /**
     * Converts a .csproj file to its .tsconfig.json equivalent.
     * 
     * @param settings   Settings for conversion.
     * @returns A Promise for completing the conversion.
     */
    public async convert(conversionSettings: IConversionSettings): Promise<void> {
        const [csprojContents, templateContents] = await Promise.all([
            this.fileReader(conversionSettings.csproj),
            this.fileReader(conversionSettings.template)
        ]);

        const sourceFiles = this.sourceParser.intake(csprojContents);
        const templateStructure = this.templateParser.intake(templateContents);

        const result = this.targetCreator.join(templateStructure, sourceFiles);

        await this.fileWriter(conversionSettings.target, result);
    }
}
