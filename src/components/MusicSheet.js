import { useEffect, useRef, useState } from "react"
import { Renderer, TickContext } from "vexflow";

import { createNewStave } from "./music_display"

import { ReactComponent as EnlargeIcon } from "../images/enlarge.svg";
import { ReactComponent as FreezeIcon } from "../images/freeze.svg";
import { ReactComponent as ClearIcon } from "../images/clear.svg";

import "../styles/music-sheet.css"

const SHEET_WIDTH = 800;

export default function MusicSheet({ ctxRef, tickCtxRef, staveRef, rendererRef, hide, setSheetRec, clearSheet }) {
    const hasInit = useRef(false);
    const viewportRef = useRef(null);

    const [isFrozen, setFrozen] = useState(false);
    const [isEnlarged, setEnlarged] = useState(false);

    const sheetActions = [
        {
            name: isEnlarged ? 'shrink' : 'enlarge',
            icon: <EnlargeIcon />,
            action: () => {
                setEnlarged(prev => !prev);
                viewportRef.current.classList.toggle("enlarged");
            }
        },
        {
            name: isFrozen ? 'start' : 'freeze',
            icon: <FreezeIcon />,
            action: () => {
                setSheetRec(prev => !prev);
                setFrozen(!isFrozen);
            }
        },
        {
            name: 'clear',
            icon: <ClearIcon />,
            action: () => {
                document.querySelector("#music-sheet svg").remove();
                clearSheet();
                createNewSheet();
            }
        }
    ];

    function createNewSheet() {
        const renderer = new Renderer(
            document.getElementById("music-sheet"),
            Renderer.Backends.SVG
        );

        renderer.resize(SHEET_WIDTH, 343);
        rendererRef.current = renderer;
        const context = renderer.getContext();

        const tickContext = new TickContext();

        ctxRef.current = context;
        tickCtxRef.current = tickContext;

        staveRef.current = createNewStave(ctxRef, 0);
    }

    useEffect(() => {
        if (hasInit.current)
            return;

        createNewSheet();

        hasInit.current = true;
    }, []);

    return (
        <div ref={viewportRef} className={"sheet-overlay" + (hide ? " hidden" : "")}>
            <p className="sheet__dir">...Start typing to play</p>
            <div className="sheet-viewport">
                <div id="music-sheet">
                </div>
            </div>
            <div className="sheet__sidebar">
                {sheetActions.map(({ name, icon, action }) => (
                    <div
                        key={name}
                        className="sidebar__action"
                        onClick={() => {
                            action();
                        }}
                    >
                        <button className="sidebar__icon">
                            {icon}
                        </button>
                        <div className="sidebar__label">
                            {name}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}