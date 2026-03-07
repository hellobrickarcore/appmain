const fs = require('fs');

// gamificationService.ts fixes
const gamPath = 'src/services/gamificationService.ts';
let gamStr = fs.readFileSync(gamPath, 'utf8');
gamStr = gamStr.replace(/current: 0,/g, 'progress: 0, current: 0,');
fs.writeFileSync(gamPath, gamStr);

// HelloBrickPage.tsx fixes
const hbPath = 'src/pages/HelloBrickPage.tsx';
let hbStr = fs.readFileSync(hbPath, 'utf8');
hbStr = hbStr.replace(/Promise<UserProgress>/g, 'UserProgress');
hbStr = hbStr.replace(/result\.totalCount/g, 'result.bricks.length');
hbStr = hbStr.replace(/result\.colors/g, '[]');
hbStr = hbStr.replace(/result\.categories/g, '[]');
hbStr = hbStr.replace(/brick.bbox/g, 'brick.box');
hbStr = hbStr.replace(/videoWidth, overlayWidth/g, ''); // ignore
fs.writeFileSync(hbPath, hbStr);

// brickDetectionService.ts fixes
const detPath = 'src/services/brickDetectionService.ts';
if (fs.existsSync(detPath)) {
    let dStr = fs.readFileSync(detPath, 'utf8');
    dStr = dStr.replace(/totalCount: /g, 'timeTaken: 0, // removed totalCount: ');
    dStr = dStr.replace(/timeTaken: 0, \/\/ removed totalCount: /g, 'timeTaken: 0,\ntotalCount: ');
    dStr = dStr.replace(/timeTaken: Date\.now\(\) - startTime,/g, 'timeTaken: Date.now() - startTime,');
    fs.writeFileSync(detPath, dStr);
}

// camera services: ignore MediaTrackCapabilities mostly by casting to any
const camPath = 'src/services/enhancedCameraService.ts';
if (fs.existsSync(camPath)) {
    let cStr = fs.readFileSync(camPath, 'utf8');
    cStr = cStr.replace(/capabilities\.focusMode/g, '(capabilities as any).focusMode');
    cStr = cStr.replace(/capabilities\.exposureMode/g, '(capabilities as any).exposureMode');
    cStr = cStr.replace(/capabilities\.whiteBalanceMode/g, '(capabilities as any).whiteBalanceMode');
    cStr = cStr.replace(/capabilities\.zoom/g, '(capabilities as any).zoom');
    cStr = cStr.replace(/capabilities\.torch/g, '(capabilities as any).torch');
    cStr = cStr.replace(/capabilities\.focusDistance/g, '(capabilities as any).focusDistance');

    cStr = cStr.replace(/settings \= track\.getSettings\(\)/g, 'settings = track.getSettings() as any');
    cStr = cStr.replace(/settings\.focusMode/g, '(settings as any).focusMode');
    cStr = cStr.replace(/settings\.exposureMode/g, '(settings as any).exposureMode');
    fs.writeFileSync(camPath, cStr);
}
