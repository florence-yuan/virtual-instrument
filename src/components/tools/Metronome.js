import { createPortal } from 'react-dom';
import './../../styles/metronome.css'
import { useRef, useState } from 'react';

const leftMarkings = [40, 44, 48, 52, 56, 60, 66, 72,
    80, 88, 96, 104, 112, 120, 132, 144, 160, 176, 192, 208
];
const rightMarkings = [42, 46, 50, 54, 58, 63, 69, 76, 84,
    92, 100, 108, 116, 126, 138, 152, 168, 184, 200
];

const metroLabels = [
    { label: 'grave', val: 40 },
    { label: 'largo', val: 44 },
    { label: 'lento', val: 50 },
    { label: 'adagio', val: 56 },
    { label: 'adagietto', val: 63 },
    { label: 'andante', val: 72 },
    { label: 'andantino', val: 80 },
    { label: 'maestoso', val: 88 },
    { label: 'moderato', val: 96 },
    { label: 'allegretto', val: 108 },
    { label: 'animato', val: 120 },
    { label: 'allegro', val: 132 },
    { label: 'assai', val: 144 },
    { label: 'vivace', val: 160 },
    { label: 'presto', val: 184 },
    { label: 'prestissimo', val: 208 }
];

const audio = new Audio();
const audio2 = new Audio();
const audio3 = new Audio();
audio.src = audio2.src = audio3.src = '/sounds/metronome.mp3';

const sounds = [audio, audio2, audio3];

const spacingScale = 2.3;

export default function Metronome({ isOn, setTool, CloseBtn }) {
    const mref = useRef(null);
    const href = useRef(null);
    const [isMouseDown, setMouseDown] = useState(false);
    const startClientY = useRef(-1);
    const [tempo, setTempo] = useState(80);

    const [isMetroOn, setMetroOn] = useState(false);
    const [isMin, setMin] = useState(false);
    const metroInter = useRef(null);

    function timer(i = 0) {
        sounds[i].play();
        metroInter.current = setTimeout(() => {
            timer((i + 1) % 3);
        }, 60 * 1000 / tempo);
    }

    function handleNewTempo(e) {
        if (isMin || !mref.current)
            return;

        const { top, bottom, height } = mref.current.getBoundingClientRect();

        const clientY = e.clientY - startClientY.current / 2;
        if (clientY < top || clientY > bottom)
            return;

        const newTempo = leftMarkings[0] + Math.round(
            (clientY - top) / height * (leftMarkings[leftMarkings.length - 1] - leftMarkings[0])
        );
        if (tempo !== newTempo) {
            setTempo(newTempo);
        }
    }

    const [isFolded, setFolded] = useState(false);

    return (
        <>
            {!isOn && mref.current && createPortal(
                <div className='widget'>
                    <div
                        className={'widget__main' + (isFolded ? ' folded' : '')}
                        onClick={() => {
                            if (isFolded) {
                                setFolded(false);
                            }
                        }}
                        title={isFolded ? 'Metronome' : ''}
                    >
                        <div
                            className='widget__content'
                            onClick={() => {
                                setTool('metronome');
                            }}
                        >
                            Metronome: {tempo} BPM
                        </div>
                        <button
                            className='widget__btn'
                            onClick={() => {
                                if (!isMetroOn) {
                                    timer();
                                } else {
                                    clearInterval(metroInter.current);
                                }
                                setMetroOn(!isMetroOn);
                            }}
                        >
                            {isMetroOn ? 'Stop' : 'Start'}
                        </button>
                        <button
                            className='btn--icon widget__close-btn'
                            onClick={() => {
                                setFolded(true);
                            }}
                        />
                    </div>
                </div>,
                document.querySelector('.piano__tools'))
            }
            {createPortal(<div className={"tool__popup " + (isOn ? 'on' : 'off') + (isMin ? ' min' : '')}>
                <div
                    className='popup__bg'
                    onClick={() => { setTool(null) }}
                />
                <div className="popup__body metro-wrapper">
                    <button
                        className='btn--icon popup__min'
                        title={isMin ? 'Maximize' : 'Minimize'}
                        onClick={() => {
                            setMin(!isMin);
                        }}
                    />
                    <div className='metro-attrs'>
                        <div className='attrs-flex'>
                            <div className='metro__attr'>
                                {tempo} BPM
                            </div>
                            <button
                                className='metro__btn'
                                onClick={() => {
                                    if (!isMetroOn) {
                                        timer();
                                    } else {
                                        clearInterval(metroInter.current);
                                    }
                                    setMetroOn(!isMetroOn);
                                }}
                            >
                                {isMetroOn ? 'Stop' : 'Start'}
                            </button>
                        </div>
                        <div className='metro__attr metro__attr--note'>
                            (Click / Drag to change tempo)
                        </div>
                    </div>
                    <div className="metro-markings">
                        <div ref={mref} className="markings__col markings--left">
                            {leftMarkings.map((num, i) => (
                                <div
                                    key={num}
                                    className="marking marking--left"
                                    style={{
                                        top: (num - leftMarkings[0]) * spacingScale + 'px'
                                    }}
                                >
                                    <span className="marking__num">{num}</span>
                                    <span className="marking__line" />
                                </div>
                            ))}
                        </div>
                        <div className='metro__labels'>
                            {metroLabels.map(({ label, val }, i) => (
                                <div
                                    key={label}
                                    className='metro__label'
                                    style={{
                                        top: (val - leftMarkings[0]) * spacingScale + 'px'
                                    }}
                                >
                                    {label}
                                </div>
                            ))}
                            <div
                                className={'pendulum ' + (isMetroOn ? 'on' : 'off')}
                                style={{
                                    animationDuration: (60 / tempo) + 's'
                                }}
                                onClick={(e) => {
                                    startClientY.current = 0;
                                    handleNewTempo(e);
                                }}
                                onMouseUp={() => { setMouseDown(false) }}
                                onMouseMove={(e) => {
                                    if (!isMouseDown)
                                        return;

                                    handleNewTempo(e);
                                }}
                                onMouseLeave={() => { setMouseDown(false) }}
                            >
                                <div className='pendulum__slider' />
                                <div
                                    ref={href}
                                    className='pendulum__head'
                                    style={{
                                        translate: '0 ' + ((tempo - leftMarkings[0]) * spacingScale) + 'px'
                                    }}
                                    onMouseDown={(e) => {
                                        startClientY.current = e.clientY - href.current.getBoundingClientRect().top;
                                        setMouseDown(true);
                                    }}
                                />
                            </div>
                        </div>
                        <div className="markings__col markings--right">
                            {rightMarkings.map((num, i) => (
                                <div
                                    key={num}
                                    className="marking marking--right"
                                    style={{
                                        top: (num - leftMarkings[0]) * spacingScale + 'px'
                                    }}
                                >
                                    <span className="marking__line" />
                                    <span className="marking__num">{num}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {CloseBtn}
            </div>, document.getElementById("root"))}
        </>
    );
}