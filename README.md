# verilog-align-tool README

With this extension multiple lines of text can be aligned by regular expression groups.

## Features

- Align multiple lines of text by regular expressions.

## Examples

- 选中需要对齐的代码块，快捷键【Shift+Alt+A】对齐
- gif图片说明（待补充）

## Requirements

```typescript
"devDependencies": {
    "@types/vscode": "^1.67.0",
    "@types/glob": "^7.2.0",
    "@types/mocha": "^9.1.1",
    "@types/node": "14.x",
    "@typescript-eslint/eslint-plugin": "^5.21.0",
    "@typescript-eslint/parser": "^5.21.0",
    "eslint": "^8.14.0",
    "glob": "^8.0.1",
    "mocha": "^9.2.2",
    "typescript": "^4.6.4",
    "@vscode/test-electron": "^2.1.3"
  },
```



## Extension Settings

- 固定正则表达式组合保存在./src/block.ts，目前只匹配RegexDefine（定义）和RegexInstant（例化），可添加或修改

```typescript
const RegexDefine: RegexWithGroup[] = [
    {
        regex: "^\\s*(input|output|inout|wire|reg)",
        groupx: 1
    },
    {   //output reg
        regex: "^\\s*(input|output|inout|wire|reg)\\s+(reg|wire)",
        groupx: 2
    },
    {   //[
        regex: "^\\s*(input|output|inout|wire|reg)\\s+(reg|wire)*\\s*(\\[)",
        groupx: 3
    },
    {   //:
        regex: "^\\s*(input|output|inout|wire|reg)\\s+(reg|wire)*\\s*(\\[)\\s*\\d+\\s*(:)",
        groupx: 4
    },
    {   //]
        regex: "^\\s*(input|output|inout|wire|reg)\\s+(reg|wire)*\\s*(\\[)*\\s*\\d+\\s*(:)\\s*\\d+\\s*(\\])",
        groupx: 5
    },
    {   //信号名称
        regex: "^\\s*(input|output|inout|wire|reg)\\s+(reg|wire)*\\s*(\\[\\s*\\d+\\s*:\\s*\\d+\\s*\\])*\\s*(\\w+)",
        groupx: 4
    },
    {   //,或;
        regex: "\\w+\\s*([,;])\\s*(\\n|\\/\\/)",
        groupx: 1
    },
    {   //注释
        regex: "[,;\\w][^/]*(\\/\\/)",
        groupx: 1
    },
];

const RegexInstant : RegexWithGroup[] = [
    {   //.
        regex : "^\\s*(\\.)",
        groupx : 1
    },
    {   //(
        regex : "^\\s*(\\.)[^\\(]*(\\()",
        groupx : 2
    },
    {   //)
        regex : "^\\s*(\\.)[^\\)]*(\\))",
        groupx : 2
    },
    {   //,
        regex : "\\)[^,]*(,)",
        groupx : 1
    },
    {   //注释
        regex : "[,;\\w][^/]*(\\/\\/)",
        groupx: 1
    },
];
```

## Release Notes

### 1.0.0

Initial release of verilog-align-tool
