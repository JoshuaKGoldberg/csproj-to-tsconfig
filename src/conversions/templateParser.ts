// See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/15722
// import * as stripJsonComments from "strip-json-comments";
import stripJsonComments = require("strip-json-comments");

/**
 * Content structure for tsconfig.json files.
 */
export interface ITemplateStructure {
    /**
     * Source file paths to include.
     */
    files: string[];
}

/**
 * Parses tsconfig.json files.
 */
export class TemplateParser {
    /**
     * Parses a tsconfig.json file.
     * 
     * @param contents   Contents of a tsconfig.json file.
     * @returns The parsed structure of the file.
     */
    public intake(contents: string): ITemplateStructure {
        return JSON.parse(stripJsonComments(contents));
    }
}
