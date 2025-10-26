import { Soundfont, SplendidGrandPiano, Reverb } from "smplr"
import { useRef, useState } from "react";
import AudioWrapper from "./AudioWrapper";
import { formatDuration } from "./UtilFuncs";
import { db } from "../database";
import { useLiveQuery } from "dexie-react-hooks";

const audioCtx = new AudioContext();

export default function Recorder({ isOn, pianoRecRef, isRecording, setRecording, instrument }) {
    const pianoIsReady = useRef(false);

    const recorder = useRef(null);      // media recorder
    const chunks = useRef([]);

    const audioDb = useLiveQuery(() => {
        return db.recordings.toArray();
    });

    const inCountDown = useRef(false);
    const [countdown, setCountdown] = useState(0);
    const countdownInter = useRef(null);

    const recordTimer = useRef(null);
    const [recordTime, setRecordTime] = useState(0);

    function startRecording() {
        document.body.classList.remove('piano-freeze');
        recorder.current.start();
        setRecording(true);
        setCountdown(0);
        inCountDown.current = false;

        setRecordTime(0);
        recordTimer.current = setInterval(() => {
            setRecordTime(prev => prev + 1);
        }, 1000);
    }

    function handleRecording() {
        if (!isOn)
            return;

        if (countdown > 0) {
            clearInterval(countdownInter.current);
            countdownInter.current = null;
            setCountdown(0);
            inCountDown.current = false;

            pianoIsReady.current = false;
            document.body.classList.remove('piano-freeze');
            setRecording(false);
            
            return;
        }

        if (!isRecording) {
            if (chunks.current.length > 0) {
                chunks.current = [];
            }

            if (inCountDown.current) {
                return;
            }

            inCountDown.current = true;

            const dest = audioCtx.createMediaStreamDestination();

            let hasStarted = true;

            const piano = (instrument === 'splendid_grand_piano')
            ? new SplendidGrandPiano(audioCtx, {destination: dest})
            : new Soundfont(audioCtx, { instrument: instrument, destination: dest });
            pianoIsReady.current = false;
            piano.load.then(() => {
                if (!countdownInter.current)
                    return;

                pianoIsReady.current = true;
                piano.output.addEffect("reverb", new Reverb(audioCtx), 0.3);
                if (!hasStarted) {
                    startRecording();
                }
            });
            pianoRecRef.current = piano;

            let i = 0;
            setCountdown(3);
            document.body.classList.add('piano-freeze');

            countdownInter.current = setInterval(() => {
                setCountdown(prev => prev - 1);
                i++;
                if (i >= 3) {
                    clearInterval(countdownInter.current);
                    if (pianoIsReady.current) {
                        startRecording();
                    } else {
                        hasStarted = false;
                    }
                    return;
                }
            }, 1000);

            recorder.current = new MediaRecorder(dest.stream);

            recorder.current.addEventListener('dataavailable', (e) => {
                chunks.current.push(e.data);
            });

            recorder.current.addEventListener('stop', (e) => {
                const blob = new Blob(chunks.current, { type: "audio/ogg; codecs=opus" });
                const src = URL.createObjectURL(blob);

                const tempAudio = new Audio();
                tempAudio.src = src;

                tempAudio.addEventListener('canplaythrough', () => {
                    const id = audioDb.length + 1;

                    db.recordings.put({
                        order: -1 * id,
                        title: 'Recording ' + id,
                        duration: tempAudio.duration,
                        blob: blob
                    }, -1 * id);

                    setAudioID(-1 * id);
                });
            });
        } else {
            recorder.current.stop();
            
            setRecording(false);
            setListOpen(true);
            setAudioID(0);
            clearInterval(recordTimer.current);
            recordTimer.current = null;
        }
    }

    const [isListOpen, setListOpen] = useState(false);

    const [curAudioID, setAudioID] = useState(-1);

    function deleteAudio(id) {
        db.recordings.delete(id);
        console.log(curAudioID, "New audio ID", curAudioID < -1 ? curAudioID + 1 : 0);
        setAudioID(curAudioID < -1 ? curAudioID + 1 : 0);
    }

    const listRef = useRef(null);

    return (
        <>
            <div
                className="tool__static-btn"
                onClick={handleRecording}
            >
                <div className={"tool__icon icon--recorder" + (isRecording ? ' recording' : (countdown === 0 ? ' idle' : ' countdown'))}>
                    <span>{countdown === 0 ? '' : countdown}</span>
                </div>
                <div className="tool__label">
                    {isOn ? (isRecording ? ('Stop / ' + formatDuration(recordTime))
                                        : (countdown === 0 ? 'Start' : 'Cancel'))
                        : 'Record'}
                </div>
            </div>
            <div className={"tool__extend" + (isOn ? ' on' : ' off') + (isListOpen ? '' : ' folded')}>
                <div
                    className="tool__label"
                    onClick={() => { setListOpen(!isListOpen) }}
                >
                    My recordings
                </div>
                <div className={"list-wrapper audio-list-wrapper" + (isListOpen ? ' on' : ' off')}>
                    <div className="list__heading">
                        <button
                            className="btn--icon extend__back"
                            onClick={() => {
                                setListOpen(false);
                            }}
                        />
                        <h1>My recordings</h1>
                    </div>
                    {audioDb && <div ref={listRef} className="list audio-list">
                        {audioDb.length === 0 && <div>
                            Start recording to see your music here!
                        </div>}
                        {audioDb.map(({order, title, duration, blob}, i) => {
                            const src = URL.createObjectURL(blob);
                            return (
                                <div
                                    key={order}
                                    className={"list__entry audio-entry " + (curAudioID === order ? 'on' : 'off')}
                                >
                                    <AudioWrapper
                                        id={order}
                                        src={src}
                                        hasControls={curAudioID === order}
                                        title={title}
                                        duration={duration}
                                        setAudioID={setAudioID}
                                        setTitle={(newTitle) => {
                                            db.recordings.update(order, {
                                                title: newTitle
                                            });
                                        }}
                                        deleteAudio={deleteAudio}
                                        isFirst={i === 0}
                                        listRef={listRef}
                                    />
                                </div>
                            )
                        })}
                    </div>}
                </div>
            </div>
        </>
    );
}