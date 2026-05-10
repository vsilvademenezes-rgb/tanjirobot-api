const express = require("express");
const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const path = require("path");

const app = express();

// Tenta registrar uma fonte do sistema se existir, ou use uma local
// Se você subir um arquivo .ttf, mude o caminho abaixo
try {
    // GlobalFonts.registerFromPath(path.join(__dirname, 'fonts', 'font.ttf'), 'MinhaFonte');
} catch (e) {
    console.log("Aviso: Fonte local não encontrada, usando padrão do sistema.");
}

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

        // Função de download estável
        async function fetchImage(url) {
            const response = await fetch(url);
            const buffer = Buffer.from(await response.arrayBuffer());
            return await loadImage(buffer);
        }

        const fundoUrl = "https://i.postimg.cc/Sx6rgWhp/In-Shot-20260506-050947511.jpg";
        
        const [imgFundo, imgAvatar] = await Promise.all([
            fetchImage(fundoUrl),
            fetchImage(a).catch(() => fetchImage("https://cdn.discordapp.com/embed/avatars/0.png"))
        ]);

        // Desenhar Fundo e Overlay
        ctx.drawImage(imgFundo, 0, 0, 1000, 600);
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 300, 1000, 300);

        // Avatar
        ctx.save();
        ctx.beginPath();
        ctx.arc(110, 410, 80, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(imgAvatar, 30, 330, 160, 160);
        ctx.restore();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 6;
        ctx.stroke();

        // --- CORREÇÃO DAS LETRAS ---
        // Na Vercel, precisamos ser muito específicos com a fonte.
        ctx.fillStyle = "#FFFFFF";
        ctx.textBaseline = "alphabetic"; // Melhora o alinhamento

        // Nome
        ctx.font = "bold 50px sans-serif";
        ctx.fillText(n.toUpperCase(), 220, 380);

        // Subtítulos
        ctx.font = "28px sans-serif";
        ctx.fillText(`ID: ${i}`, 220, 430);
        ctx.fillText(`IENE: ${ie}`, 220, 475);

        // Status
        ctx.font = "bold 35px sans-serif";
        ctx.fillText("LEVEL", 650, 390);
        ctx.fillText("XP", 860, 390);

        ctx.font = "bold 65px sans-serif";
        ctx.fillText(l, 690, 470);
        
        ctx.font = "24px sans-serif";
        ctx.fillText(`${x}/${m}`, 790, 470);

        // Barra XP
        const porcentagem = Math.min(Number(x) / Number(m), 1) * 280;
        ctx.fillStyle = "#2b2b2b";
        ctx.beginPath();
        ctx.roundRect(650, 520, 280, 25, 12);
        ctx.fill();
        ctx.fillStyle = "#00ff88";
        ctx.beginPath();
        ctx.roundRect(650, 520, porcentagem, 25, 12);
        ctx.fill();

        // Sobre Mim
        ctx.fillStyle = "white";
        ctx.font = "bold 35px sans-serif";
        ctx.fillText("SOBRE MIM", 30, 550);
        ctx.font = "22px sans-serif";
        ctx.fillText(s, 30, 585);

        const buffer = canvas.toBuffer("image/png");
        res.setHeader("Content-Type", "image/png");
        res.send(buffer);

    } catch (err) {
        console.error(err);
        res.status(500).send("Erro na geracao: " + err.message);
    }
});

module.exports = app;
