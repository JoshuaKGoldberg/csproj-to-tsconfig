import { expect } from "chai";
import "mocha";
import { stub } from "sinon";

import { TsconfigConversionService } from "../../../../lib/conversions/tsconfig/tsconfigService";
import { IConversionSettings } from "../../../../lib/converter";
import { stubCsprojContents, stubTemplateContents } from "../../utils";

describe("TsconfigConversionService", () => {
    const stubCsprojName = "test.csproj";
    const stubOutputName = "tsconfig.json";
    const stubTemplateName = "template.json";
    const stubDate = new Date(1234, 5, 6, 7, 8, 9); // tslint:disable-line no-magic-numbers

    const stubFileContents: { [i: string]: string } = {
        [stubTemplateName]: stubTemplateContents(),
    };

    const stubTsconfigConversionService = () => {
        const getFileContents = (fileName: string) => stubFileContents[fileName];

        const converter = new TsconfigConversionService({
            fileReader: async (fileName: string) => stubFileContents[fileName],
            fileWriter: async (fileName: string, newContents: string) => {
                stubFileContents[fileName] = newContents;
            },
            getDate: () => stubDate,
        });

        return { converter, getFileContents };
    };

    const stubConversionSettings = (overrides: Partial<IConversionSettings> = {}) => ({
        csproj: stubCsprojName,
        target: "",
        template: stubTemplateName,
        ...overrides,
    });

    const stubReplacer = (replacements: { [i: string]: string }) =>
        (fileName: string) =>
            replacements[fileName] === undefined
                ? fileName
                : replacements[fileName];

    describe("convert", () => {
        it("parses a single file", async () => {
            // Arrange
            const { converter, getFileContents } = stubTsconfigConversionService();
            const conversionSettings = stubConversionSettings();

            // Act
            await converter.convert({
                csprojContents: stubCsprojContents([
                    "file.ts",
                ]),
                output: {
                    fileName: stubOutputName,
                    templateTsconfig: stubTemplateName,
                },
            });
            const output = getFileContents(stubOutputName);

            // Assert
            expect(output).to.be.equal(`{
    "compilerOptions": {},
    "files": [
        "./file.ts"
    ]
}`);
        });

        it("parses file, ItemGroup, and PropertyGroup replacements", async () => {
            // Arrange
            const { converter, getFileContents } = stubTsconfigConversionService();
            const conversionSettings = stubConversionSettings();

            // Act
            await converter.convert({
                csprojContents: stubCsprojContents([
                    "MyFile.ts",
                    "MyDefinitionFile.d.ts",
                    "@(MyItem).ts",
                    "$(MyProperty).ts",
                ]),
                output: {
                    fileName: stubOutputName,
                    replacements: {
                        files: stubReplacer({
                            "MyDefinitionFile.d.ts": "OutputDefinitionFile.d.ts",
                            "MyFile.ts": "OutputFile.ts",
                        }),
                        items: stubReplacer({
                            MyItem: "OutputItem",
                        }),
                        properties: stubReplacer({
                            MyProperty: "OutputProperty",
                        }),
                    },
                    templateTsconfig: stubTemplateName,
                },
            });
            const output = getFileContents(stubOutputName);

            // Assert
            expect(output).to.be.equal(`{
    "compilerOptions": {},
    "files": [
        "./OutputFile.ts",
        "./OutputDefinitionFile.d.ts",
        "./OutputItem.ts",
        "./OutputProperty.ts"
    ]
}`);
        });

        it("adds a timestamp if directed", async () => {
            // Arrange
            const { converter, getFileContents } = stubTsconfigConversionService();
            const conversionSettings = stubConversionSettings();

            // Act
            await converter.convert({
                csprojContents: stubCsprojContents([
                    "file.ts",
                ]),
                output: {
                    fileName: stubOutputName,
                    includeTimestamp: true,
                    templateTsconfig: stubTemplateName,
                },
            });
            const output = getFileContents(stubOutputName);

            // Assert
            expect(output).to.be.equal(`// Generated 6/6/1234, 6:15:11 AM
{
    "compilerOptions": {},
    "files": [
        "./file.ts"
    ]
}`);
        });
    });
});
