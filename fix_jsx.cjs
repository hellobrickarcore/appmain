const fs = require('fs');

const filesToFix = [
    'src/screens/HeadToHeadBattleScreen.tsx',
    'src/screens/ProfileSettingsScreen.tsx',
    'src/screens/QuestsScreen.tsx',
    'src/screens/RewardsScreen.tsx'
];

filesToFix.forEach(f => {
    if (fs.existsSync(f)) {
        let s = fs.readFileSync(f, 'utf8');
        s = s.replace(/\/\* Mail \*\//g, "Mail");
        s = s.replace(/\/\* Hammer \*\//g, "Hammer");
        s = s.replace(/\/\* CheckCircle2 \*\//g, "CheckCircle2");
        s = s.replace(/\/\* Gift \*\//g, "Gift");
        fs.writeFileSync(f, s);
    }
});
