import Recorder from "./tools/Recorder";
import Instruments from "./tools/Instruments";
import Display from "./tools/Display";
import Metronome from "./tools/Metronome";
import './../styles/tools.css'
import { useState } from "react";
import MusicSheet from "./MusicSheet";

function Tool({ isOn, label, tool, setTool, children }) {

    return (
        <div
            className={'piano__tool tool--recorder ' + (isOn ? 'piano__tool--on' : 'piano__tool--off')}

        >
            <div
                className="tool__btn"
                onClick={(e) => {
                    setTool(tool);
                }}
            >
                <div className="tool__icon icon--recorder" />
                <div className="tool__label">{label}</div>
            </div>
            {children}
        </div>
    )
}

export default function Toolbar({ pianoRecRef, isRecording, setRecording, attrs, setAttrs, ctxRef, tickCtxRef, staveRef, rendererRef, setSheetRec, clearSheet }) {
    const [curTool, setTool] = useState(null);

    function closeTools() {
        setTool(null);
    }

    const CloseBtn = <button
        className="btn--icon extend__close"
        title="Close"
        onClick={closeTools}
    />;

    const BackBtn = <button
        className="btn--icon extend__back"
        title="Close"
        onClick={closeTools}
    />;

    const tools = [
        {
            name: 'recorder',
            label: 'Record',
            comp: <Recorder
                pianoRecRef={pianoRecRef}
                isRecording={isRecording}
                setRecording={setRecording}
                instrument={attrs.instrument}
                isOn={curTool === 'recorder'}
            />,
            isNested: true
        },
        {
            name: 'instruments',
            label: 'Instruments',
            comp: <Instruments
                instrument={attrs.instrument}
                setAttrs={setAttrs}
                CloseBtn={BackBtn}
                closeTools={closeTools}
            />
        },
        {
            name: 'display',
            label: 'Display',
            comp: <Display
                displayMode={attrs.displayMode}
                setAttrs={setAttrs}
                CloseBtn={BackBtn}
                closeTools={closeTools}
            />
        },
        {
            name: 'metronome',
            label: 'Metronome',
            comp: <Metronome
                CloseBtn={CloseBtn}
                isOn={curTool === 'metronome'}
                setTool={setTool}
            />
        }
    ];

    return (
        <div className={"piano__tools" + (curTool ? ' piano__tools--extend' : '')}>
            {curTool && <button
                className="tools__back"
                onClick={() => {
                    setTool(null);
                }}
            >
                Back
            </button>}
            <div className="tools__inner">
                {tools.map(({ name, comp, label }) => (
                    <Tool
                        key={name}
                        label={label}
                        isOn={curTool === name}
                        tool={name}
                        setTool={setTool}
                        setAttrs={setAttrs}
                    >
                        {comp}
                    </Tool>
                ))}
            </div>
            <MusicSheet
                ctxRef={ctxRef}
                tickCtxRef={tickCtxRef}
                staveRef={staveRef}
                rendererRef={rendererRef}
                hide={curTool !== null && curTool !== 'recorder'}
                setSheetRec={setSheetRec}
                clearSheet={clearSheet}
            />
        </div>
    )
}