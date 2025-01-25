export default function Notepad({recNotes, setRecNotes}) {
    
    return (
        <div className="notepad">
            <textarea
                className="textarea"
                rows={4}
                columns={50}
                spellCheck="false"
                value={recNotes}
                maxLength={500}
                placeholder="Your key record"
                onChange={(e) => {
                    setRecNotes(e.target.value)
                }}
                onFocus={() => {
                    document.body.classList.add('editing');
                }}
                onBlur={() => {
                    document.body.classList.remove('editing');
                }}
            />
        </div>
    )
}