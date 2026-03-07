const fs = require('fs');

const appPath = 'src/App.tsx';
let appStr = fs.readFileSync(appPath, 'utf8');
appStr = appStr.replace(/const \[scanCount, setScanCount\] = useState\(0\);\n/, '');
appStr = appStr.replace(/const incrementScan = \(\) => {\n\s+setScanCount\(prev => prev \+ 1\);\n\s+};\n\n/, '');
fs.writeFileSync(appPath, appStr);

const helloPath = 'src/pages/HelloBrickPage.tsx';
let helloStr = fs.readFileSync(helloPath, 'utf8');
// Fix unused imports
helloStr = helloStr.replace(/addXP,\n/, '\n');
helloStr = helloStr.replace(/saveUserProgress\n/, '\n');
helloStr = helloStr.replace(/import OnboardingFlow from '\.\.\/components\/OnboardingFlow';\n/, '');
helloStr = helloStr.replace(/import ProfilePage from '\.\/ProfilePage';\n/, '');

// Fix unused variables
helloStr = helloStr.replace(/const \[showOnboarding, setShowOnboarding\] = useState\(false\);\n/, 'const [_showOnboarding, setShowOnboarding] = useState(false);\n');

// Fix implicit any for `b =>` and `goal =>`
helloStr = helloStr.replace(/\bb =>/g, '(b: any) =>');
helloStr = helloStr.replace(/\bb \=>/g, '(b: any) =>');
// Some could be `(b)` or `goal =>`
helloStr = helloStr.replace(/\bgoal =>/g, '(goal: any) =>');
helloStr = helloStr.replace(/badge =>/g, '(badge: any) =>');
helloStr = helloStr.replace(/\(category, i\)/g, '(category: any, i: number)');

// `stream` possibly null
helloStr = helloStr.replace(/stream\.id,\n/g, 'stream?.id,\n');
helloStr = helloStr.replace(/stream\.active/g, 'stream?.active');

// Some could be targetColor/textColor mismatch but I already added targetColor to Quest! So those errors should be gone.
// Let's also fix ts_errors.log:
// src/pages/ProfilePage.tsx: 'level' does not exist on type 'Promise<UserProgress>'.
const profilePath = 'src/pages/ProfilePage.tsx';
let profileStr = fs.readFileSync(profilePath, 'utf8');
profileStr = profileStr.replace(/import { User, BarChart3, Calendar, Globe, Award, Hexagon, Zap } from 'lucide-react';/, "import { BarChart3, Calendar, Globe, Award, Hexagon, Zap } from 'lucide-react';");
// Actually let's just use `any` or change the type of `progress`.
// In ProfilePage.tsx, it's probably using `getUserProgress()` which might be returning a Promise but is typed as such.
// I will check ProfilePage.tsx later.
fs.writeFileSync(helloPath, helloStr);
fs.writeFileSync(profilePath, profileStr);
console.log("Replaced");
