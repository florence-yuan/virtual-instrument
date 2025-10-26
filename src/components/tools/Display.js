const displayList = [
    'key', 'note'
];

export default function Display({displayMode, setAttrs, CloseBtn, closeTools}) {
    return (
        <>
            <div className="tool__extend">
                <div className="list-wrapper display-list-wrapper">
                    <div className="list__heading">
                        {CloseBtn}
                        <h1>Display Modes</h1>
                    </div>
                    <div className="list display-list">
                        {displayList
                            .map(dm => (
                                <div
                                    key={dm}
                                    className={"list__entry display-entry" + (dm === displayMode ? ' highlighted' : '')}
                                    onClick={() => {
                                        setAttrs(prev => ({
                                            ...prev,
                                            displayMode: dm
                                        }));
                                        closeTools();
                                    }}
                                >
                                    <div className="display__text">
                                        <div className="display__radio" />
                                        <div className="display__label">{dm}</div>
                                    </div>
                                    <div
                                        className={"display__img display__img--" + (dm)}
                                    />
                                </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}