import { Soundfont, Reverb, SplendidGrandPiano } from "smplr"
import './../styles/piano.css'
import { useEffect, useRef, useState } from "react";
import { getKeyConfigs, formatNotation } from "./tools/UtilFuncs";

const {NOTES, keyboardToMidi, midiToKeyboard, midiToNote} = getKeyConfigs();

const audioCtx = new AudioContext();

const DECAY_TIME = 0.5;

export default function Piano({ attrs, pianoRecRef, isRecording, addNoteToSheet, removePrevNote }) {
    const [pianoIsReady, setPianoIsReady] = useState(false);

    const pianoRef = useRef(null);

    const [hasError, setError] = useState(false);

    useEffect(() => {
        const ins = attrs.instrument;

        const piano = (ins === 'splendid_grand_piano')
            ? new SplendidGrandPiano(audioCtx)
            : new Soundfont(audioCtx, { instrument: ins });
        setPianoIsReady(false);

        let reverbNum = 0.1;
        if (ins.indexOf("piano") != -1) {
            reverbNum = 0.6;
        }
        console.log('build', ins, reverbNum);

        piano.load
            .then(() => {
                setError(false);
                setPianoIsReady(true);
                piano.output.addEffect("reverb", new Reverb(audioCtx), reverbNum);
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
        const midi = keyboardToMidi[key];
        if (midi || midi === 0) {
            const note = midi + noteLowest;
            if (!pianoIsReady || isKeyDown[note])
                return;

            audioCtx.resume();
            pianoRef.current.start({ note: note, velocity: 100, decayTime: DECAY_TIME });
            if (isRecording) {
                pianoRecRef.current.start({ note: note, velocity: 100, decayTime: DECAY_TIME });
            }

            setKeyDown(prev => ({
                ...prev,
                [note]: true
            }));

            const newNote = formatNotation(midiToNote[midi]);
            addNoteToSheet(newNote[0], newNote[1], midi < 24, e.key);
        } else if (key === 'BACKSPACE') {
            removePrevNote();
        }
    }

    function handleKeyup(e) {
        const key = e.key.toUpperCase();
        if (keyboardToMidi[key] || keyboardToMidi[key] === 0) {
            const note = keyboardToMidi[key] + noteLowest;
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
    }, [isKeyDown, isRecording, pianoIsReady, noteLowest, removePrevNote]);

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
                                displayLabel = midiToKeyboard[midi - noteLowest] ? midiToKeyboard[midi - noteLowest] : '';
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