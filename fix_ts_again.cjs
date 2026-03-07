const fs = require('fs');

// types.ts
const typesPath = 'src/types.ts';
let typesStr = fs.readFileSync(typesPath, 'utf8');
typesStr = typesStr.replace(/badges\?: string\[\];/, 'badges: string[];');
typesStr = typesStr.replace(/dailyGoals\?: DailyGoal\[\];/, 'dailyGoals: DailyGoal[];');
typesStr = typesStr.replace(/brickTypesFound\?: Set<string> \| string\[\];/, 'brickTypesFound: Set<string>;');
typesStr = typesStr.replace(/progress: number;/, 'progress?: number;\n  current?: number;');
fs.writeFileSync(typesPath, typesStr);

// gamificationService.ts
const gamPath = 'src/services/gamificationService.ts';
let gamStr = fs.readFileSync(gamPath, 'utf8');
gamStr = gamStr.replace(/EventTypes, xpHelpers/g, '');
gamStr = gamStr.replace(/import { getUserXP, emitXPEvent, generateEventId, getUserId\,  } from '\.\/xpService';/g, "import { getUserXP, emitXPEvent, generateEventId, getUserId } from './xpService';");

fs.writeFileSync(gamPath, gamStr);

// HelloBrickPage.tsx
const hbPath = 'src/pages/HelloBrickPage.tsx';
let hbStr = fs.readFileSync(hbPath, 'utf8');
hbStr = hbStr.replace(/showOnboarding/g, '_showOnboarding');
fs.writeFileSync(hbPath, hbStr);

// ProfilePage.tsx
const pPath = 'src/pages/ProfilePage.tsx';
let pStr = fs.readFileSync(pPath, 'utf8');
pStr = pStr.replace(/Promise<UserProgress>/g, 'UserProgress');
fs.writeFileSync(pPath, pStr);

// all other unused variables:
const filesToClean = [
    'src/components/ErrorBoundary.tsx',
    'src/components/Logo.tsx',
    'src/screens/CollectionScreen.tsx',
    'src/screens/FeedScreen.tsx',
    'src/screens/HeadToHeadBattleScreen.tsx',
    'src/screens/HomeScreen.tsx',
    'src/screens/MyCreationsScreen.tsx',
    'src/screens/ProfileSettingsScreen.tsx',
    'src/screens/QuestsScreen.tsx',
    'src/screens/RewardsScreen.tsx',
    'src/screens/TrainingIntroScreen.tsx',
    'src/services/geminiService.ts',
    'src/services/hybridDetectionService.ts'
];
filesToClean.forEach(f => {
    if (fs.existsSync(f)) {
        let s = fs.readFileSync(f, 'utf8');
        // Just suppressing all unused variable warnings by prepending `// @ts-nocheck` if we needed to, 
        // but better to just fix them manually or ignore for now if it's too much logic.
        // Let's replace the common ones
        s = s.replace(/import React from 'react';\n/g, "import * as React from 'react';\n");
        s = s.replace(/import { Download/g, "import { // Download");
        s = s.replace(/Mail/g, "/* Mail */");
        s = s.replace(/Hammer,/g, "/* Hammer */,");
        s = s.replace(/CheckCircle2/g, "/* CheckCircle2 */");
        s = s.replace(/Gift/g, "/* Gift */");
        s = s.replace(/ArrowDown/g, "/* ArrowDown */");
        fs.writeFileSync(f, s);
    }
});
