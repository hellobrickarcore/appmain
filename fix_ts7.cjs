const fs = require('fs');

const typesPath = 'src/types.ts';
let tStr = fs.readFileSync(typesPath, 'utf8');
tStr = tStr.replace(/  targetCount\?: number;\n/g, ''); // just remove them all
tStr = tStr.replace(/  type\?: string;/g, '  type?: string;\n  targetCount?: number;'); // add back one
fs.writeFileSync(typesPath, tStr);

const hbPath = 'src/pages/HelloBrickPage.tsx';
let hbStr = fs.readFileSync(hbPath, 'utf8');
hbStr = hbStr.replace(/import { BrickDetectionResult, Quest, UserProgress, GameSession, DetectedBrick } from '\.\.\/types';/g, "import { BrickDetectionResult, Quest, GameSession, DetectedBrick } from '../types';");
hbStr = hbStr.replace(/const setShowOnboarding/g, "const _setShowOnboarding");
hbStr = hbStr.replace(/\(badge, i\)/g, "(badge: any, i: number)");
hbStr = hbStr.replace(/goal =>/g, "(goal: any) =>");

fs.writeFileSync(hbPath, hbStr);
