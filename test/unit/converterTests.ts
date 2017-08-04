import { expect } from "chai";
import "mocha";
import { stub } from "sinon";

import { Converter, IConversionSettings } from "../../lib/converter";
import { stubCsprojContents, stubTemplateContents } from "./utils";

const stubCsprojName = "test.csproj";
const stubTemplateName = "template.json";

const stubConverter = (stubFileContents: { [i: string]: string }) => {
    let output = "";
    const getOutput = () => output;
    const fileWriter = stub();

    const converter = new Converter({
        fileReader: async (fileName: string) => stubFileContents[fileName],
        fileWriter: async (fileName: string, newContents: string) => {
            output = newContents;
            fileWriter(fileName, newContents);
        },
    });

    return { converter, getOutput, fileWriter };
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

describe("Converter", () => {
    describe("convert", () => {
        it("parses a single file", async () => {
            // Arrange
            const { converter, getOutput } = stubConverter({
                [stubCsprojName]: stubCsprojContents([
                    "wat.ts",
                ]),
                [stubTemplateName]: stubTemplateContents(),
            });
            const conversionSettings = stubConversionSettings();

            // Act
            await converter.convert(conversionSettings);
            const output = getOutput();

            // Assert
            expect(output).to.be.equal(`{
    "compilerOptions": {},
    "files": [
        "wat.ts"
    ]
}`);
        });

        it("parses file, ItemGroup, and PropertyGroup replacements", async () => {
            // Arrange
            const { converter, getOutput } = stubConverter({
                [stubCsprojName]: stubCsprojContents([
                    "MyFile.ts",
                    "MyDefinitionFile.d.ts",
                    "@(MyItem).ts",
                    "$(MyProperty).ts",
                ]),
                [stubTemplateName]: stubTemplateContents(),
            });
            const conversionSettings = stubConversionSettings({
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
            });

            // Act
            await converter.convert(conversionSettings);
            const output = getOutput();

            // Assert
            expect(output).to.be.equal(`{
    "compilerOptions": {},
    "files": [
        "OutputFile.ts",
        "OutputDefinitionFile.d.ts",
        "OutputItem.ts",
        "OutputProperty.ts"
    ]
}`);
        });
    });
});
