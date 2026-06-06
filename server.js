const QRCode = require('qrcode');
// ShoufKash POS - Secure Cloud Backend Routing Engine
const express = require('express');
const cors = require('cors');
const app = express();
// --- CRITICAL CORS SAFETY CONFIGURATION ---
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    
    // Instantly answer preflight requests safely
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(cors({ origin: '*' }));
app.use(express.json());

const CONFIG = {
    PORT: process.env.PORT || 3000,
    API_URL: 'https://moosyl.com', // Unified Bank Router Link
    SECRET_TOKEN: 'sk_live_mru_7493hdkjhf73298hd93',         // Your private API key signature
    MY_COMMISSION: 0.5,                                       // Your platform micro-fee
    MY_BANKILY_WALLET: 'MR_WALLET_SHOUFKASH_CORP'             // Where your profit accumulates
};

app.post('/api/checkout/generate-charge', (req, res) => {
    const { merchant_phone, base_amount } = req.body;
    if (!merchant_phone || !base_amount || parseFloat(base_amount) <= 0) {
        return res.status(400).json({ success: false, error: 'Invalid Parameters.' });
    }

    const cleanBase = parseFloat(base_amount);
    const totalCharge = cleanBase + CONFIG.MY_COMMISSION;

    // Split-Settlement Routing Schema Matrix: Routes raw money safely at the second of checkout
    const payload = {
        amount: totalCharge, currency: 'MRU',
        settlement_rules: [
            { destination_wallet: merchant_phone, amount: cleanBase }, // Routes retail price to driver/shop
            { destination_wallet: CONFIG.MY_BANKILY_WALLET, amount: CONFIG.MY_COMMISSION } // Routes fee to you
        ]
    };

    // Simulated open-banking engine response link. Live production tokens swap here.
    const mockEMVCoString = `00020101021243510012MR0108BANKILY2522${merchant_phone}53039295405${totalCharge.toFixed(2)}5802MR`;

    res.status(200).json({
        success: true,
        total_charged: totalCharge,
        qr_payload: mockEMVCoString // Passes data string down to change your phone code pixels dynamically
    });
});

app.listen(CONFIG.PORT, () => console.log(`ShoufKash active on deployment port: ${CONFIG.PORT}`));
// --- UPGRADED REAL QR CODE GENERATOR API ---
app.post('/api/generate-qr', async function(req, res) {
    try {
        const amount = req.body.amount;
        console.log("Generating genuine QR handshake for amount:", amount);

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Invalid payment amount" });
        }

        // --- ENCODING DATA PAYLOAD ---
        // This is the string standard your customers' payment scanner will read.
        // We can bundle merchant name, invoice timestamp, or specific target bank parameters here later.
        const paymentPayload = `shoufkash://pay?amount=${amount}&currency=MRU&merchant=MauriPay_POS`;

        // Generate the dynamic Base64 Image layout array string automatically
        const realQrBase64 = await QRCode.toDataURL(paymentPayload, {
            errorCorrectionLevel: 'H', // High error tolerance for fast phone scans
            margin: 1,                 // Border thickness padding adjustment
            color: {
                dark: '#000000',       // QR Code dots color layer
                light: '#FFFFFF'       // Background fill canvas layer
            }
        });

        // Send payload structure back to the phone app wrapper seamlessly
        res.json({
            success: true,
            amount: amount,
            qr_image: realQrBase64
        });

    } catch (error) {
        console.error("Internal canvas matrix encoding crash:", error);
        res.status(500).json({ error: "Failed to generate matrix parameters" });
    }
});
