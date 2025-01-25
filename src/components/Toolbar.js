import Recorder from "./tools/Recorder";
import Instruments from "./tools/Instruments";
import Display from "./tools/Display";
import Metronome from "./tools/Metronome";
import './../styles/tools.css'
import { useState } from "react";

function Tool({isOn, label, tool, setTool, children}) {

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

export default function Toolbar({pianoRecRef, isRecording, setRecording, attrs, setAttrs}) {
    const [curTool, setTool] = useState(null);
    
    const CloseBtn = <button
        className="btn--icon extend__close"
        title="Close"
        onClick={() => {
            setTool(null);
        }}
    />;
    
    const BackBtn = <button
        className="btn--icon extend__back"
        title="Close"
        onClick={() => {
            setTool(null);
        }}
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
            />
        },
        {
            name: 'display',
            label: 'Display',
            comp: <Display
                displayMode={attrs.displayMode}
                setAttrs={setAttrs}
                CloseBtn={BackBtn}
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
            {tools.map(({name, comp, label}) => (
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
        </div>
    )
}