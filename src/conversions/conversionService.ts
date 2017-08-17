import { ITimestampSettings } from "./createFriendlyTimestamp";
import { IMSBuildReplacers } from "./sourceParser";

/**
 * Settings to generate an output file from a service.
 */
export interface IOutputFileCreationSettings extends ITimestampSettings {
    /**
     * File name to output a into.
     */
    fileName: string;

    /**
     * MSBuild values to replace in raw source file paths.
     */
    replacements?: IMSBuildReplacers;
}

/**
 * Runtime settings to convert from a csproj file to an output file.
 */
export interface IConversionServiceSettings {
    /**
     * Original csproj file contents.
     */
    csprojContents: string;

    /**
     * Settings to generate the output file.
     */
    output: IOutputFileCreationSettings;
}

/**
 * Converts csproj sources into output files.
 */
export interface IConversionService {
    /**
     * Converts a csproj source into an output file.
     *
     * @param serviceSettings   Settings for the conversion.
     * @returns A Promise for converting the file.
     */
    convert(serviceSettings: IConversionServiceSettings): Promise<void>;
}
