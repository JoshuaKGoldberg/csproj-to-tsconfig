# csproj-to-tsconfig
[![Build Status](https://travis-ci.org/JoshuaKGoldberg/csproj-to-tsconfig.svg?branch=master)](https://travis-ci.org/JoshuaKGoldberg/csproj-to-tsconfig)
[![NPM version](https://badge.fury.io/js/csproj-to-tsconfig.svg)](http://badge.fury.io/js/csproj-to-tsconfig)


Converts .csproj files with TypeScript includes to their `tsconfig.json` equivalents.

It will read the `TypeScriptCompile` include strings from the source `.csproj` and put them into a destination `tsconfig.json` as `files`.

## Usage

`csproj-to-tsconfig` provides a CLI and an importable `Converter` clas.

*Both require Node >=7.6!*

### CLI

```cmd
npm install -g csproj-to-tsconfig
```

At a minimum, the CLI requires:
* A file path to a `.csproj` file path to read `TypeScriptCompile` directives from
* A file path to where to output the generated `tsconfig.json`-like file

Converting `./framework.csproj` to `./tsconfig.json`:

*(this will override any existing `./tsconfig.json` while respecting its initial settings)*

```
csproj-to-tsconfig --csproj ./framework.csproj --target ./tsconfig.json
```

You can also specify file path to a separate `tsconfig.json`-like file to serve as a template for the generated output file.

Converting `./framework.csproj` to `./tsconfig.json` using a `tsconfig.base.json` as a base for settings:

```
csproj-to-tsconfig --csproj ./framework.csproj --target ./tsconfig.json --template ../tsconfig.base.json
```

Add `--timestamp` to add a timestamp comment at the top of generated files.

```
csproj-to-tsconfig --csproj ./framework.csproj --target ./tsconfig.json --timestamp
```

Since many MSBuild files use `@(Items)` and `$(Properties)` to dynamically generate paths, you can provide a set of key-value pairs to replace them.
* `@(ItemKey)=value` works on ItemGroup values
* `$(PropertyKey)=value` works on PropertyGroup values
* `GeneralKey=value` will be applied to all files after MSBuild pre-processing

Converting `./framework.csproj` to `./tsconfig.json` and replacing `$(OutputDirectory)` with `../lib`:

```
csproj-to-tsconfig --csproj ./framework.csproj --target ./tsconfig.json --replacement $(OutputDirectory)=../lib
```

Lastly, to support projects that use a large file consisting of `///` references to enable direct-to-source Intellisense across projects (instead of `.d.ts` files), you may provide a `--references` file path to a file that will contain a plain list of `///` references to the source files.
It will respect the same replacements as tsconfig generation logic.

You may provide one or both of `--references` and `--target`, but not both.

```
csproj-to-tsconfig --csproj ./framework.csproj --references ./_AllReferences.ts
```

#### All Options

<table>
    <thead>
        <tr>
            <td>Option</td>
            <td>Type</td>
            <td>Description</td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th><code>csproj</code></th>
            <td><string>string</string></td>
            <td>File path to the source .csproj file.</td>
        </tr>
        <tr>
            <th><code>references</code></th>
            <td><string>string</string></td>
            <td>MSBuild values to replace in raw source file paths, as <code>key=value</code> <em>(optional)</em>.</td>
        </tr>
        <tr>
            <th><code>replacements</code></th>
            <td><string>string[]</string></td>
            <td>File path to the target references file <em>(optional if <code>target</code> is provided)</em>.</td>
        </tr>
        <tr>
            <th><code>target</code></th>
            <td><string>string</string></td>
            <td>File path to the target tsconfig.json file <em>(optional if <code>references</code> is provided)</em>.</td>
        </tr>
        <tr>
            <th><code>template</code></th>
            <td><string>string</string></td>
            <td>File path to the template tsconfig.json file <em>(optional; by default, <code>target</code>)</em>.</td>
        </tr>
        <tr>
            <th><code>timestamp</code></th>
            <td><string>boolean</string></td>
            <td>Whether to add a timestamp comment at the top of generated files <em>(optional; by default, <code>false</code>)</em>.</td>
        </tr>
    </tbody>
</table>

### `Converter`

`npm install --save csproj-to-tsconfig`

```javascript
import { Converter } from "csproj-to-tsconfig";

// ...

const converter = new Converter();

await converter.convert({
    csproj: "path/to/csproj",
    target: "path/to/target/tsconfig.json",
    template: "path/to/base/tsconfig.json"
})
```

Unlike the key-value pairs in the CLI, replacement functions just take in values of their types, and output the transformed result.
A `generateKeyValueReplacements` function is provided that can create a set of replacers for CLI-like inputs.

```javascript
generateKeyValueReplacements([
    "foo=bar",
    "@(baz)=qux",
    "$(quux)=corge"
])
```



## Development

Set the project up locally to be run via Gulp:

```cmd
npm install -g gulp
npm install
gulp
```
