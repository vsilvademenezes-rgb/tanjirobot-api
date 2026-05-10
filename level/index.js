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

        // Avatar quadrado à direita
        ctx.drawImage(imgAvatar, 770, 10, 270, 270);

        // Nome grande à esquerda
        ctx.fillStyle = "white";
        ctx.font = `bold 75px ${fonte}`;
        ctx.textAlign = "left";
        ctx.fillText(n, 40, 110);

        // XP à esquerda e Level à direita (antes do avatar)
        ctx.font = `28px ${fonte}`;
        ctx.fillStyle = "#aaaaaa";
        ctx.textAlign = "left";
        ctx.fillText(`${x} / ${m} xp`, 40, 185);

        ctx.textAlign = "right";
        ctx.fillText(`Level ${l}`, 750, 185);

        // Barra de XP (não passa pelo avatar)
        const xpAtual = Number(String(x).replace(/\D/g, '')) || 0;
        const xpMax = Number(String(m).replace(/\D/g, '')) || 1;
        const larguraBarra = Math.min(xpAtual / xpMax, 1) * 710;

        ctx.fillStyle = "#2b2b2b";
        ctx.beginPath();
        ctx.roundRect(40, 220, 710, 25, 12);
        ctx.fill();

        if (larguraBarra > 0) {
            ctx.fillStyle = "#00ff88";
            ctx.beginPath();
            ctx.roundRect(40, 220, larguraBarra, 25, 12);
            ctx.fill();
        }

        res.setHeader("Content-Type", "image/png");
        res.send(canvas.toBuffer("image/png"));

    } catch (err) {
        console.error(err);
        res.status(500).send("Erro na API");
    }
});

module.exports = app;
