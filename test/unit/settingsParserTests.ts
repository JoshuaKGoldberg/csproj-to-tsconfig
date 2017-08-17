import { expect } from "chai";
import "mocha";

import { IRawConversionSettings, parseSettings } from "../../lib/settingsParser";

describe("parseSettings", () => {
    const stubRawSettings = {
        csproj: "directory/project.csproj",
        target: "output/tsconfig.json",
        template: "input/base.json",
    };

    it("parses csproj, target, and template paths from settings", () => {
        // Act
        const parsed = parseSettings(stubRawSettings);

        // Assert
        expect(parsed).to.be.deep.equal({
            csproj: "directory/project.csproj",
            targetReferences: undefined,
            targetTsconfig: {
                fileName: "output/tsconfig.json",
                includeTimestamp: undefined,
                replacements: undefined,
                templateTsconfig: "input/base.json",
            },
        });
    });

    it("parses timestamp from settings", () => {
        // Act
        const parsed = parseSettings({
            ...stubRawSettings,
            timestamp: true,
        });

        // Assert
        expect(parsed).to.be.deep.equal({
            csproj: "directory/project.csproj",
            targetReferences: undefined,
            targetTsconfig: {
                fileName: "output/tsconfig.json",
                includeTimestamp: true,
                replacements: undefined,
                templateTsconfig: "input/base.json",
            },
        });
    });

    it("provides target references instead when given a reference", () => {
        // Act
        const parsed = parseSettings({
            csproj: stubRawSettings.csproj,
            reference: "output/reference.ts",
        });

        // Assert
        expect(parsed).to.be.deep.equal({
            csproj: "directory/project.csproj",
            targetReferences: {
                fileName: "output/reference.ts",
                includeTimestamp: undefined,
                replacements: undefined,
            },
            targetTsconfig: undefined,
        });
    });

    it("provides both references and tsconfig with timestamps when all are given", () => {
        // Act
        const parsed = parseSettings({
            ...stubRawSettings,
            reference: "output/reference.ts",
            timestamp: true,
        });

        // Assert
        expect(parsed).to.be.deep.equal({
            csproj: "directory/project.csproj",
            targetReferences: {
                fileName: "output/reference.ts",
                includeTimestamp: true,
                replacements: undefined,
            },
            targetTsconfig: {
                fileName: "output/tsconfig.json",
                includeTimestamp: true,
                replacements: undefined,
                templateTsconfig: "input/base.json",
            },
        });
    });

    it("parses a string file replacement", () => {
        // Act
        const settings = parseSettings({
            ...stubRawSettings,
            replacement: "abc=def",
        });
        // tslint:disable no-non-null-assertion
        const replacements = settings.targetTsconfig!.replacements!;
        const replaced = replacements.files!("abc");
        // tslint:enable no-non-null-assertion

        // Assert
        expect(replaced).to.be.equal("def");
    });

    it("parses an array of file replacements", () => {
        // Act
        const settings = parseSettings({
            ...stubRawSettings,
            replacement: [
                "abc=def",
                "ghi=jkl",
            ],
        });
        // tslint:disable no-non-null-assertion
        const replacements = settings.targetTsconfig!.replacements!;
        const files = replacements.files!;
        // tslint:enable no-non-null-assertion
        const replaced = [
            files("abc"),
            files("ghi"),
        ];

        // Assert
        expect(replaced).to.be.deep.equal(["def", "jkl"]);
    });

    it("parses an ItemGroup replacement", () => {
        // Act
        const settings = parseSettings({
            ...stubRawSettings,
            replacement: "@(abc)=def",
        });
        // tslint:disable no-non-null-assertion
        const replacements = settings.targetTsconfig!.replacements!;
        const replaced = replacements.items!("abc");
        // tslint:enable no-non-null-assertion

        // Assert
        expect(replaced).to.be.equal("def");
    });

    it("parses a PropertyGroup replacement", () => {
        // Act
        const settings = parseSettings({
            ...stubRawSettings,
            replacement: "$(abc)=def",
        });
        // tslint:disable no-non-null-assertion
        const replacements = settings.targetTsconfig!.replacements!;
        const replaced = replacements.properties!("abc");
        // tslint:enable no-non-null-assertion

        // Assert
        expect(replaced).to.be.equal("def");
    });
});
