import { decodeInt } from 'chia-bls';
import { ParserError } from '../types/ParserError';
import { Program } from '../types/Program';

export function deserialize(program: number[], cursor = 0): Program {
    const sizeBytes: Array<number> = [];
    if (program[cursor] <= 0x7f)
        return Program.fromBytes(Uint8Array.from([program[cursor]]));
    else if (program[cursor] <= 0xbf) sizeBytes.push(program[cursor] & 0x3f);
    else if (program[cursor] <= 0xdf) {
        sizeBytes.push(program[cursor] & 0x1f);
        // program.shift();
        cursor++;
        if (cursor >= program.length)
            throw new ParserError('Expected next byte in source.');
        sizeBytes.push(program[cursor]);
    } else if (program[cursor] <= 0xef) {
        sizeBytes.push(program[cursor] & 0x0f);
        for (let i = 0; i < 2; i++) {
            // program.shift();
            cursor++;
            if (cursor >= program.length)
                throw new ParserError('Expected next byte in source.');
            sizeBytes.push(program[cursor]);
        }
    } else if (program[cursor] <= 0xf7) {
        sizeBytes.push(program[cursor] & 0x07);
        for (let i = 0; i < 3; i++) {
            // program.shift();
            cursor++;
            if (cursor >= program.length)
                throw new ParserError('Expected next byte in source.');
            sizeBytes.push(program[cursor]);
        }
    } else if (program[cursor] <= 0xfb) {
        sizeBytes.push(program[cursor] & 0x03);
        for (let i = 0; i < 4; i++) {
            // program.shift();
            cursor++;
            if (cursor >= program.length)
                throw new ParserError('Expected next byte in source.');
            sizeBytes.push(program[cursor]);
        }
    } else if (program[cursor] === 0xff) {
        // program.shift();
        cursor++;
        if (cursor >= program.length)
            throw new ParserError('Expected next byte in source.');
        const first = deserialize(program, cursor);
        // program.shift();
        cursor++;
        if (cursor >= program.length)
            throw new ParserError('Expected next byte in source.');
        const rest = deserialize(program, cursor);
        return Program.cons(first, rest);
    } else throw new ParserError('Invalid encoding.');
    const size = decodeInt(Uint8Array.from(sizeBytes));
    let bytes: Array<number> = [];
    for (let i = 0; i < size; i++) {
        // program.shift();
        cursor++;
        if (!program.length) {
            throw new ParserError('Expected next byte in atom.');
        }
        bytes.push(program[cursor]);
    }
    return Program.fromBytes(Uint8Array.from(bytes));
}
