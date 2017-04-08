import * as yargs from "yargs";

import { IConversionSettings } from "./converter";
import { StatusCode } from "./statusCode";
import { Runner } from "./runner";

const argv: IConversionSettings = yargs
    .usage(`Usage: $0 --csproj <csproj> --target <target>`)
    .command("csproj", "File path to the source .csproj file.")
    .command("target", "File path to the target tsconfig.json file.")
    .command("template", "File path to the template tsconfig.json file, if not <target>.")
    .demandOption(["csproj", "target"])
    .argv;

(async (): Promise<void> => {
    const runner = new Runner({
        onError: console.error.bind(console),
        onLog: console.log.bind(console)
    });

    try {
        process.exitCode = await runner.run(argv);
    } catch (error) {
        console.error(error.stack || error.message);
        process.exitCode = StatusCode.UnknownError;
    }
})();
