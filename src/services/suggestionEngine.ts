/**
 * Suggestion Engine for HelloBrick
 * Matches user's inventory against a set database.
 */

import { Brick, LegoSet } from '../types';

export const suggestionEngine = {
    /**
     * Calculate how much of each set can be built with current inventory
     * Generates dynamic build suggestions based on actual owned pieces.
     */
    getSuggestions(userBricks: Brick[]): LegoSet[] {
        if (!userBricks || userBricks.length === 0) return [];

        const suggestions: LegoSet[] = [];
        const colorGroups: Record<string, { count: number, bricks: Brick[] }> = {};

        userBricks.forEach(b => {
            const color = b.color || 'Mixed';
            if (!colorGroups[color]) colorGroups[color] = { count: 0, bricks: [] };
            colorGroups[color].count += b.count;
            colorGroups[color].bricks.push(b);
        });

        // 1. Color-themed builds (Generated from actual inventory)
        Object.entries(colorGroups).forEach(([color, data], idx) => {
            if (data.count >= 3) {
                let theme = 'Structure';
                if (color.toLowerCase() === 'red') theme = 'Firetruck';
                else if (color.toLowerCase() === 'blue') theme = 'Spaceship';
                else if (color.toLowerCase() === 'green') theme = 'Treehouse';
                else if (color.toLowerCase() === 'yellow') theme = 'Construction Vehicle';
                else if (color.toLowerCase() === 'black') theme = 'Batmobile';
                else if (color.toLowerCase() === 'white') theme = 'Snow Speeder';

                const requiredBricks = data.bricks.map(b => ({
                    ...b,
                    count: Math.max(1, Math.floor(b.count * 0.8)), // Build uses ~80% of their bricks of this color
                    owned: b.count
                }));

                const partCount = requiredBricks.reduce((acc, b) => acc + b.count, 0);

                suggestions.push({
                    id: `dyn_color_${color}_${idx}`,
                    setNumber: `MOC-${Math.floor(Math.random() * 9000) + 1000}`,
                    name: `${color} ${theme} Mini-Build`,
                    image: 'https://images.brickset.com/sets/images/11013-1.jpg',
                    partCount: partCount,
                    ownedParts: partCount, // 100% buildable
                    bricks: requiredBricks
                });
            }
        });

        // 2. Mix and match
        const totalBricks = userBricks.reduce((a,b)=>a+b.count,0);
        if (totalBricks >= 10) {
            const topBricks = [...userBricks].sort((a,b) => b.count - a.count).slice(0, 5);
            const reqParts = topBricks.map(b => ({
                ...b,
                count: Math.min(b.count, 5),
                 owned: b.count
            }));
            const pCount = reqParts.reduce((acc, b) => acc + b.count, 0);

            suggestions.push({
                id: `dyn_mixed_1`,
                setNumber: `MOC-MIXED`,
                name: `Rainbow Tower`,
                image: 'https://images.brickset.com/sets/images/10698-1.jpg',
                partCount: pCount,
                ownedParts: pCount, // 100% buildable
                bricks: reqParts
            });
        }
        
        // 3. Add one aspirational set that they are missing pieces for
        if (totalBricks > 0) {
            const hasBlue = userBricks.some(b => b.color?.toLowerCase() === 'blue');
             suggestions.push({
                id: `asp_1`,
                setNumber: `75257`,
                name: `Micro Millennium Falcon`,
                image: 'https://images.brickset.com/sets/images/75257-1.jpg',
                partCount: 45,
                ownedParts: Math.min(totalBricks, 20),
                bricks: [
                    { id: 'b1', name: 'Plate 2x4', count: 10, category: 'Plate', color: 'Light Gray', image: 'https://images.brickset.com/parts/design1.jpg', owned: userBricks.find(b=>b.color==='Light Gray')?.count || 0 },
                    { id: 'b2', name: 'Brick 1x2', count: 20, category: 'Brick', color: 'Light Gray', image: 'https://images.brickset.com/parts/design1.jpg', owned: userBricks.find(b=>b.color==='Light Gray' && b.name.includes('1x2'))?.count || 0 },
                    { id: 'b3', name: 'Engine piece', count: 15, category: 'Cone', color: 'Trans-Light Blue', image: 'https://images.brickset.com/parts/design1.jpg', owned: hasBlue ? 2 : 0 }
                ]
            });
        }

        return suggestions.sort((a, b) => (b.ownedParts / b.partCount) - (a.ownedParts / a.partCount));
    }
};
