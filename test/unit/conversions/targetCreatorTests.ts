import { expect } from "chai";
import "mocha";

import { createTargetTsconfig } from "../../../lib/conversions/targetCreator";

describe("createTargetTsconfig", () => {
    const stubTemplateStructure = {
        compilerOptions: {
            declaration: false,
            lib: ["dom", "es5", "es2015.collection", "es2015.iterable", "es2015.promise"],
        },
    };

    it("merges files into a template structure", async () => {
        // Arrange
        const sourceFiles = [
            "file.ts",
            "directory/nested.ts",
        ];

        // Act
        const target = createTargetTsconfig(stubTemplateStructure, sourceFiles);

        // Assert
        expect(target).to.be.equal(`{
    "compilerOptions": {
        "declaration": false,
        "lib": [
            "dom",
            "es5",
            "es2015.collection",
            "es2015.iterable",
            "es2015.promise"
        ]
    },
    "files": [
        "file.ts",
        "directory/nested.ts"
    ]
}`);
    });
});
