import { expect } from "chai";
import "mocha";

import { createReferencesFile, IReferencesFileCreationSettings } from "../../../lib/conversions/referencesFileCreator";

describe("createReferencesFile", () => {
    const stubDate = new Date(1234, 5, 6, 7, 8, 9); // tslint:disable-line no-magic-numbers
    const assertInputsCreateFile = (sourceFiles: string[], settings: IReferencesFileCreationSettings, expected: string) => {
        // Act
        const actual = createReferencesFile(sourceFiles, stubDate, settings);

        // Assert
        expect(actual.replace(/\r\n/g, "\n")).to.be.equal(expected.replace(/\r\n/g, "\n"));
    };

    it("generates a blank file with no inputs", () => {
        assertInputsCreateFile(
            [],
            {},
            "");
    });

    it("generates a timestamped file with no inputs", () => {
        assertInputsCreateFile(
            [],
            {
                includeTimestamp: true,
            },
            `// Generated 6/6/1234, 6:15:11 AM

`);
    });

    it("includes files without a timestamp", () => {
        assertInputsCreateFile(
            [
                "first.ts",
                "second.ts",
            ],
            {},
            `/// <reference path="first.ts" />
/// <reference path="second.ts" />
`);
    });

    it("includes files with a timestamp", () => {
        assertInputsCreateFile(
            [
                "first.ts",
                "second.ts",
            ],
            {
                includeTimestamp: true,
            },
            `// Generated 6/6/1234, 6:15:11 AM

/// <reference path="first.ts" />
/// <reference path="second.ts" />
`);
    });
});
