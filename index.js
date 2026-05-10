const express = require("express");
const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");

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

        // --- CORREÇÃO DA FONTE (Baixa uma fonte real para não dar quadrados) ---
        const fontUrl = "https://github.com/google/fonts/raw/main/apache/roboto/Roboto-Bold.ttf";
        const fontRes = await fetch(fontUrl);
        const fontBuffer = Buffer.from(await fontRes.arrayBuffer());
        GlobalFonts.register(fontBuffer, "Roboto");

        const canvas = createCanvas(1000, 600);
        const ctx = canvas.getContext("2d");

        // Função para carregar imagens
        async function getImg(url) {
            const r = await fetch(url);
            const b = Buffer.from(await r.arrayBuffer());
            return await loadImage(b);
        }

        const fundoUrl = "https://i.postimg.cc/Sx6rgWhp/In-Shot-20260506-050947511.jpg";
        
        const [imgFundo, imgAvatar] = await Promise.all([
            getImg(fundoUrl),
            getImg(a).catch(() => getImg("https://cdn.discordapp.com/embed/avatars/0.png"))
        ]);

        // 1. Fundo
        ctx.drawImage(imgFundo, 0, 0, 1000, 600);

        // 2. Overlay
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 300, 1000, 600);

        // 3. Avatar redondo
        ctx.save();
        ctx.beginPath();
        ctx.arc(110, 410, 80, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(imgAvatar, 30, 330, 160, 160);
        ctx.restore();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 6;
        ctx.stroke();

        // 4. TEXTOS (Agora usando a fonte Roboto que baixamos)
        ctx.fillStyle = "white";
        
        // Nome
        ctx.font = "bold 50px Roboto";
        ctx.fillText(n.toUpperCase(), 220, 380);

        // Infos
        ctx.font = "28px Roboto";
        ctx.fillText(`ID: ${i}`, 220, 430);
        ctx.fillText(`IENE: ${ie}`, 220, 475);

        // Level e XP
        ctx.font = "bold 35px Roboto";
        ctx.fillText("LEVEL", 650, 390);
        ctx.fillText("XP", 860, 390);

        ctx.font = "bold 65px Roboto";
        ctx.fillText(l, 690, 470);

        ctx.font = "24px Roboto";
        ctx.fillText(`${x}/${m}`, 790, 470);

        // --- CORREÇÃO DA BARRA DE XP ---
        // Convertendo para número para garantir que o cálculo funcione
        const atualXP = parseFloat(x) || 0;
        const maxXP = parseFloat(m) || 1000;
        const larguraXP = Math.min(atualXP / maxXP, 1) * 280;

        // Fundo da barra
        ctx.fillStyle = "#2b2b2b";
        ctx.beginPath();
        ctx.roundRect(650, 520, 280, 25, 12);
        ctx.fill();

        // Progresso verde
        ctx.fillStyle = "#00ff88";
        ctx.beginPath();
        ctx.roundRect(650, 520, larguraXP, 25, 12);
        ctx.fill();

        // Sobre Mim
        ctx.fillStyle = "white";
        ctx.font = "bold 35px Roboto";
        ctx.fillText("SOBRE MIM", 30, 555);
        ctx.font = "22px Roboto";
        ctx.fillText(s, 30, 590);

        res.setHeader("Content-Type", "image/png");
        res.send(canvas.toBuffer("image/png"));

    } catch (err) {
        console.error(err);
        res.status(500).send("Erro: " + err.message);
    }
});

module.exports = app;
