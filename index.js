const express = require("express");
const { createCanvas, loadImage } = require("@napi-rs/canvas");

const app = express();

app.get("/perfil.png", async (req, res) => {
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

        // Criar o canvas
        const canvas = createCanvas(1000, 600);
        const ctx = canvas.getContext("2d");

        // Função para baixar imagens com timeout para não travar a Vercel
        const getImage = async (url) => {
            const res = await fetch(url);
            if (!res.ok) throw new Error("Erro ao baixar imagem");
            const arrayBuffer = await res.arrayBuffer();
            return loadImage(Buffer.from(arrayBuffer));
        };

        const fundoUrl = "https://i.postimg.cc/Sx6rgWhp/In-Shot-20260506-050947511.jpg";

        // Carregar imagens primeiro
        const [imgFundo, imgAvatar] = await Promise.all([
            getImage(fundoUrl),
            getImage(a).catch(() => getImage("https://cdn.discordapp.com/embed/avatars/0.png"))
        ]);

        // 1. Desenhar Fundo
        ctx.drawImage(imgFundo, 0, 0, 1000, 600);

        // 2. Overlay Escuro
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 300, 1000, 300);

        // 3. Avatar Circular
        ctx.save();
        ctx.beginPath();
        ctx.arc(110, 410, 80, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(imgAvatar, 30, 330, 160, 160);
        ctx.restore();

        // Borda branca do avatar
        ctx.strokeStyle = "white";
        ctx.lineWidth = 6;
        ctx.stroke();

        // 4. DESENHO DOS TEXTOS (Corrigido para aparecer sempre)
        ctx.fillStyle = "#FFFFFF";
        
        // Nome
        ctx.font = "bold 50px Arial, sans-serif";
        ctx.fillText(n.toUpperCase().substring(0, 15), 220, 380);

        // ID e IENE
        ctx.font = "28px Arial, sans-serif";
        ctx.fillText(`ID: ${i}`, 220, 430);
        ctx.fillText(`IENE: ${ie}`, 220, 475);

        // Level e XP
        ctx.font = "bold 40px Arial, sans-serif";
        ctx.fillText("LEVEL", 650, 390);
        ctx.fillText("XP", 860, 390);

        ctx.font = "bold 65px Arial, sans-serif";
        ctx.fillText(l, 690, 470);

        ctx.font = "26px Arial, sans-serif";
        ctx.fillText(`${x}/${m}`, 790, 470);

        // 5. BARRA DE XP
        const larguraMaxima = 280;
        const porcentagem = Math.min(Number(x) / Number(m), 1) * larguraMaxima;

        // Fundo da barra
        ctx.fillStyle = "#2b2b2b";
        ctx.beginPath();
        ctx.roundRect(650, 520, larguraMaxima, 25, 12);
        ctx.fill();

        // Progresso
        ctx.fillStyle = "#00ff88";
        ctx.beginPath();
        ctx.roundRect(650, 520, porcentagem, 25, 12);
        ctx.fill();

        // 6. SOBRE MIM
        ctx.fillStyle = "white";
        ctx.font = "bold 40px Arial, sans-serif";
        ctx.fillText("SOBRE MIM", 30, 555);
        
        ctx.font = "24px Arial, sans-serif";
        ctx.fillText(s.substring(0, 50), 30, 595);

        // Finalizar imagem
        const buffer = canvas.toBuffer("image/png");
        res.setHeader("Content-Type", "image/png");
        res.send(buffer);

    } catch (err) {
        console.error(err);
        res.status(500).send("Erro Interno");
    }
});

module.exports = app;

