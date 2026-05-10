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

        // Função para garantir que a imagem baixou antes de desenhar
        async function carregarImg(url) {
            const r = await fetch(url);
            const buffer = Buffer.from(await r.arrayBuffer());
            return await loadImage(buffer);
        }

        const fundoUrl = "https://i.postimg.cc/Sx6rgWhp/In-Shot-20260506-050947511.jpg";
        
        // Espera carregar TUDO antes de começar a desenhar
        const [imgFundo, imgAvatar] = await Promise.all([
            carregarImg(fundoUrl),
            carregarImg(a).catch(() => carregarImg("https://cdn.discordapp.com/embed/avatars/0.png"))
        ]);

        // --- CAMADA 1: FUNDO (O que fica mais atrás) ---
        ctx.drawImage(imgFundo, 0, 0, 1000, 600);

        // --- CAMADA 2: OVERLAY (O retângulo escuro) ---
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 300, 1000, 300);

        // --- CAMADA 3: AVATAR ---
        ctx.save();
        ctx.beginPath();
        ctx.arc(110, 410, 80, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(imgAvatar, 30, 330, 160, 160);
        ctx.restore();
        
        // Borda do avatar
        ctx.strokeStyle = "white";
        ctx.lineWidth = 6;
        ctx.stroke();

        // --- CAMADA 4: TEXTOS (O que fica na frente de TUDO) ---
        ctx.fillStyle = "white";
        
        // Nome (Se certificar que a cor é branca e está em cima)
        ctx.font = "bold 50px sans-serif";
        ctx.fillText(n.toUpperCase(), 220, 380);

        // Infos
        ctx.font = "28px sans-serif";
        ctx.fillText(`ID: ${i}`, 220, 430);
        ctx.fillText(`IENE: ${ie}`, 220, 475);

        // Level e XP
        ctx.font = "bold 35px sans-serif";
        ctx.fillText("LEVEL", 650, 390);
        ctx.fillText("XP", 860, 390);

        ctx.font = "bold 65px sans-serif";
        ctx.fillText(l, 690, 470);
        ctx.font = "24px sans-serif";
        ctx.fillText(`${x}/${m}`, 790, 470);

        // Barra de XP
        const larguraXP = Math.min(Number(x) / Number(m), 1) * 280;
        ctx.fillStyle = "#2b2b2b";
        ctx.beginPath();
        ctx.roundRect(650, 520, 280, 25, 12);
        ctx.fill();

        ctx.fillStyle = "#00ff88"; // Cor da barra
        ctx.beginPath();
        ctx.roundRect(650, 520, larguraXP, 25, 12);
        ctx.fill();

        // Sobre Mim
        ctx.fillStyle = "white";
        ctx.font = "bold 35px sans-serif";
        ctx.fillText("SOBRE MIM", 30, 555);
        ctx.font = "22px sans-serif";
        ctx.fillText(s, 30, 590);

        // Envia para o bot
        res.setHeader("Content-Type", "image/png");
        res.send(canvas.toBuffer("image/png"));

    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao gerar imagem");
    }
});

module.exports = app;
