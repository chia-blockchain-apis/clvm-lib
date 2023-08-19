import { decodeInt } from 'chia-bls';
import { ParserError } from '../types/ParserError';
import { Program } from '../types/Program';

let cursor2 = 0;

export function deserialize(program: number[], cursor = 0): Program {
    cursor2 = cursor;
    const sizeBytes: Array<number> = [];
    if (program[cursor2] <= 0x7f)
        return Program.fromBytes(Uint8Array.from([program[cursor2]]));
    else if (program[cursor2] <= 0xbf) sizeBytes.push(program[cursor2] & 0x3f);
    else if (program[cursor2] <= 0xdf) {
        sizeBytes.push(program[cursor2] & 0x1f);
        // program.shift();
        cursor2++;
        if (cursor2 >= program.length)
            throw new ParserError('Expected next byte in source.');
        sizeBytes.push(program[cursor2]);
    } else if (program[cursor2] <= 0xef) {
        sizeBytes.push(program[cursor2] & 0x0f);
        for (let i = 0; i < 2; i++) {
            // program.shift();
            cursor2++;
            if (cursor2 >= program.length)
                throw new ParserError('Expected next byte in source.');
            sizeBytes.push(program[cursor2]);
        }
    } else if (program[cursor2] <= 0xf7) {
        sizeBytes.push(program[cursor2] & 0x07);
        for (let i = 0; i < 3; i++) {
            // program.shift();
            cursor2++;
            if (cursor2 >= program.length)
                throw new ParserError('Expected next byte in source.');
            sizeBytes.push(program[cursor2]);
        }
    } else if (program[cursor2] <= 0xfb) {
        sizeBytes.push(program[cursor2] & 0x03);
        for (let i = 0; i < 4; i++) {
            // program.shift();
            cursor2++;
            if (cursor2 >= program.length)
                throw new ParserError('Expected next byte in source.');
            sizeBytes.push(program[cursor2]);
        }
    } else if (program[cursor2] === 0xff) {
        // program.shift();
        cursor2++;
        if (cursor2 >= program.length)
            throw new ParserError('Expected next byte in source.');
        const first = deserialize(program, cursor2);
        // program.shift();
        cursor2++;
        if (cursor2 >= program.length)
            throw new ParserError('Expected next byte in source.');
        const rest = deserialize(program, cursor2);
        return Program.cons(first, rest);
    } else throw new ParserError('Invalid encoding.');
    const size = decodeInt(Uint8Array.from(sizeBytes));
    let bytes: Array<number> = [];
    for (let i = 0; i < size; i++) {
        // program.shift();
        cursor2++;
        if (!program.length) {
            throw new ParserError('Expected next byte in atom.');
        }
        bytes.push(program[cursor2]);
    }
    return Program.fromBytes(Uint8Array.from(bytes));
}
