import { useEffect, useState } from "react";

export default function Instruments({instrument, setAttrs, CloseBtn, closeTools}) {
    const [instrumentList, setInstrumentList] = useState([]);

    useEffect(() => {
        fetch('https://raw.githubusercontent.com/danigb/soundfont-player/master/names/musyngkite.json')
            .then(data => data.json())
            .then(result => {
                setInstrumentList(['splendid_grand_piano', ...result]);
            });
    }, []);

    const [filter, setFilter] = useState('');

    return (
        <>
            <div className="tool__extend">
                <div className="list-wrapper instrument-list-wrapper">
                    <div className="list__heading">
                        {CloseBtn}
                        <div className="list__filter-wrapper">
                            <input
                                className="list__filter"
                                value={filter}
                                placeholder="Search instruments"
                                onChange={(e) => {
                                    setFilter(e.target.value.toLowerCase().trim());
                                }}
                                onFocus={() => {
                                    document.body.classList.add('editing');
                                }}
                                onBlur={() => {
                                    document.body.classList.remove('editing');
                                }}
                            />
                            <div className="list__filter-line" />
                        </div>
                    </div>
                    <div className="list instrument-list">
                        {instrumentList
                            .filter(ins => ins.indexOf(filter) !== -1)
                            .map(ins => (
                                <div
                                    key={ins}
                                    className={"list__entry instrument-entry" + (ins === instrument ? ' highlighted' : '')}
                                    onClick={() => {
                                        setAttrs(prev => ({
                                            ...prev,
                                            instrument: ins
                                        }));
                                        setTimeout(() => {
                                            closeTools();
                                        }, 500);
                                    }}
                                >
                                    {ins.split('_').join(' ')}
                                </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}