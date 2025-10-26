import { useEffect, useRef } from "react"
import { Renderer, Stave, StaveNote, Voice, Formatter, TickContext } from "vexflow";

import "../styles/music-sheet.css"

// console.log(Factory)
// const {Factory, EasyScore, System} = VexFlow;

export default function MusicSheet() {
    const hasInit = useRef(false);
    const ctxRef = useRef(null);
    const staveRef = useRef(null);

    /*     useEffect(() => {
            if (hasInit.current)
                return;
    
            const vf = new Factory({
                renderer: {
                    elementId: 'music-sheet',
                    width: 500,
                    height: 200
                }
            });
            const score = vf.EasyScore();
            const system = vf.System();
    
            vfRef.current = vf;
                    scoreRef.current = score;
                    systemRef.current = system;
    
            system.addStave({
                voices: [score.voice(score.notes('C#5/q, B4, A4, G#4'))]
            }).addClef('treble').addTimeSignature('4/4');
    
            console.log('old vf', vf);
            vf.draw();
    
            hasInit.current = true;
        }, []); */

    useEffect(() => {
        if (hasInit.current)
            return;

        const renderer = new Renderer(
            document.getElementById("music-sheet"),
            Renderer.Backends.SVG
        );

        renderer.resize(500, 300);
        const context = renderer.getContext();

        const tickContext = new TickContext();

        const stave = new Stave(10, 40, 480);
        stave.addClef("treble");
        stave.setContext(context).draw();

        ctxRef.current = context;
        staveRef.current = stave;

        // Create the notes
        const notes = [
            new StaveNote({ keys: ["c/4"], duration: "q" }),
            new StaveNote({ keys: ["d/4"], duration: "q" }),
            new StaveNote({ keys: ["b/4"], duration: "qr" }),
            new StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" }),
        ];

        /*         notes.forEach(note => {
                    note.setContext(context).setStave(stave);
                    tickContext.addTickable(note);
                });
        
                tickContext.preFormat().setX(0)
        
                notes.forEach(note => {
                    note.draw()
                }) */

        Formatter.FormatAndDraw(context, stave, notes);

        hasInit.current = true;
    }, []);

    return (
        <div id="music-sheet">
            <button
                onClick={() => {
                    const newNote = new StaveNote({ keys: ["g/4"], duration: "q" });

                    const tickContext = new TickContext();

                    newNote.setContext(ctxRef.current).setStave(staveRef.current);
                    tickContext.addTickable(newNote);
                tickContext.preFormat().setX(30)
                    newNote.draw();

                    /*                     const vf = new Factory({
                                            renderer: {
                                                elementId: 'music-sheet',
                                                width: 500,
                                                height: 200
                                            }
                                        });
                                        const score = vf.EasyScore();
                                        const system = vf.System();
                    
                                        system.addStave({
                                            voices: [
                                                score.voice(
                                                    score.notes('C#5/q, B4, B4')
                                                        .concat(
                                                            score.tuplet(score.beam(score.notes('A4/8, E4, C4'))))
                                                )
                                            ]
                                        }).addClef('treble').addTimeSignature('4/4');
                    
                                        console.log('new vf', vf);
                                        vf.draw(); */
                }}
            >Click me! Testy test</button>
        </div>
    )
}