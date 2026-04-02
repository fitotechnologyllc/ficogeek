
import Stripe from 'stripe';
import admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Manual env loader for simple JS test
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
    }
});

async function verifyLive() {
    console.log("--- FICO Geek Live Connectivity Audit (JS) ---");

    try {
        const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
            apiVersion: '2024-04-10',
        });
        const account = await stripe.accounts.retrieve();
        console.log(`✅ Stripe Secret Key Verified: ${account.email} (${account.id})`);

        const premium = await stripe.prices.retrieve(env.STRIPE_PREMIUM_PRICE_ID);
        console.log(`✅ Premium Price: ${premium.id} (${premium.unit_amount/100} ${premium.currency})`);

        const pro = await stripe.prices.retrieve(env.STRIPE_PRO_PRICE_ID);
        console.log(`✅ Pro Price: ${pro.id} (${pro.unit_amount/100} ${pro.currency})`);
    } catch (e) {
        console.error("❌ Stripe Error:", e.message);
    }

    try {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: env.FIREBASE_PROJECT_ID,
                    clientEmail: env.FIREBASE_CLIENT_EMAIL,
                    privateKey: env.FIREBASE_SERVER_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
            });
        }
        const db = admin.firestore();
        await db.collection('profiles').limit(1).get();
        console.log("✅ Firebase Admin Verified.");
    } catch (e) {
        console.error("❌ Firebase Admin Error:", e.message);
    }
}

verifyLive();
