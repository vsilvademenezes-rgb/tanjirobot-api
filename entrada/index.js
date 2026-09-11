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
    } catch (e) {
        console.error("❌ Erro ao carregar fonte:", e.message);
    }
}

carregarFonte();

async function getImg(url) {
    const r = await fetch(url);
    const b = Buffer.from(await r.arrayBuffer());
    return await loadImage(b);
}

// ========================
// ROTA: ENTRADA
// ========================
app.get("/entrada", async (req, res) => {
    try {
        const {
            n = "Membro",
            a = "https://cdn.discordapp.com/embed/avatars/0.png",
            fundo = ""
        } = req.query;

        await carregarFonte();

        const canvas = createCanvas(1024, 500);
        const ctx = canvas.getContext("2d");
        const fonte = fontCarregada ? "Roboto" : "serif";

        // Fundo
        if (fundo) {
            try {
                const imgFundo = await getImg(fundo);
                ctx.drawImage(imgFundo, 0, 0, 1024, 500);
            } catch {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, 1024, 500);
            }
        } else {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, 1024, 500);
        }

        // Overlay leve
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillRect(0, 0, 1024, 500);

        // Avatar circular
        const imgAvatar = await getImg(a).catch(() =>
            getImg("https://cdn.discordapp.com/embed/avatars/0.png")
        );
        ctx.save();
        ctx.beginPath();
        ctx.arc(512, 170, 120, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(imgAvatar, 392, 50, 240, 240);
        ctx.restore();

        // Borda do avatar verde
        ctx.strokeStyle = "#00cc44";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(512, 170, 120, 0, Math.PI * 2);
        ctx.stroke();

        // Texto BEM-VINDO(A)
        ctx.font = `bold 80px ${fonte}`;
        ctx.textAlign = "center";

        // Sombra
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillText("BEM-VINDO(A)", 515, 358);

        // Gradiente no texto
        const gradTexto = ctx.createLinearGradient(200, 0, 824, 0);
        gradTexto.addColorStop(0, "#00cc44");
        gradTexto.addColorStop(1, "#0088ff");
        ctx.fillStyle = gradTexto;
        ctx.fillText("BEM-VINDO(A)", 512, 355);

        // Nome do usuário
        ctx.font = `bold 40px ${fonte}`;
        ctx.fillStyle = "#0088ff";
        ctx.fillText(n, 512, 420);

        res.setHeader("Content-Type", "image/png");
        res.send(canvas.toBuffer("image/png"));

    } catch (err) {
        console.error(err);
        res.status(500).send("Erro na API");
    }
});

// ========================
// ROTA: SAÍDA
// ========================
app.get("/saida", async (req, res) => {
    try {
        const {
            n = "Membro",
            a = "https://cdn.discordapp.com/embed/avatars/0.png",
            fundo = ""
        } = req.query;

        await carregarFonte();

        const canvas = createCanvas(1024, 500);
        const ctx = canvas.getContext("2d");
        const fonte = fontCarregada ? "Roboto" : "serif";

        // Fundo
        if (fundo) {
            try {
                const imgFundo = await getImg(fundo);
                ctx.drawImage(imgFundo, 0, 0, 1024, 500);
            } catch {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, 1024, 500);
            }
        } else {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, 1024, 500);
        }

        // Overlay leve
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillRect(0, 0, 1024, 500);

        // Avatar circular
        const imgAvatar = await getImg(a).catch(() =>
            getImg("https://cdn.discordapp.com/embed/avatars/0.png")
        );
        ctx.save();
        ctx.beginPath();
        ctx.arc(512, 170, 120, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(imgAvatar, 392, 50, 240, 240);
        ctx.restore();

        // Borda do avatar vermelha
        ctx.strokeStyle = "#ff2222";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(512, 170, 120, 0, Math.PI * 2);
        ctx.stroke();

        // Texto SAIU DO SERVIDOR
        ctx.font = `bold 80px ${fonte}`;
        ctx.textAlign = "center";

        // Sombra
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillText("SAIU DO SERVIDOR", 515, 358);

        // Gradiente no texto vermelho
        const gradTexto = ctx.createLinearGradient(200, 0, 824, 0);
        gradTexto.addColorStop(0, "#ff2222");
        gradTexto.addColorStop(1, "#ff8800");
        ctx.fillStyle = gradTexto;
        ctx.fillText("SAIU DO SERVIDOR", 512, 355);

        // Nome do usuário
        ctx.font = `bold 40px ${fonte}`;
        ctx.fillStyle = "#ff2222";
        ctx.fillText(n, 512, 420);

        res.setHeader("Content-Type", "image/png");
        res.send(canvas.toBuffer("image/png"));

    } catch (err) {
        console.error(err);
        res.status(500).send("Erro na API");
    }
});

module.exports = app;
