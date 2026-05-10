const express = require("express");
const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");

const app = express();

// Fonte embutida via CDN do jsDelivr (mais confiável na Vercel)
let fontCarregada = false;

async function carregarFonte() {
    if (fontCarregada) return;
    try {
        const url = "https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.8/files/roboto-latin-700-normal.woff2";
        const r = await fetch(url);
        const b = Buffer.from(await r.arrayBuffer());
        GlobalFonts.register(b, "Roboto");
        fontCarregada = true;
        console.log("✅ Fonte carregada com sucesso");
    } catch (e) {
        console.error("❌ Erro ao carregar fonte:", e.message);
    }
}

// Pré-carrega a fonte ao iniciar
carregarFonte();

app.get("/perfil", async (req, res) => {
    try {
        const {
            n = "Membro", ie = "0", i = "000000", l = "1",
            x = "0", m = "1000", s = "Use /sobremim",
            a = "https://cdn.discordapp.com/embed/avatars/0.png"
        } = req.query;

        await carregarFonte();

        const canvas = createCanvas(1000, 600);
        const ctx = canvas.getContext("2d");

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

        ctx.drawImage(imgFundo, 0, 0, 1000, 600);

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 300, 1000, 300);

        ctx.save();
        ctx.beginPath();
        ctx.arc(110, 410, 80, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(imgAvatar, 30, 330, 160, 160);
        ctx.restore();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 6;
        ctx.stroke();

        // Verifica se a fonte foi carregada, senão usa fallback
        const fonte = fontCarregada ? "Roboto" : "serif";

        ctx.fillStyle = "white";
        
        ctx.font = `bold 50px ${fonte}`;
        ctx.fillText(n.toUpperCase(), 220, 380);

        ctx.font = `28px ${fonte}`;
        ctx.fillText(`ID: ${i}`, 220, 430);
        ctx.fillText(`IENE: ${ie}`, 220, 475);

        ctx.font = `bold 35px ${fonte}`;
        ctx.fillText("LEVEL", 650, 390);
        ctx.fillText("XP", 860, 390);

        ctx.font = `bold 65px ${fonte}`;
        ctx.fillText(l, 690, 470);
        ctx.font = `24px ${fonte}`;
        ctx.fillText(`${x}/${m}`, 790, 470);

        const xpAtual = Number(String(x).replace(/\D/g, '')) || 0;
        const xpMax = Number(String(m).replace(/\D/g, '')) || 1;
        const larguraXP = Math.min(xpAtual / xpMax, 1) * 280;

        ctx.fillStyle = "#2b2b2b";
        ctx.beginPath();
        ctx.roundRect(650, 520, 280, 25, 12);
        ctx.fill();

        if (larguraXP > 0) {
            ctx.fillStyle = "#00ff88";
            ctx.beginPath();
            ctx.roundRect(650, 520, larguraXP, 25, 12);
            ctx.fill();
        }

        ctx.fillStyle = "white";
        ctx.font = `bold 35px ${fonte}`;
        ctx.fillText("SOBRE MIM", 30, 555);
        ctx.font = `22px ${fonte}`;
        ctx.fillText(s, 30, 590);

        res.setHeader("Content-Type", "image/png");
        res.send(canvas.toBuffer("image/png"));

    } catch (err) {
        console.error(err);
        res.status(500).send("Erro na API");
    }
});

module.exports = app;
