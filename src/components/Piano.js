import { Soundfont, Reverb, SplendidGrandPiano } from "smplr"
import './../styles/piano.css'
import { useEffect, useRef, useState } from "react";

const NOTES = [];

const midRangeLetters = ['Q', '2', 'W', '3', 'E', '4', 'R', 'T', '6', 'Y', '7', 'U', 'I', '9', 'O', '0', 'P',
    'A', 'Z', 'X', 'D', 'C', 'F', 'V', 'B', 'H', 'N', 'J', 'M', 'K', ',', '.'
];
const midRangeNotes = [17, 17 + midRangeLetters.length - 1];
const letterToNote = {};
const noteToLetter = {};

const noteRangeLen = 60;

let letterInd = 2;
for (let midi = 0; midi < noteRangeLen; midi++) {
    const letter = String.fromCharCode(letterInd + "A".charCodeAt(0));
    const num = 2 + Math.floor((midi - 36) / 12);
    NOTES.push({ type: 'white', midi: midi, letter: letter, num: num });
    
    if (midi >= midRangeNotes[0] && midi <= midRangeNotes[1]) {
        letterToNote[midRangeLetters[midi - midRangeNotes[0]]] = midi;
        noteToLetter[midi] = midRangeLetters[midi - midRangeNotes[0]];
    }
    
    if (letter !== 'B' && letter !== 'E' && midi < 96) {
        NOTES.push({ type: 'black', midi: midi + 1, letter: letter, num: num });
        midi++;
    
        if (midi >= midRangeNotes[0] && midi <= midRangeNotes[1]) {
            letterToNote[midRangeLetters[midi - midRangeNotes[0]]] = midi;
            noteToLetter[midi] = midRangeLetters[midi - midRangeNotes[0]];
        }
    }
    letterInd = (letterInd + 1) % 7;
}

const audioCtx = new AudioContext();

const DECAY_TIME = 0.3;

export default function Piano({ attrs, pianoRecRef, isRecording, setRecNotes }) {
    const [pianoIsReady, setPianoIsReady] = useState(false);

    const pianoRef = useRef(null);

    const [hasError, setError] = useState(false);

    useEffect(() => {
        console.log('build', attrs.instrument);

        const piano = (attrs.instrument === 'splendid_grand_piano')
            ? new SplendidGrandPiano(audioCtx)
            : new Soundfont(audioCtx, { instrument: attrs.instrument });
        setPianoIsReady(false);

        piano.load
            .then(() => {
                setError(false);
                setPianoIsReady(true);
                piano.output.addEffect("reverb", new Reverb(audioCtx), 0.4);
            })
            .catch(error => {
                console.error('Error', error);
                setError(true);
            });
        pianoRef.current = piano;
    }, [attrs.instrument]);

    const [isKeyDown, setKeyDown] = useState({});
    const [noteLowest, setNoteLowest] = useState(36);

    function handleKeydown(e) {
        if (document.body.classList.contains('editing'))
            return;

        const key = e.key.toUpperCase();
        if (letterToNote[key] || letterToNote[key] === 0) {
            const note = letterToNote[key] + noteLowest;
            if (!pianoIsReady || isKeyDown[note])
                return;

            setRecNotes(prev => prev + key);

            audioCtx.resume();
            pianoRef.current.start({ note: note, velocity: 100, decayTime: DECAY_TIME });
            if (isRecording) {
                pianoRecRef.current.start({ note: note, velocity: 100, decayTime: DECAY_TIME });
            }

            setKeyDown(prev => ({
                ...prev,
                [note]: true
            }));
        } else if (key === 'BACKSPACE') {
            setRecNotes(prev => prev.slice(0, prev.length - 1));
        }
    }

    function handleKeyup(e) {
        const key = e.key.toUpperCase();
        if (letterToNote[key] || letterToNote[key] === 0) {
            const note = letterToNote[key] + noteLowest;
            pianoRef.current.stop(note);
            if (isRecording) {
                pianoRecRef.current.stop(note);
            }

            setKeyDown(prev => ({
                ...prev,
                [note]: false
            }));
        } else if (key === 'ARROWDOWN') {
            setNoteLowest(prev => Math.max(12, prev - 12));
        } else if (key === 'ARROWUP') {
            setNoteLowest(prev => Math.min(60, prev + 12));
        }
    }

    useEffect(() => {
        window.addEventListener("keydown", handleKeydown);

        return () => {
            window.removeEventListener("keydown", handleKeydown);
        }
    }, [isKeyDown, isRecording, pianoIsReady, noteLowest]);

    useEffect(() => {
        window.addEventListener("keyup", handleKeyup);

        return () => {
            window.removeEventListener("keyup", handleKeyup);
        }
    }, [isRecording, noteLowest]);
    
    return (
        <>
            <div className="piano-inner">
                <div className="piano">
                    {NOTES.map(({type, midi, letter, num}) => {
                        midi += noteLowest;
                        const note = letter + num;
                        const typeClass = "piano__key--" + type;
                        const isPressedClass = isKeyDown[midi] ? "piano__key--pressed" : '';

                        let displayLabel;
                        switch (attrs.displayMode) {
                            case 'note':
                                displayLabel = letter + (type === 'black' ? '\u{266f}' : '');
                                break;
                            case 'key':
                                displayLabel = noteToLetter[midi - noteLowest] ? noteToLetter[midi - noteLowest] : '';
                                break;
                        }

                        return (
                            <div
                                className={"piano__key-wrapper " + type}
                                key={note + '_' + type}
                                onMouseDown={() => {
                                    if (!pianoIsReady)
                                        return;

                                    audioCtx.resume();
                                    pianoRef.current.start({ note: midi, decayTime: DECAY_TIME });
                                    if (isRecording) {
                                        pianoRecRef.current.start({ note: midi, decayTime: DECAY_TIME });
                                    }
                                }}
                                onMouseUp={() => {
                                    pianoRef.current.stop(midi);
                                    if (isRecording) {
                                        pianoRecRef.current.stop(midi);
                                    }
                                }}
                            >
                            <div
                                className={`piano__key ${typeClass} ${isPressedClass}`}
                            >
                                <div className="key__note">
                                    <span>{displayLabel}</span>
                                </div>
                                {type === 'white' && <div className="key__shadow" />}
                            </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {!pianoIsReady && <div className="piano__loading">
                {hasError
                ? <div className="loading__error">
                    Error: Problem loading instrument <br/> Please refresh or choose another instrument
                </div>
                : <>
                    <div className="loading__title">Loading...</div>
                    <div className="loading__dots">
                        <div className="loading__dot" />
                        <div className="loading__dot" />
                        <div className="loading__dot" />
                    </div>
                </>}
            </div>}
        </>
    )
}