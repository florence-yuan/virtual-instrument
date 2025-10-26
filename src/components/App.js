import { useState, useRef } from "react";
import { Accidental, StaveNote, TextNote } from "vexflow";

import Piano from "./Piano";
import Toolbar from "./Toolbar";
// import Notepad from "./tools/Notepad";
import NavBar from "./NavBar";

import { createNewStave } from "./music_display"

const NOTE_START_X = 15;
const NOTE_SPACING = 40;
const NOTE_WIDTH = 20;
const NUM_NOTES_PER_LINE = 17;
const SHEET_WIDTH = 800;

let sheetOuter;
window.addEventListener("load", () => {
	sheetOuter = document.querySelector(".sheet-viewport");
});

export default function App() {
	const [attrs, setAttrs] = useState({
		displayMode: 'key',
		instrument: 'acoustic_grand_piano'
	});

	const pianoRecRef = useRef(null);

	const [isRecording, setRecording] = useState(false);

	const [noteHistory, setNoteHistory] = useState([]);	// stave notes <g> IDs

	const [noteX, setNoteX] = useState(NOTE_START_X);
	const [noteID, setNoteID] = useState(0);

	const ctxRef = useRef(null);
	const tickCtxRef = useRef(null);
	const staveRef = useRef(null);
	const rendererRef = useRef(null);
	const [isSheetRec, setSheetRec] = useState(true);

	function clearSheet() {
		setNoteX(NOTE_START_X);
		setNoteID(0);
		setNoteHistory([]);
	}

	function addNoteToSheet(note, accidental, labelFloat, key) {
		if (!isSheetRec)
			return;
		// const newAnno = new Annotation(key);
		// newAnno.VerticalJustify = AnnotationVerticalJustify.BOTTOM;

		// const label = new Annotation(key).setVerticalJustification(AnnotationVerticalJustify.BOTTOM);
		const newNote = new StaveNote({
			keys: [note], duration: "w"
		})/* .addModifier(label) */;

		const context = ctxRef.current;
		const tickContext = tickCtxRef.current;

		newNote.setContext(context).setStave(staveRef.current);
		if (accidental) {
			newNote.addModifier(new Accidental(accidental));
		}

		const svgID = newNote.getAttribute('id');
		// console.log('svgID', svgID)

		const label = new TextNote({ duration: 'w', text: key });
		label.setContext(context).setStave(staveRef.current).setX(-5).setY(labelFloat ? 60 : 100);

		tickContext.addTickable(newNote);
		tickContext.addTickable(label);
		tickContext.preFormat().setX(noteX);

		newNote.draw();
		label.draw();

		// Formatter.FormatAndDraw(context, staveRef.current, [newNote]);

		if (noteID % NUM_NOTES_PER_LINE === NUM_NOTES_PER_LINE - 1) {
			// console.log("!!!NEW LINE!!!", sheetOuter);
			setNoteX(NOTE_START_X);

			let curLine = Math.floor((noteID + 1) / NUM_NOTES_PER_LINE);
			staveRef.current = createNewStave(ctxRef, curLine);

			if (curLine > 2 && sheetOuter) {
				// console.log(rendererRef.current)
				rendererRef.current.resize(SHEET_WIDTH, 343 + (curLine - 2) * 110);
				sheetOuter.scrollTo({
					top: 10 + 110 * (curLine - 2),
					behavior: 'smooth'
				});
			}

			setNoteHistory([]);
		} else {
			setNoteX(prev => prev + NOTE_SPACING);

			setNoteHistory(prev => [
				...prev,
				svgID
			]);
		}
		setNoteID(prev => prev + 1);
	}

	function removePrevNote() {
		if (!noteHistory || noteHistory.length === 0)
			return;

		const prevSvgID = noteHistory[noteHistory.length - 1];
		// console.log('remove', prevSvgID);

		document.querySelector("#vf-" + prevSvgID + " + text").remove();
		document.getElementById("vf-" + prevSvgID).remove();

		setNoteHistory(noteHistory.slice(0, noteHistory.length - 1));
		setNoteID(prev => prev - 1);
		setNoteX(prev => prev - NOTE_SPACING);
	}

	return (
		<>
			<NavBar />
			<canvas id="myCanvas" />
			<div className="interface">
				<div className="piano-wrapper">
					<div className="piano-headboard">
						<Toolbar
							pianoRecRef={pianoRecRef}
							isRecording={isRecording}
							setRecording={setRecording}

							attrs={attrs}
							setAttrs={setAttrs}

							ctxRef={ctxRef}
							tickCtxRef={tickCtxRef}
							staveRef={staveRef}
							rendererRef={rendererRef}
							setSheetRec={setSheetRec}
							clearSheet={clearSheet}
						/>
						<div className="piano__title">
							Virtual Piano
						</div>
						<div className="piano__band" />
					</div>
					<Piano
						attrs={attrs}
						pianoRecRef={pianoRecRef}
						isRecording={isRecording}
						addNoteToSheet={addNoteToSheet}
						removePrevNote={removePrevNote}
					/>
				</div>
			</div>
		</>
	);
}