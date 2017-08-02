import { ITemplateStructure } from "./templateParser";

/**
 * How much to indent created JSON files.
 */
const indentation = 4;

/**
 * Joins source file paths into tsconfig.json templates.
 */
export class TargetCreator {
    /**
     * Joins source file paths into a tsconfig.json template.
     *
     * @param templateStructure   Template for a tsconfig.json.
     * @param sourceFiles   Source file paths.
     * @returns The resultant completed tsconfig.json.
     */
    public join(templateStructure: ITemplateStructure, sourceFiles: string[]): string {
        const newTemplate = {
            ...templateStructure,
            files: sourceFiles,
        };

        return JSON.stringify(newTemplate, undefined, indentation);
    }
}
