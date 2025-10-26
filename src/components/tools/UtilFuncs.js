export function formatDuration(dur) {
    let str = '', d = Math.round(dur);
    if (d >= 60 * 60) {
        str += (Math.floor(d / 3600) + ':');
        d = d % 60;
    }
    if (d >= 60) {
        if (Math.floor(d / 60) < 10)
            str += '0';
        str += (Math.floor(d / 60) + ':');
        d = d % 60;
    }
    if (Math.floor(d) < 10)
        str += '0';
    str += (Math.floor(d).toString());

    if (str.length < 3) {
        str = '00:' + str;
    }

    return str;
}

export function getKeyConfigs() {
    const NOTES = [];

    const midRangeLetters = ['Q', '2', 'W', '3', 'E', '4', 'R', 'T', '6', 'Y', '7', 'U', 'I', '9', 'O', '0', 'P',
        'A', 'Z', 'X', 'D', 'C', 'F', 'V', 'B', 'H', 'N', 'J', 'M', 'K', ',', '.'
    ];
    const midRangeNotes = [17, 17 + midRangeLetters.length - 1];
    const keyboardToMidi = {};
    const midiToKeyboard = {};
    const midiToNote = {};

    const noteRangeLen = 60;

    let letterInd = 2;
    for (let midiNum = 0; midiNum < noteRangeLen; midiNum++) {
        const letter = String.fromCharCode(letterInd + "A".charCodeAt(0));
        const num = 2 + Math.floor(midiNum / 12);
        NOTES.push({ type: 'white', midi: midiNum, letter: letter, num: num });

        const midiNote = letter + num;

        if (midiNum >= midRangeNotes[0] && midiNum <= midRangeNotes[1]) {
            keyboardToMidi[midRangeLetters[midiNum - midRangeNotes[0]]] = midiNum;
            midiToKeyboard[midiNum] = midRangeLetters[midiNum - midRangeNotes[0]];
            midiToNote[midiNum] = midiNote;
        }

        if (letter !== 'B' && letter !== 'E' && midiNum < 96) {
            NOTES.push({ type: 'black', midi: midiNum + 1, letter: letter, num: num });
            midiToNote[midiNum + 1] = midiNote + '#';
            midiNum++;

            if (midiNum >= midRangeNotes[0] && midiNum <= midRangeNotes[1]) {
                keyboardToMidi[midRangeLetters[midiNum - midRangeNotes[0]]] = midiNum;
                midiToKeyboard[midiNum] = midRangeLetters[midiNum - midRangeNotes[0]];
            }
        }
        letterInd = (letterInd + 1) % 7;
    }

    // console.log('midiToNote', midiToNote)

    return {
        NOTES: NOTES,
        keyboardToMidi: keyboardToMidi,
        midiToKeyboard: midiToKeyboard,
        midiToNote: midiToNote
    };
}

export function formatNotation(note) {
    if (note.length > 2) {
        return [`${note[0].toLowerCase()}${note[2]}/${note[1]}`, note[2]];
    }
    return [`${note[0].toLowerCase()}/${note[1]}`, null];
}