import * as yargs from "yargs";

import { Runner } from "./runner";
import { IRawConversionSettings, parseSettings } from "./settingsParser";
import { StatusCode } from "./statusCode";

const rawConversionSettings: IRawConversionSettings = yargs
    .usage("Usage: $0 --csproj <csproj> --target <target>")
    .command("csproj", "File path to the source .csproj file.")
    .command("reference", "References file to insert /// paths to all files (optional).")
    .command("replacement", "key=value MSBuild pairs to replace in raw source file paths.")
    .command("target", "File path to the target tsconfig.json file.")
    .command("template", "File path to the template tsconfig.json file, if not <target>.")
    .demandOption(["csproj"])
    .argv as {} as IRawConversionSettings;

const main = async (): Promise<number> => {
    const conversionSettings = parseSettings(rawConversionSettings);
    const runner = new Runner({
        onError: console.error.bind(console),
        onLog: console.log.bind(console),
    });

    return await runner.run(conversionSettings);
};

main()
    .then((exitCode: StatusCode) => {
        process.exitCode = exitCode;
    })
    .catch((error) => {
        // tslint:disable-next-line:no-console
        console.error(error.stack || error.message);
        process.exitCode = StatusCode.UnknownError;
    });
