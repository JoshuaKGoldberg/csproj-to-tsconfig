import { expect } from "chai";
import "mocha";

import { parseTsconfigTemplate } from "../../../lib/conversions/templateParser";

describe("parseTsconfigTemplate", () => {
    it("retrieves a template from contents", async () => {
        // Arrange
        const contents = `{
            "compilerOptions": {
                "declaration": false,
                "lib": ["dom", "es5", "es2015.collection", "es2015.iterable", "es2015.promise"]
            },
            "files": [
                "file.ts",
                "directory/nested.ts"
            ]
        }`;

        // Act
        const template = parseTsconfigTemplate(contents);

        // Assert
        expect(template).to.be.deep.equal({
            compilerOptions: {
                declaration: false,
                lib: [
                    "dom",
                    "es5",
                    "es2015.collection",
                    "es2015.iterable",
                    "es2015.promise",
                ],
            },
            files: [
                "file.ts",
                "directory/nested.ts",
            ],
        });
    });
});
