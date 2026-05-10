const express = require("express");
const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");

const app = express();

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

carregarFonte();

app.get("/level", async (req, res) => {
    try {
        const {
            n = "Membro",
            x = "0",
            m = "200",
            l = "0",
            a = "https://cdn.discordapp.com/embed/avatars/0.png"
        } = req.query;

        await carregarFonte();

        const canvas = createCanvas(900, 200);
        const ctx = canvas.getContext("2d");

        async function getImg(url) {
            const r = await fetch(url);
            const b = Buffer.from(await r.arrayBuffer());
            return await loadImage(b);
        }

        const imgAvatar = await getImg(a).catch(() => 
            getImg("https://cdn.discordapp.com/embed/avatars/0.png")
        );

        // Fundo preto
        ctx.fillStyle = "#111111";
        ctx.fillRect(0, 0, 900, 200);

        const fonte = fontCarregada ? "Roboto" : "serif";

        // Nome grande à esquerda
        ctx.fillStyle = "white";
        ctx.font = `bold 60px ${fonte}`;
        ctx.textAlign = "left";
        ctx.fillText(n, 30, 90);

        // XP e Level
        ctx.font = `24px ${fonte}`;
        ctx.fillStyle = "#aaaaaa";
        ctx.fillText(`${x} / ${m} xp`, 30, 140);

        ctx.textAlign = "right";
        ctx.fillText(`Level ${l}`, 670, 140);

        // Barra de XP
        const xpAtual = Number(String(x).replace(/\D/g, '')) || 0;
        const xpMax = Number(String(m).replace(/\D/g, '')) || 1;
        const larguraBarra = Math.min(xpAtual / xpMax, 1) * 640;

        ctx.fillStyle = "#2b2b2b";
        ctx.beginPath();
        ctx.roundRect(30, 155, 640, 20, 10);
        ctx.fill();

        if (larguraBarra > 0) {
            ctx.fillStyle = "#00ff88";
            ctx.beginPath();
            ctx.roundRect(30, 155, larguraBarra, 20, 10);
            ctx.fill();
        }

        // Avatar quadrado à direita
        ctx.drawImage(imgAvatar, 710, 10, 180, 180);

        res.setHeader("Content-Type", "image/png");
        res.send(canvas.toBuffer("image/png"));

    } catch (err) {
        console.error(err);
        res.status(500).send("Erro na API");
    }
});

module.exports = app;
