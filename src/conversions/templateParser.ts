/* tslint:disable */
// See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/15722
// import * as stripJsonComments from "strip-json-comments";
import stripJsonComments = require("strip-json-comments");
/* tslint:enable */

/**
 * Content structure for tsconfig files.
 */
export type ITemplateStructure = object & {
    /**
     * Source file paths to include.
     */
    files: string[];
};

/**
 * Parses a tsconfig file.
 *
 * @param contents   Contents of a tsconfig file.
 * @returns The parsed structure of the file.
 */
export type ITemplateParser = (contents: string) => ITemplateStructure;

/**
 * Parses a tsconfig file.
 *
 * @param contents   Contents of a tsconfig file.
 * @returns The parsed structure of the file.
 */
export const parseTsconfigTemplate = (contents: string): ITemplateStructure =>
    JSON.parse(stripJsonComments(contents));
