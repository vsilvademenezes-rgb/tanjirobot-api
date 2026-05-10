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

        // Criar o canvas baseado no tamanho da sua imagem de fundo
        const canvas = createCanvas(1000, 600);
        const ctx = canvas.getContext("2d");

        // Links das imagens
        const fundoUrl = "https://i.postimg.cc/Sx6rgWhp/In-Shot-20260506-050947511.jpg";
        
        // Carregar imagens (Fundo e Avatar)
        const [imgFundo, imgAvatar] = await Promise.all([
            loadImage(fundoUrl),
            loadImage(a).catch(() => loadImage("https://cdn.discordapp.com/embed/avatars/0.png"))
        ]);

        // 1. Desenhar Fundo
        ctx.drawImage(imgFundo, 0, 0, 1000, 600);

        // 2. Overlay Escuro
        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        ctx.fillRect(0, 300, 1000, 300);

        // 3. Desenhar Avatar Circular
        ctx.save();
        ctx.beginPath();
        ctx.arc(110, 410, 80, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(imgAvatar, 30, 330, 160, 160);
        ctx.restore();

        // Borda branca do avatar
        ctx.strokeStyle = "white";
        ctx.lineWidth = 6;
        ctx.stroke();

        // 4. CONFIGURAÇÃO DE TEXTO (Ajustado para Vercel)
        ctx.fillStyle = "white";
        ctx.textBaseline = "top";

        // Nome
        ctx.font = "bold 45px sans-serif";
        ctx.fillText(n.toUpperCase(), 220, 340);

        // Informações (ID e IENE)
        ctx.font = "25px sans-serif";
        ctx.fillText(`ID: ${i}`, 220, 400);
        ctx.fillText(`IENE: ${ie}`, 220, 440);

        // Level e XP (Títulos)
        ctx.font = "bold 30px sans-serif";
        ctx.fillText("LEVEL", 650, 350);
        ctx.fillText("XP", 860, 350);

        // Valores Level e XP
        ctx.font = "bold 60px sans-serif";
        ctx.fillText(l, 680, 400);
        
        ctx.font = "20px sans-serif";
        ctx.fillText(`${x} / ${m}`, 810, 415);

        // 5. BARRA DE XP
        const larguraBarra = 280;
        const porcentagem = Math.min(Number(x) / Number(m), 1) * larguraBarra;

        // Fundo da barra
        ctx.fillStyle = "#2b2b2b";
        ctx.beginPath();
        ctx.roundRect(650, 500, larguraBarra, 30, 15);
        ctx.fill();

        // Progresso verde
        ctx.fillStyle = "#00ff88";
        ctx.beginPath();
        ctx.roundRect(650, 500, porcentagem, 30, 15);
        ctx.fill();

        // 6. SOBRE MIM
        ctx.fillStyle = "white";
        ctx.font = "bold 35px sans-serif";
        ctx.fillText("SOBRE MIM", 30, 520);
        
        ctx.font = "20px sans-serif";
        ctx.fillText(s, 30, 560);

        // Gerar Buffer final
        const buffer = canvas.toBuffer("image/png");
        res.setHeader("Content-Type", "image/png");
        res.status(200).send(buffer);

    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao processar imagem");
    }
});

module.exports = app;
