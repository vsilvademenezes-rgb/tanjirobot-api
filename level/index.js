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

        const canvas = createCanvas(1050, 300);
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
        ctx.fillRect(0, 0, 1050, 300);

        const fonte = fontCarregada ? "Roboto" : "serif";

        // Nome grande à esquerda
        ctx.fillStyle = "white";
        ctx.font = `bold 80px ${fonte}`;
        ctx.textAlign = "left";
        ctx.fillText(n, 40, 130);

        // XP e Level
        ctx.font = `30px ${fonte}`;
        ctx.fillStyle = "#aaaaaa";
        ctx.fillText(`${x} / ${m} xp`, 40, 200);

        ctx.textAlign = "right";
        ctx.fillText(`Level ${l}`, 780, 200);

        // Barra de XP
        const xpAtual = Number(String(x).replace(/\D/g, '')) || 0;
        const xpMax = Number(String(m).replace(/\D/g, '')) || 1;
        const larguraBarra = Math.min(xpAtual / xpMax, 1) * 740;

        ctx.fillStyle = "#2b2b2b";
        ctx.beginPath();
        ctx.roundRect(40, 225, 740, 25, 12);
        ctx.fill();

        if (larguraBarra > 0) {
            ctx.fillStyle = "#00ff88";
            ctx.beginPath();
            ctx.roundRect(40, 225, larguraBarra, 25, 12);
            ctx.fill();
        }

        // Avatar quadrado à direita
        ctx.drawImage(imgAvatar, 760, 10, 280, 280);

        res.setHeader("Content-Type", "image/png");
        res.send(canvas.toBuffer("image/png"));

    } catch (err) {
        console.error(err);
        res.status(500).send("Erro na API");
    }
});

module.exports = app;
