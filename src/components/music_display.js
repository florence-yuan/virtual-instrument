import { Stave } from "vexflow";

const SHEET_WIDTH = 800;
const SHEET_MARGIN_X = 25;
const SHEET_MARGIN_Y = -5;

const STAVE_WIDTH = SHEET_WIDTH - 2 * SHEET_MARGIN_X;
const STAVE_SPACING = 110;

export function createNewStave(ctxRef, lineNum = 0) {
    if (!ctxRef)
        return;

    const stave = new Stave(SHEET_MARGIN_X, SHEET_MARGIN_Y + lineNum * STAVE_SPACING, STAVE_WIDTH);
    stave.addClef("treble");
    stave.setContext(ctxRef.current).draw();

    return stave;
}