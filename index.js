const express = require("express");
const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");

const app = express();

app.get("/perfil", async (req, res) => {
    try {
        const {
            n = "Membro", ie = "0", i = "000000", l = "1",
            x = "0", m = "1000", s = "Use /sobremim",
            a = "https://cdn.discordapp.com/embed/avatars/0.png"
        } = req.query;

        // 1. REGISTRO DE FONTE (Usando link direto do Google para evitar quadrados)
        // Isso força a Vercel a usar uma fonte real
        try {
            const fontUrl = "https://github.com/google/fonts/raw/main/apache/roboto/Roboto-Bold.ttf";
            const fontRes = await fetch(fontUrl);
            const fontBuffer = Buffer.from(await fontRes.arrayBuffer());
            GlobalFonts.register(fontBuffer, "Roboto");
        } catch (e) {
            console.log("Erro ao carregar fonte, usando fallback");
        }

        const canvas = createCanvas(1000, 600);
        const ctx = canvas.getContext("2d");

        // Função para baixar imagens
        const getImg = async (url) => {
            const r = await fetch(url);
            if (!r.ok) throw new Error("Erro imagem");
            return await loadImage(Buffer.from(await r.arrayBuffer()));
        };

        const fundoUrl = "https://i.postimg.cc/Sx6rgWhp/In-Shot-20260506-050947511.jpg";
        
        // Carregar tudo
        const [imgFundo, imgAvatar] = await Promise.all([
            getImg(fundoUrl),
            getImg(a).catch(() => getImg("https://cdn.discordapp.com/embed/avatars/0.png"))
        ]);

        // Desenhar Fundo e Overlay
        ctx.drawImage(imgFundo, 0, 0, 1000, 600);
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(0, 300, 1000, 300);

        // Avatar Redondo
        ctx.save();
        ctx.beginPath();
        ctx.arc(110, 410, 80, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(imgAvatar, 30, 330, 160, 160);
        ctx.restore();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        ctx.stroke();

        // --- TEXTOS ---
        ctx.fillStyle = "white";
        
        // Nome
        ctx.font = "50px Roboto, sans-serif";
        ctx.fillText(n.toUpperCase(), 220, 385);

        // ID e IENE
        ctx.font = "26px Roboto, sans-serif";
        ctx.fillText(`ID: ${i}`, 220, 435);
        ctx.fillText(`IENE: ${ie}`, 220, 480);

        // Level e XP (Valores)
        ctx.font = "bold 35px Roboto, sans-serif";
        ctx.fillText("LEVEL", 650, 395);
        ctx.fillText("XP", 860, 395);

        ctx.font = "bold 60px Roboto, sans-serif";
        ctx.fillText(l, 690, 470);
        
        ctx.font = "22px Roboto, sans-serif";
        ctx.fillText(`${x}/${m}`, 800, 470);

        // --- BARRA DE XP (Cálculo Corrigido) ---
        const xpAtual = Number(x.toString().replace(/\D/g, '')) || 0;
        const xpMax = Number(m.toString().replace(/\D/g, '')) || 1000;
        const progresso = Math.min(xpAtual / xpMax, 1) * 280;

        // Fundo da barra
        ctx.fillStyle = "#2b2b2b";
        ctx.beginPath();
        ctx.roundRect(650, 520, 280, 25, 12);
        ctx.fill();

        // Preenchimento verde
        ctx.fillStyle = "#00ff88";
        ctx.beginPath();
        ctx.roundRect(650, 520, progresso > 0 ? progresso : 1, 25, 12);
        ctx.fill();

        // Sobre Mim
        ctx.fillStyle = "white";
        ctx.font = "bold 35px Roboto, sans-serif";
        ctx.fillText("SOBRE MIM", 30, 555);
        ctx.font = "20px Roboto, sans-serif";
        ctx.fillText(s, 30, 590);

        const buffer = canvas.toBuffer("image/png");
        res.setHeader("Content-Type", "image/png");
        res.send(buffer);

    } catch (err) {
        console.error(err);
        res.status(500).send("Erro interno no servidor");
    }
});

module.exports = app;
