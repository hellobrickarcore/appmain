/**
 * Suggestion Engine for HelloBrick
 * Matches user's inventory against a set database.
 */

import { Brick, LegoSet } from '../types';

// Mock database of popular sets for the MVP
const SET_DATABASE: LegoSet[] = [
    {
        id: 'set_10305',
        setNumber: '10305',
        name: 'Lion Knights\' Castle',
        image: 'https://images.brickset.com/sets/images/10305-1.jpg',
        partCount: 4514,
        ownedParts: 0,
        bricks: [
            { id: 'b1', name: 'Brick 2x4', count: 400, category: 'Brick', color: 'Light Gray', image: 'https://images.brickset.com/parts/design1.jpg' },
            { id: 'b2', name: 'Plate 1x2', count: 200, category: 'Plate', color: 'Dark Gray', image: 'https://images.brickset.com/parts/design1.jpg' },
            { id: 'b3', name: 'Brick 1x2', count: 300, category: 'Brick', color: 'Light Gray', image: 'https://images.brickset.com/parts/design1.jpg' }
        ]
    },
    {
        id: 'set_10497',
        setNumber: '10497',
        name: 'Galaxy Explorer',
        image: 'https://images.brickset.com/sets/images/10497-1.jpg',
        partCount: 1254,
        ownedParts: 0,
        bricks: [
            { id: 'b1', name: 'Brick 2x4', count: 50, category: 'Brick', color: 'Blue', image: 'https://images.brickset.com/parts/design1.jpg' },
            { id: 'b4', name: 'Slope 45 2x2', count: 20, category: 'Slope', color: 'Blue', image: 'https://images.brickset.com/parts/design1.jpg' },
            { id: 'b5', name: 'Plate 4x4', count: 10, category: 'Plate', color: 'Light Gray', image: 'https://images.brickset.com/parts/design1.jpg' }
        ]
    },
    {
        id: 'set_75192',
        setNumber: '75192',
        name: 'Millennium Falcon',
        image: 'https://images.brickset.com/sets/images/75192-1.jpg',
        partCount: 7541,
        ownedParts: 0,
        bricks: [
            { id: 'b2', name: 'Plate 1x2', count: 500, category: 'Plate', color: 'Light Gray', image: 'https://images.brickset.com/parts/design1.jpg' },
            { id: 'b6', name: 'Technic Pin', count: 200, category: 'Technic', color: 'Black', image: 'https://images.brickset.com/parts/design1.jpg' }
        ]
    }
];

export const suggestionEngine = {
    /**
     * Calculate how much of each set can be built with current inventory
     */
    getSuggestions(userBricks: Brick[]): LegoSet[] {
        return SET_DATABASE.map(set => {
            let ownedInSet = 0;

            // For each brick required by the set
            const detailedBricks = set.bricks.map(req => {
                // Find matching brick in user inventory
                // Match by name AND color (case insensitive)
                const match = userBricks.find(ub =>
                    ub.name.toLowerCase() === req.name.toLowerCase() &&
                    (ub.color?.toLowerCase() === req.color?.toLowerCase() || req.color === 'Any')
                );

                const countFound = match ? Math.min(match.count, req.count) : 0;
                ownedInSet += countFound;

                return {
                    ...req,
                    count: req.count,
                    owned: countFound
                };
            });

            return {
                ...set,
                ownedParts: ownedInSet,
                bricks: detailedBricks as any // Simplified for UI
            };
        }).sort((a, b) => (b.ownedParts / b.partCount) - (a.ownedParts / a.partCount));
    }
};
