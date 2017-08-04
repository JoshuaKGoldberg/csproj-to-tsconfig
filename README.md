# csproj-to-tsconfig
[![Build Status](https://travis-ci.org/JoshuaKGoldberg/csproj-to-tsconfig.svg?branch=master)](https://travis-ci.org/JoshuaKGoldberg/csproj-to-tsconfig)
[![NPM version](https://badge.fury.io/js/csproj-to-tsconfig.svg)](http://badge.fury.io/js/csproj-to-tsconfig)


Converts .csproj files with TypeScript includes to their `tsconfig.json` equivalents.

It will read the `TypeScriptCompile` include strings from the source `.csproj` and put them into a destination `tsconfig.json` as `files`.

## Usage

`csproj-to-tsconfig` provides both a CLI and an importable `Converter` clas.

*Both require Node 7.6!*

### CLI

```cmd
npm install -g csproj-to-tsconfig
```

Converting `./framework.csproj` to `./tsconfig.json`:

*(this will override any existing `./tsconfig.json` while respecting its initial settings)*

```
csproj-to-tsconfig --csproj ./framework.csproj --target ./tsconfig.json
```

Converting `./framework.csproj` to `./tsconfig.json` using a `tsconfig.base.json` as a base for settings:

```
csproj-to-tsconfig --csproj ./framework.csproj --target ./tsconfig.json --template ../tsconfig.base.json
```

Converting `./framework.csproj` to `./tsconfig.json` and replacing `$(OutputDirectory)` with `../lib`:

```
csproj-to-tsconfig --csproj ./framework.csproj --target ./tsconfig.json --replacement $(OutputDirectory)=../lib
```

#### Options

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
            <th><code>replacements</code></th>
            <td><string>string[]</string></td>
            <td>MSBuild values to replace in raw source file paths, as <code>key=value</code> <em>(optional)</em>.</td>
        </tr>
        <tr>
            <th><code>target</code></th>
            <td><string>string</string></td>
            <td>File path to the target tsconfig.json file.</td>
        </tr>
        <tr>
            <th><code>template</code></th>
            <td><string>string</string></td>
            <td>File path to the template tsconfig.json file <em>(optional; by default, <code>target</code>)</em>.</td>
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
