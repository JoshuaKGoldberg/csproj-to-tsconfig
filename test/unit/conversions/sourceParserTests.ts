import { expect } from "chai";
import "mocha";

import { IMSBuildReplacer, IMSBuildReplacers, parseCsprojSource } from "../../../lib/conversions/sourceParser";
import { stubCsprojContents } from "../utils";

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

            // Act
            const parsed = parseCsprojSource(contents);

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

            // Act
            const parsed = parseCsprojSource(contents);

            // Act
            expect(parsed).to.be.deep.equal([
                "./file.ts",
                "./definition.d.ts",
            ]);
        });

        it("replaces a file name", () => {
            // Arrange
            const original = "original.ts";
            const transformed = "transformed.ts";
            const fileTransforms = {
                [original]: transformed,
            };
            const contents = stubCsprojContents([original]);
            const replacements: IMSBuildReplacers = {
                files: stubMsbuildReplacer(fileTransforms),
            };

            // Act
            const parsed = parseCsprojSource(contents, replacements);

            // Act
            expect(parsed).to.be.deep.equal([
                `./${transformed}`,
            ]);
        });

        it("replaces an ItemGroup include", () => {
            // Arrange
            const original = "@(original)";
            const transformed = "transformed";
            const contents = stubCsprojContents([
                `${original}.ts`,
            ]);
            const replacements: IMSBuildReplacers = {
                items: stubMsbuildReplacer({
                    original: transformed,
                }),
            };

            // Act
            const parsed = parseCsprojSource(contents, replacements);

            // Act
            expect(parsed).to.be.deep.equal([
                `./${transformed}.ts`,
            ]);
        });

        it("replaces a PropertyGroup include", () => {
            // Arrange
            const original = "$(original)";
            const transformed = "transformed";
            const contents = stubCsprojContents([
                `${original}.ts`,
            ]);
            const replacements: IMSBuildReplacers = {
                properties: stubMsbuildReplacer({
                    original: transformed,
                }),
            };

            // Act
            const parsed = parseCsprojSource(contents, replacements);

            // Act
            expect(parsed).to.be.deep.equal([
                `./${transformed}.ts`,
            ]);
        });
    });
});
