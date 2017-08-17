import { expect } from "chai";
import "mocha";

import { IConversionServiceSettings, IOutputFileCreationSettings } from "../../../../lib/conversions/conversionService";
import { ReferencesConversionService } from "../../../../lib/conversions/references/referencesService";
import { stubCsprojContents, stubDate, stubTime } from "../../utils";

describe("ReferencesConversionService", () => {
    const stubReferencesConversionService = () => {
        let fileContents = "";
        const getFileContents = () => fileContents;

        const fileWriter = async (_: string, newContents: string) => {
            fileContents = newContents;
        };
        const getDate = () => stubDate;

        const service = new ReferencesConversionService({ fileWriter, getDate });

        return { getFileContents, service };
    };

    const assertInputsCreateFile = async (sourceFiles: string[], settings: Partial<IOutputFileCreationSettings>, expected: string) => {
        // Arrange
        const fileName = "_AllReferences.ts";
        const csprojContents = stubCsprojContents(sourceFiles);
        const { getFileContents, service } = stubReferencesConversionService();

        // Act
        await service.convert({
            csprojContents,
            output: {
                fileName: "_AllReferences.ts",
                ...settings,
            },
        });
        const fileContents = getFileContents();

        // Assert
        expect(fileContents.replace(/\r\n/g, "\n")).to.be.equal(expected.replace(/\r\n/g, "\n"));
    };

    describe("convert", () => {
        it("generates a blank file with no inputs", async () => {
            await assertInputsCreateFile(
                [],
                {},
                "");
        });

        it("generates a timestamped file with no inputs", async () => {
            await assertInputsCreateFile(
                [],
                {
                    includeTimestamp: true,
                },
                `// Generated ${stubTime}

`);
        });

        it("includes files without a timestamp", async () => {
            await assertInputsCreateFile(
                [
                    "first.ts",
                    "second.ts",
                ],
                {},
                `/// <reference path="./first.ts" />
/// <reference path="./second.ts" />
`);
        });

        it("includes files with a timestamp", async () => {
            await assertInputsCreateFile(
                [
                    "first.ts",
                    "second.ts",
                ],
                {
                    includeTimestamp: true,
                },
                `// Generated ${stubTime}

/// <reference path="./first.ts" />
/// <reference path="./second.ts" />
`);
        });
    });
});
