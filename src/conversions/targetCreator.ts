import { ITemplateStructure } from "./templateParser";

/**
 * Joins source file paths into a tsconfig.json template.
 *
 * @param templateStructure   Template for a tsconfig.json.
 * @param sourceFiles   Source file paths.
 * @returns The resultant completed tsconfig.json.
 */
export type ITargetCreator = (templateStructure: Partial<ITemplateStructure>, sourceFiles: string[]) => string;

/**
 * How much to indent created JSON files.
 */
const indentation = 4;

/**
 * Joins source file paths into a tsconfig.json template.
 *
 * @param templateStructure   Template for a tsconfig.json.
 * @param sourceFiles   Source file paths.
 * @returns The resultant completed tsconfig.json.
 */
export const createTargetTsconfig = (templateStructure: Partial<ITemplateStructure>, sourceFiles: string[]): string =>
    JSON.stringify(
        {
            ...templateStructure,
            files: sourceFiles,
        },
        undefined,
        indentation);
