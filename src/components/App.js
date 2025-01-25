import { useState, useRef } from "react";
import Piano from "./Piano";
import Toolbar from "./Toolbar";
import Notepad from "./tools/Notepad";
import NavBar from "./NavBar";

export default function App() {
	const [attrs, setAttrs] = useState({
		displayMode: 'key',
		instrument: 'acoustic_grand_piano'
	});

    const pianoRecRef = useRef(null);

    const [isRecording, setRecording] = useState(false);

	const [recNotes, setRecNotes] = useState('');	// recorded notes for the notepad

	return (
		<>
			<NavBar />
			<div className="interface">
				<Notepad
					recNotes={recNotes}
					setRecNotes={setRecNotes}
				/>
				<div className="piano-wrapper">
					<div className="piano-headboard">
						<Toolbar
							pianoRecRef={pianoRecRef}
							isRecording={isRecording}
							setRecording={setRecording}

							attrs={attrs}
							setAttrs={setAttrs}
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
						setRecNotes={setRecNotes}
					/>
				</div>
			</div>
		</>
	);
}