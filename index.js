const express = require("express");
const { createCanvas, loadImage } = require("@napi-rs/canvas");
const axios = require("axios");

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

        // Função para baixar imagem e converter em buffer (Mais seguro na Vercel)
        const fetchImage = async (url) => {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            return Buffer.from(response.data, 'binary');
        };

        const fundoUrl = "https://i.postimg.cc/Sx6rgWhp/In-Shot-20260506-050947511.jpg";

        // Baixa o fundo e o avatar primeiro
        const [bufferFundo, bufferAvatar] = await Promise.all([
            fetchImage(fundoUrl),
            fetchImage(a).catch(() => fetchImage("https://cdn.discordapp.com/embed/avatars/0.png"))
        ]);

        const [imgFundo, imgAvatar] = await Promise.all([
            loadImage(bufferFundo),
            loadImage(bufferAvatar)
        ]);

        const canvas = createCanvas(1000, 600);
        const ctx = canvas.getContext("2d");

        // 1. Desenhar Fundo
        ctx.drawImage(imgFundo, 0, 0, 1000, 600);

        // 2. Overlay Escuro
        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        ctx.fillRect(0, 300, 1000, 300);

        // 3. Avatar Circular
        ctx.save();
        ctx.beginPath();
        ctx.arc(110, 410, 80, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(imgAvatar, 30, 330, 160, 160);
        ctx.restore();

        // Borda do Avatar
        ctx.strokeStyle = "white";
        ctx.lineWidth = 6;
        ctx.stroke();

        // 4. Desenhar Textos (Forçando cor e fonte)
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "left";

        // Nome
        ctx.font = "bold 45px sans-serif";
        ctx.fillText(n.toUpperCase(), 220, 380);

        // Informações
        ctx.font = "25px sans-serif";
        ctx.fillText(`ID: ${i}`, 220, 430);
        ctx.fillText(`IENE: ${ie}`, 220, 470);

        // Level e XP
        ctx.font = "bold 35px sans-serif";
        ctx.fillText("LEVEL", 650, 390);
        ctx.fillText("XP", 860, 390);

        ctx.font = "bold 60px sans-serif";
        ctx.fillText(l, 690, 470);

        ctx.font = "24px sans-serif";
        ctx.fillText(`${x} / ${m}`, 790, 470);

        // 5. Barra de XP
        const porcentagem = Math.min(Number(x) / Number(m), 1) * 280;
        ctx.fillStyle = "#2b2b2b";
        ctx.beginPath();
        ctx.roundRect(650, 510, 280, 25, 12);
        ctx.fill();

        ctx.fillStyle = "#00ff88";
        ctx.beginPath();
        ctx.roundRect(650, 510, porcentagem, 25, 12);
        ctx.fill();

        // 6. Sobre Mim
        ctx.fillStyle = "white";
        ctx.font = "bold 35px sans-serif";
        ctx.fillText("SOBRE MIM", 30, 545);
        
        ctx.font = "22px sans-serif";
        ctx.fillText(s, 30, 580);

        const bufferFinal = canvas.toBuffer("image/png");
        res.setHeader("Content-Type", "image/png");
        res.status(200).send(bufferFinal);

    } catch (err) {
        console.error("ERRO NA API:", err);
        res.status(500).send("Erro ao gerar imagem");
    }
});

module.exports = app;
