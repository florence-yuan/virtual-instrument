import { useEffect, useRef, useState } from "react";
import { formatDuration } from "./UtilFuncs";

export default function AudioWrapper({ id, src, title, duration, setAudioID, hasControls, setTitle, deleteAudio, isFirst, listRef }) {
    const wrapperRef = useRef(null);
    const audioRef = useRef(null);
    const trackRef = useRef(null);
    const [isPlaying, setPlaying] = useState(false);
    const [curTime, setCurTime] = useState(0);
    const inter = useRef(null);

    const [isMouseDown, setMouseDown] = useState(false);

    const [isOptOpen, setOptOpen] = useState(false);

    useEffect(() => {
        setCurTime(0);
        if (audioRef.current)
            audioRef.current.currentTime = 0;
    }, [src]);

    if (!src) {
        return null;
    }

    const trackWidth = audioRef.current ? curTime / duration * 100 : 0;

    function handleTrackTime(e) {
        if (!trackRef.current)
            return;

        const {width, left} = trackRef.current.getBoundingClientRect();
        const curTime = Math.min(1, (e.clientX - left) / width) * duration;
        setCurTime(curTime);
        audioRef.current.currentTime = curTime;
    }

    return (
        <div
            ref={wrapperRef}
            className="audio-wrapper"
            onClick={() => {
                setAudioID(id);
                setTimeout(() => {
                    if (!wrapperRef.current)
                        return;
                    listRef.current.scrollTo({
                        top: wrapperRef.current.offsetTop - 72,
                        behavior: 'smooth'
                    })
                }, 100);
            }}
        >
            {hasControls ?
                <button
                    className={"audio__btn " + (isPlaying ? 'audio__btn--pause' : 'audio__btn--play')}
                    onClick={() => {
                        const audio = audioRef.current;
                        if (!audio)
                            return;

                        if (audio.paused) {
                            audio.play();

                            setCurTime(audio.currentTime);
                            inter.current = setInterval(() => {
                                setCurTime(audio.currentTime);
                            }, 10);

                            setPlaying(true);
                        } else {
                            audio.pause();
                            clearInterval(inter.current);

                            setPlaying(false);
                        }
                    }}
                >
                </button> :
                <div
                    className="audio__label"
                >
                    {id * -1}
                </div>
            }
            <div className={"audio__inner" + (hasControls ? ' controls' : ' no-controls')}>
                <div className="audio__header">
                    <div className="audio__title-wrapper">
                        <input
                            className="audio__title"
                            type="text"
                            value={title ? title : ''}
                            placeholder='Title'
                            title='rename'
                            maxLength={30}
                            onFocus={() => {
                                document.body.classList.add('editing');
                            }}
                            onBlur={() => {
                                document.body.classList.remove('editing');
                            }}
                            onChange={(e) => { setTitle(e.target.value) }}
                        ></input>
                        <div className="audio__title-underline" />
                    </div>
                    {hasControls && <div className="audio__more">
                        <button
                            className="audio__more-btn btn--icon"
                            onClick={() => {
                                setOptOpen(!isOptOpen);
                            }}
                        />
                        <div className={"audio__actions " + (isOptOpen ? 'open' : 'off')}>
                            <div
                                className="audio__act audio__act--delete"
                                onClick={() => {
                                    deleteAudio(id);
                                    setOptOpen(false);
                                }}
                            >
                                Delete
                            </div>
                            <div
                                className="audio__act audio__act--download"
                                onClick={() => {
                                    const downloadLink = document.createElement('a');
                                    downloadLink.href = src;
                                    downloadLink.download = title + '.ogg';
                                    downloadLink.click();
                                    setOptOpen(false);
                                }}
                            >
                                Download
                            </div>
                        </div>
                    </div>}
                </div>
                {hasControls && <><div
                    ref={trackRef}
                    className={"audio__track-wrapper"}
                    onMouseDown={(e) => {
                        handleTrackTime(e);
                        setMouseDown(true);
                    }}
                    onMouseMove={(e) => {
                        if (!isMouseDown)
                            return;

                        handleTrackTime(e);
                    }}
                    onMouseLeave={() => {
                        setMouseDown(false);
                    }}
                >
                    <div
                        className="audio__track"
                    >
                        <div
                            className="audio__played"
                            style={{
                                width: trackWidth + '%'
                            }}
                        >
                            <div
                                className="audio__thumb"
                                onMouseDown={() => {
                                    setMouseDown(true);
                                }}
                                onMouseUp={() => {
                                    setMouseDown(false);
                                }}
                            />
                        </div>
                    </div>
                </div>
                <audio
                    ref={audioRef}
                    src={src}
                    className="audio"
                    onEnded={() => {
                        setPlaying(false);
                        clearInterval(inter.current);
                    }}
                ></audio></>}
                <div className="audio__duration">
                    {
                        hasControls ? (formatDuration(curTime) + ' / ' + formatDuration(duration))
                        : <>
                            <div className="audio__dur-icon" />
                            {formatDuration(duration)}
                        </>
                    }
                </div>
            </div>
        </div>
    )
}