const express = require("express");
const sharp = require("sharp");

const app = express();

app.get("/perfil", async (req, res) => {
    try {
        const {
            n = "Membro",
            ie = "0",
            i = "000000",
            l = "1",
            x = "0",
            m = "1000",
            s = "Use /sobremim",
            a = "https://cdn.discordapp.com/embed/avatars/0.png"
        } = req.query;

        // 1. Baixar as imagens (Fundo e Avatar)
        const [fundoBuf, avatarBuf] = await Promise.all([
            fetch("https://i.postimg.cc/Sx6rgWhp/In-Shot-20260506-050947511.jpg").then(r => r.arrayBuffer()),
            fetch(a).then(r => r.arrayBuffer()).catch(() => fetch("https://cdn.discordapp.com/embed/avatars/0.png").then(r => r.arrayBuffer()))
        ]);

        // 2. Processar o Avatar (Deixar redondo)
        const circleShape = Buffer.from('<svg><circle cx="80" cy="80" r="80" /></svg>');
        const avatarRedondo = await sharp(Buffer.from(avatarBuf))
            .resize(160, 160)
            .composite([{ input: circleShape, blend: 'dest-in' }])
            .png()
            .toBuffer();

        // 3. Criar os Textos e Barras usando SVG (Isso resolve o sumiço das letras)
        const larguraXP = Math.min(Number(x) / Number(m), 1) * 280;
        
        const svgTexto = Buffer.from(`
<svg width="1000" height="600" xmlns="http://www.w3.org/2000/svg">
    <style>
        .bold { font-family: sans-serif; font-weight: bold; fill: white; }
        .reg { font-family: sans-serif; fill: white; }
    </style>
    <rect x="0" y="300" width="1000" height="300" fill="black" fill-opacity="0.65" />
    
    <text x="220" y="380" class="bold" font-size="50">${n.toUpperCase()}</text>
    <text x="220" y="430" class="reg" font-size="28">ID: ${i}</text>
    <text x="220" y="475" class="reg" font-size="28">IENE: ${ie}</text>
    
    <text x="650" y="390" class="bold" font-size="35">LEVEL</text>
    <text x="860" y="390" class="bold" font-size="35">XP</text>
    <text x="690" y="470" class="bold" font-size="65">${l}</text>
    <text x="790" y="470" class="reg" font-size="24">${x}/${m}</text>
    
    <rect x="650" y="520" width="280" height="25" rx="12" fill="#2b2b2b" />
    <rect x="650" y="520" width="${larguraXP}" height="25" rx="12" fill="#00ff88" />
    
    <text x="30" y="555" class="bold" font-size="35">SOBRE MIM</text>
    <text x="30" y="590" class="reg" font-size="22">${s}</text>
</svg>`);

        // 4. Montagem Final (Composite)
        const imagemFinal = await sharp(Buffer.from(fundoBuf))
            .resize(1000, 600)
            .composite([
                { input: svgTexto, top: 0, left: 0 },
                { input: avatarRedondo, top: 330, left: 30 }
            ])
            .png()
            .toBuffer();

        res.setHeader("Content-Type", "image/png");
        res.status(200).send(imagemFinal);

    } catch (err) {
        console.error(err);
        res.status(500).send("Erro interno");
    }
});

module.exports = app;
