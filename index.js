const express = require("express");
const { createCanvas, loadImage } = require("@napi-rs/canvas");

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

        const canvas = createCanvas(1000, 600);
        const ctx = canvas.getContext("2d");

        // Função de download de imagem
        async function getImg(url) {
            const r = await fetch(url);
            const b = Buffer.from(await r.arrayBuffer());
            return await loadImage(b);
        }

        const fundoUrl = "https://i.postimg.cc/Sx6rgWhp/In-Shot-20260506-050947511.jpg";
        
        // Baixa as fotos primeiro
        const [imgFundo, imgAvatar] = await Promise.all([
            getImg(fundoUrl),
            getImg(a).catch(() => getImg("https://cdn.discordapp.com/embed/avatars/0.png"))
        ]);

        // 1. DESENHA O FUNDO
        ctx.drawImage(imgFundo, 0, 0, 1000, 600);

        // 2. DESENHA O OVERLAY ESCURO
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 300, 1000, 300);

        // 3. DESENHA O AVATAR CIRCULAR
        ctx.save();
        ctx.beginPath();
        ctx.arc(110, 410, 80, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(imgAvatar, 30, 330, 160, 160);
        ctx.restore();
        
        ctx.strokeStyle = "white";
        ctx.lineWidth = 6;
        ctx.stroke();

        // 4. TRUQUE MESTRE: DESENHAR O TEXTO COMO SVG (Resolve o erro da Vercel)
        const larguraXP = Math.min(Number(x) / Number(m), 1) * 280;

        const svgData = `
        <svg width="1000" height="600" xmlns="http://www.w3.org/2000/svg">
            <style>
                .t { fill: white; font-family: sans-serif; font-weight: bold; }
            </style>
            <text x="220" y="380" class="t" font-size="50">${n.toUpperCase()}</text>
            <text x="220" y="430" class="t" font-size="25" font-weight="normal">ID: ${i}</text>
            <text x="220" y="475" class="t" font-size="25" font-weight="normal">IENE: ${ie}</text>
            
            <text x="650" y="390" class="t" font-size="35">LEVEL</text>
            <text x="860" y="390" class="t" font-size="35">XP</text>
            <text x="690" y="470" class="t" font-size="65">${l}</text>
            <text x="790" y="470" class="t" font-size="22" font-weight="normal">${x}/${m}</text>
            
            <rect x="650" y="520" width="280" height="25" rx="12" fill="#2b2b2b" />
            <rect x="650" y="520" width="${larguraXP}" height="25" rx="12" fill="#00ff88" />
            
            <text x="30" y="555" class="t" font-size="35">SOBRE MIM</text>
            <text x="30" y="590" class="t" font-size="20" font-weight="normal">${s}</text>
        </svg>`;

        // Converte o SVG em uma imagem e "carimba" por cima do canvas
        const svgBuffer = Buffer.from(svgData);
        const imgTexto = await loadImage(`data:image/svg+xml;base64,${svgBuffer.toString('base64')}`);
        ctx.drawImage(imgTexto, 0, 0);

        // Retorna a imagem final
        res.setHeader("Content-Type", "image/png");
        res.send(canvas.toBuffer("image/png"));

    } catch (err) {
        console.error(err);
        res.status(500).send("Erro fatal na renderização");
    }
});

module.exports = app;
