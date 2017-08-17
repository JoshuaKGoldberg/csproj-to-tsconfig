import * as fs from "mz/fs";

import { IOutputFileCreationSettings } from "./conversions/conversionService";
import { ReferencesConversionService } from "./conversions/references/referencesService";
import { IExternalTsconfigFileCreationSettings, TsconfigConversionService } from "./conversions/tsconfig/tsconfigService";
import { IFileReader, IFileWriter } from "./index";

/**
 * Dependencies to initialize a new Converter.
 */
export interface IConverterDependencies {
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
 * Settings to convert files.
 */
export interface IConversionSettings {
    /**
     * File path to the source .csproj file.
     */
    csproj: string;

    /**
     * Settings to generate a /// references file, if any.
     */
    targetReferences?: IOutputFileCreationSettings;

    /**
     * Settings to generate a tsconfig file, if any.
     */
    targetTsconfig?: IExternalTsconfigFileCreationSettings;
}

/**
 * Converts .csproj files to their references and/or tsconfig equivalent(s).
 */
export class Converter {
    /**
     * Dependencies used for initialiation.
     */
    private readonly dependencies: IConverterDependencies;

    /**
     * Generates output references files from csproj sources.
     */
    private readonly referencesConverter: ReferencesConversionService;

    /**
     * Generates output tsconfig files from csproj sources.
     */
    private readonly tsconfigConverter: TsconfigConversionService;

    /**
     * Initializes a new instance of the Converter class.
     *
     * @param dependencies   Dependencies to be used for initialization.
     */
    public constructor(dependencies: Partial<IConverterDependencies> = {}) {
        this.dependencies = {
            fileReader: dependencies.fileReader || (async (fileName) => (await fs.readFile(fileName)).toString()),
            fileWriter: dependencies.fileWriter || (async (fileName, contents) => {
                await fs.writeFile(fileName, contents);
            }),
            getDate: dependencies.getDate || (() => new Date()),
        };

        this.referencesConverter = new ReferencesConversionService(this.dependencies);
        this.tsconfigConverter = new TsconfigConversionService(this.dependencies);
    }

    /**
     * Converts a .csproj file to its references and/or tsconfig equivalent(s).
     *
     * @param settings   Settings for conversion.
     * @returns A Promise for completing the conversion.
     */
    public async convert(settings: IConversionSettings): Promise<void> {
        const csprojContents = await this.dependencies.fileReader(settings.csproj);
        const tasks: Promise<void>[] = [];

        if (settings.targetReferences !== undefined) {
            tasks.push(
                this.referencesConverter.convert({
                    csprojContents,
                    output: settings.targetReferences,
                }));
        }

        if (settings.targetTsconfig !== undefined) {
            tasks.push(
                this.tsconfigConverter.convert({
                    csprojContents,
                    output: settings.targetTsconfig,
                }));
        }

        await Promise.all(tasks);
    }
}
