import { expect } from "chai";
import "mocha";

import { IMSBuildReplacements, IMSBuildReplacer, SourceParser } from "../../../lib/conversions/sourceParser";

const stubCsprojContents = (filePaths: string[]): string => {
    const includes = filePaths
        .map((filePath: string) => `<TypeScriptCompile Include="${filePath}" />`)
        .join("\n        ");

    return `
    <xml/?>
    <irrelevant />
    <PropertyGroup>
    </PropertyGroup>
    <ItemGroup>
        ${includes}
    </ItemGroup>
`;
};

const stubMsbuildReplacer = (transforms: { [i: string]: string }): IMSBuildReplacer =>
    (fileName: string) =>
        transforms[fileName] === undefined
            ? fileName
            : transforms[fileName];

describe("SourceParser", () => {
    describe("parse", () => {
        it("gives no results without any includes", async () => {
            // Arrange
            const contents = stubCsprojContents([]);
            const parser = new SourceParser();

            // Act
            const parsed = parser.parse(contents);

            // Act
            expect(parsed).to.be.deep.equal([]);
        });

        it("retrieves standard includes", () => {
            // Arrange
            const lines = [
                "file.ts",
                "definition.d.ts",
            ];
            const contents = stubCsprojContents(lines);
            const parser = new SourceParser();

            // Act
            const parsed = parser.parse(contents);

            // Act
            expect(parsed).to.be.deep.equal(lines);
        });

        it("replaces a file name", () => {
            // Arrange
            const original = "original.ts";
            const transformed = "transformed.ts";
            const fileTransforms = {
                [original]: transformed,
            };
            const contents = stubCsprojContents([original]);
            const parser = new SourceParser();
            const replacements: IMSBuildReplacements = {
                files: stubMsbuildReplacer(fileTransforms),
            };

            // Act
            const parsed = parser.parse(contents, replacements);

            // Act
            expect(parsed).to.be.deep.equal([transformed]);
        });

        it("replaces an ItemGroup include", () => {
            // Arrange
            const original = "@(original)";
            const transformed = "transformed";
            const contents = stubCsprojContents([
                `${original}.ts`,
            ]);
            const parser = new SourceParser();
            const replacements: IMSBuildReplacements = {
                items: stubMsbuildReplacer({
                    original: transformed,
                }),
            };

            // Act
            const parsed = parser.parse(contents, replacements);

            // Act
            expect(parsed).to.be.deep.equal([
                `${transformed}.ts`,
            ]);
        });

        it("replaces a PropertyGroup include", () => {
            // Arrange
            const original = "$(original)";
            const transformed = "transformed";
            const contents = stubCsprojContents([
                `${original}.ts`,
            ]);
            const parser = new SourceParser();
            const replacements: IMSBuildReplacements = {
                properties: stubMsbuildReplacer({
                    original: transformed,
                }),
            };

            // Act
            const parsed = parser.parse(contents, replacements);

            // Act
            expect(parsed).to.be.deep.equal([
                `${transformed}.ts`,
            ]);
        });
    });
});
