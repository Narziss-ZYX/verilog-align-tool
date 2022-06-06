import { Line } from './line';
import { Part, PartType } from './Part';
import { checkedRegex, tabAwareLength, trimEndButOne, trimButOne, trimStartButOne, extendToLength, trimEnd } from './string-utils';
import * as vscode from 'vscode';

interface RegexWithGroup {
    groupx: number;
    regex: string;
}

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

function getRegexGroup(value: RegexWithGroup): string {
    let groupString: string = '';
    switch (value.groupx) {
        case 1:
            groupString = RegExp.$1;
            break;
        case 2:
            groupString = RegExp.$2;
            break;
        case 3:
            groupString = RegExp.$3;
            break;
        case 4:
            groupString = RegExp.$4;
            break;
        case 5:
            groupString = RegExp.$5;
            break;
        case 6:
            groupString = RegExp.$6;
            break;
        case 7:
            groupString = RegExp.$7;
            break;
        case 8:
            groupString = RegExp.$8;
            break;
        case 9:
            groupString = RegExp.$9;
            break;
        default:
            break;
    }
    return groupString;
}



export class Block {

    lines: Line[] = [];

    constructor(text: string, startLine: number, eol: vscode.EndOfLine) {
        let splitString: string;
        if (eol === vscode.EndOfLine.CRLF) {
            splitString = '\r\n';
        } else {
            splitString = '\n';
        }
        let textLines = text.split(splitString);

        let lineArray: Line[] = Array(textLines.length);
        let RegexStringArrayTotal = [RegexDefine, RegexInstant];
        for (let i = 0; i < textLines.length; i++) {
            let lineText = textLines[i] + '\n';
            let textStartPosition = 0;
            lineArray[i] = { number: startLine + i, parts: [] as Part[] };
            for(let RegexStringArray of RegexStringArrayTotal){
                for (let idx = 0; idx < RegexStringArray.length; idx++) {
                    let regex = checkedRegex(RegexStringArray[idx].regex);
                    if (regex !== undefined) {
                        let result = regex.exec(lineText);
                        if (result !== null) {
                            let matchedSep = result[RegexStringArray[idx].groupx];
                            // result.forEach((match, groupIndex) => {
                            // });
                            if (matchedSep !== '') {
                                if (matchedSep === ',' || matchedSep === ';') {
                                    regex.lastIndex = lineText.indexOf(matchedSep) + matchedSep.length;
                                }
                                let regexStartPosition = regex.lastIndex - matchedSep.length;
                                lineArray[i].parts.push({ type: PartType.Text, value: textLines[i].substring(textStartPosition, regexStartPosition) });
                                lineArray[i].parts.push({ type: PartType.Regex, value: matchedSep });
                                textStartPosition = regex.lastIndex;
                            } else {
                                lineArray[i].parts.push({ type: PartType.Text, value: '' });
                                lineArray[i].parts.push({ type: PartType.Regex, value: '' });
                            }
                        }
                        else {
                            if (idx === 0){  //第一个表达式不符合，检测下一个Regex集合
                                break;
                            }
                            lineArray[i].parts.push({ type: PartType.Text, value: '' });
                            lineArray[i].parts.push({ type: PartType.Regex, value: '' });
                        }
                    }
                }
                
            }
            lineArray[i].parts.push({ type: PartType.Text, value: textLines[i].substring(textStartPosition, textLines[i].length) }); 
        }

        // let RegexStringArray : RegexWithGroup[] = RegexInstant;
        // for (let i = 0; i < textLines.length; i++) {
        //     let lineText = textLines[i] + '\n';
        //     let textStartPosition = 0;
        //     lineArray[i] = { number: startLine + i, parts: [] as Part[] };
        //     for (let idx = 0; idx < RegexStringArray.length; idx++) {
        //         let regex = checkedRegex(RegexStringArray[idx].regex);
        //         if (regex !== undefined) {
        //             let result = regex.exec(lineText);
        //             if (result !== null) {
        //                 let matchedSep = result[RegexStringArray[idx].groupx];
        //                 // result.forEach((match, groupIndex) => {
        //                 // });
        //                 if (matchedSep !== '') {
        //                     if (matchedSep === ',' || matchedSep === ';') {
        //                         regex.lastIndex = lineText.indexOf(matchedSep) + matchedSep.length;
        //                     }
        //                     let regexStartPosition = regex.lastIndex - matchedSep.length;
        //                     lineArray[i].parts.push({ type: PartType.Text, value: lineText.substring(textStartPosition, regexStartPosition) });
        //                     lineArray[i].parts.push({ type: PartType.Regex, value: matchedSep });
        //                     textStartPosition = regex.lastIndex;
        //                 } else {
        //                     lineArray[i].parts.push({ type: PartType.Text, value: '' });
        //                     lineArray[i].parts.push({ type: PartType.Regex, value: '' });
        //                 }
        //             }
        //             else {
        //                 if (idx === 0){  //第一个表达式不符合
        //                     break;
        //                 }
        //                 lineArray[i].parts.push({ type: PartType.Text, value: '' });
        //                 lineArray[i].parts.push({ type: PartType.Regex, value: '' });
        //             }
        //         }
        //     }

        //     lineArray[i].parts.push({ type: PartType.Text, value: lineText.substring(textStartPosition, lineText.length) });
        // }

        for (let i = 0; i < lineArray.length; i++) {
            this.lines.push(lineArray[i]);
        }
    }

    trim(): Block {
        for (let line of this.lines) {
            for (let i = 0; i < line.parts.length; i++) {
                let part = line.parts[i];
                if (i === 0) {
                    part.value = trimEndButOne(part.value);
                } else if (i < line.parts.length - 1) {
                    part.value = trimButOne(part.value);
                } else {
                    let intermediate = trimStartButOne(part.value);
                    part.value = trimEnd(intermediate);
                }
            }
        }
        return this;
    }

    align(): Block {
        /* get editor tab size */
        let tabSize: number | undefined = vscode.workspace.getConfiguration('editor', null).get('tabSize');

        /* check that we actually got a valid tab size and that it isn't set to a value < 1. */
        if (tabSize === undefined || tabSize < 1) {
            /* give helpful error message on console */
            console.log('Error [Align by Regex]: Invalid tab size setting "editor.tabSize" for alignment.');

            /* assume tab size == 1 if tab size is missing */
            tabSize = 1;
        }

        /* get maximum number of parts */
        let maxNrParts: number = 1;
        for (let idx = 0; idx < this.lines.length; ++idx) {
            let len = this.lines[idx].parts.length;
            if (len > maxNrParts) {
                maxNrParts = len;
            }
        }

        /* create array with the right size and initialize array with 0 */
        let maxLength: number[] = Array(maxNrParts).fill(0);
        for (let line of this.lines) {
            // no match, only one part => ignore line in max length calculation
            if (line.parts.length > 1) {
                for (let i = 0; i < line.parts.length; i++) {
                    maxLength[i] = Math.max(maxLength[i], tabAwareLength(line.parts[i].value, tabSize));
                }
            }
        }
        for (let line of this.lines) {
            for (let i = 0; i < line.parts.length - 1; i++) {
                line.parts[i].value = extendToLength(line.parts[i].value, maxLength[i], tabSize);
            }
        }
        return this;
    }
}