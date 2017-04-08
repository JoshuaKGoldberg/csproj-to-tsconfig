import * as fs from "mz/fs";

import { Converter, IConversionSettings } from "./converter";
import { StatusCode } from "./statusCode";

/**
 * Dependencies to initialize a new Runner.
 */
export interface IRunnerDependencies {
    /**
     * Converts .csproj files to their .tsconfig.json equivalents.
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
 * Runs the csproj-to-tsconfig program.
 */
export class Runner {
    /**
     * Converts .csproj files to their .tsconfig.json equivalents.
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
     * @param settings   Settings to convert files.
     * @returns Status from attempting to run the program.
     */
    public async run(settings: Partial<IConversionSettings>): Promise<StatusCode> {
        if (!settings.template) {
            settings.template = settings.target;
        }

        if (!this.ensureSettingsExist(settings)) {
            return Promise.resolve(StatusCode.MissingArguments);
        }

        if (!(await this.ensureFilesExist(settings as IConversionSettings))) {
            return Promise.resolve(StatusCode.FileNotFound);
        }

        await this.converter.convert(settings as IConversionSettings);
        return StatusCode.Success;
    }

    /**
     * @param settings   Settings to convert files.
     * @returns Whether all required settings exist.
     */
    private ensureSettingsExist(settings: Partial<IConversionSettings>): boolean {
        const errors: string[] = [];

        ensureSettingExists(errors, settings, "csproj");
        ensureSettingExists(errors, settings, "target");

        if (errors.length === 0) {
            return true;
        }

        for (const error of errors) {
            this.errorStream(error);
        }

        return false;
    }

    /**
     * @param settings   Settings to convert files.
     * @returns A Promise for whether all required files exist.
     */
    private async ensureFilesExist(settings: IConversionSettings): Promise<boolean> {
        const errors: string[] = [];

        await Promise.all([
            ensureFileExists(errors, settings.csproj, "csproj"),
            ensureFileExists(errors, settings.template, "template")
        ]);

        if (errors.length === 0) {
            return true;
        }

        for (const error of errors) {
            this.errorStream(error);
        }

        return false;
    }
}

/**
 * @param errors   Accumulated errors from ensuring settings exist.
 * @param settings   Settings to convert files.
 * @param setting   Name of a setting to verify the existence of.
 */
function ensureSettingExists(errors: string[], settings: Partial<IConversionSettings>, setting: keyof IConversionSettings): void {
    if (!settings[setting]) {
        errors.push(`Missing required argument: ${setting}`);
    }
}

/**
 * @param errors   Accumulated errors from ensuring files exist.
 * @param filePath   Path to a file to verify the existence of.
 * @param fileSettingsName   Name of the file under settings.
 */
async function ensureFileExists(errors: string[], filePath: string, fileSettingsName: keyof IConversionSettings): Promise<void> {
    if (!(await fs.exists(filePath))) {
        errors.push(`Missing required file: ${fileSettingsName} (checked '${filePath}').`);
    }
}
