import * as fs from "mz/fs";

import { Converter, IConversionSettings } from "./converter";
import { StatusCode } from "./statusCode";

export const argNames = {
    csproj: "csproj",
    reference: "reference",
    replacement: "replacement",
    target: "target",
    template: "template",
};

/**
 * Dependencies to initialize a new Runner.
 */
export interface IRunnerDependencies {
    /**
     * Converts .csproj files to their references and/or tsconfig equivalent(s)
     */
    converter?: Converter;

    /**
     * Handlers errors being logged.
     */
    onError: typeof console.error;

    /**
     * Handles messages being logged.
     */
    onLog: typeof console.log;
}

/**
 * @param errors   Accumulated errors from ensuring files exist.
 * @param filePath   Path to a file to verify the existence of.
 * @param fileSettingsName   Name of the file under settings.
 */
const ensureFileExists = async (errors: string[], filePath: string, fileSettingsName: string): Promise<void> => {
    if (!(await fs.exists(filePath))) {
        errors.push(`Missing required file: ${fileSettingsName} (checked '${filePath}').`);
    }
};

/**
 * Runs the csproj-to-tsconfig program.
 */
export class Runner {
    /**
     * Converts .csproj files to their references and/or tsconfig equivalent(s)
     */
    private readonly converter: Converter;

    /**
     * Handlers errors being logged.
     */
    private readonly errorStream: typeof console.error;

    /**
     * Handles messages being logged.
     */
    private readonly logStream: typeof console.log;

    /**
     * Initializes a new instance of the Runner class.
     *
     * @param dependencies   Dependencies to initialize a new Runner.
     */
    public constructor(dependencies: IRunnerDependencies) {
        this.converter = dependencies.converter || new Converter();
        this.errorStream = dependencies.onError;
        this.logStream = dependencies.onLog;
    }

    /**
     * Runs the program.
     *
     * @param rawSettings   Settings to convert files.
     * @returns Status from attempting to run the program.
     */
    public async run(rawSettings: Partial<IConversionSettings>): Promise<StatusCode> {
        const settings = this.ensureSettingsExist(rawSettings);
        if (settings === undefined) {
            return Promise.resolve(StatusCode.MissingArguments);
        }

        if (!(await this.ensureFilesExist(settings))) {
            return Promise.resolve(StatusCode.FileNotFound);
        }

        await this.converter.convert(settings);

        return StatusCode.Success;
    }

    /**
     * Ensures all required settings exist for a conversion.
     *
     * @param settings   Settings to convert files.
     * @returns Whether all required settings exist.
     */
    private ensureSettingsExist(settings: Partial<IConversionSettings>): IConversionSettings | undefined {
        const errors: string[] = [];

        if (settings.csproj === undefined) {
            errors.push(`Missing required argument: ${argNames.csproj}`);
        }

        if (settings.targetReferences === undefined && settings.targetTsconfig === undefined) {
            errors.push(`Need to specify one or both of ${argNames.reference} and ${argNames.target}`);
        }

        if (errors.length === 0) {
            return settings as IConversionSettings;
        }

        for (const error of errors) {
            this.errorStream(error);
        }

        return undefined;
    }

    /**
     * Ensures all required files exist for a conversion.
     *
     * @param settings   Settings to convert files.
     * @returns A Promise for whether all required files exist.
     */
    private async ensureFilesExist(settings: IConversionSettings): Promise<boolean> {
        const errors: string[] = [];

        await ensureFileExists(errors, settings.csproj, argNames.csproj);

        if (settings.targetReferences !== undefined) {
            await ensureFileExists(errors, settings.targetReferences.fileName, argNames.reference);
        }

        if (settings.targetTsconfig !== undefined) {
            await ensureFileExists(errors, settings.targetTsconfig.fileName, argNames.target);
        }

        if (errors.length === 0) {
            return true;
        }

        for (const error of errors) {
            this.errorStream(error);
        }

        return false;
    }
}
