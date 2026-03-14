import fetch from 'node-fetch';

const BASE_URL = 'https://api.keydesignmedia.xyz/api';
const endpoints = [
    { name: 'Health', url: `${BASE_URL}/health` },
    { name: 'Detect (GET - expect 405/404)', url: `${BASE_URL}/detect` },
    { name: 'XP Me', url: `${BASE_URL}/xp/me?user_id=test_user` },
    { name: 'Dataset Collection', url: `${BASE_URL}/dataset/collection/get?userId=test_user` },
    { name: 'Feed Posts', url: `${BASE_URL}/feed/posts` },
    { name: 'Auth Info', url: `${BASE_URL}/auth/info` }
];

async function testEndpoints() {
    console.log(`Checking production endpoints at: ${BASE_URL}\n`);
    for (const ep of endpoints) {
        try {
            const res = await fetch(ep.url, { timeout: 3000 });
            console.log(`[${ep.name}] Status: ${res.status}`);
            if (res.status === 200) {
                const data = await res.json();
                console.log(`    Response: ${JSON.stringify(data).substring(0, 100)}...`);
            } else {
                console.log(`    Failed: ${res.statusText}`);
            }
        } catch (err) {
            console.log(`[${ep.name}] Error: ${err.message}`);
        }
    }
}

testEndpoints();
