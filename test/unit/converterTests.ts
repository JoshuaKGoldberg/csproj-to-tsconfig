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
    });
});
