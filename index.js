const express = require("express");
const path = require("path"); // Importante para caminhos de arquivos
const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");

const app = express();

// --- REGISTRO DE FONTE ---
// Isso registra a fonte para que o Canvas a reconheça no ambiente Linux do Vercel
const fontPath = path.join(process.cwd(), "fonts", "DejaVuSans.ttf");
GlobalFonts.registerFromPath(fontPath, "DejaVu Sans");

app.get("/perfil.png", async (req, res) => {
    try {
        const {
            nome = "Membro",
            iene = "0",
            id = "000000",
            lvl = "1",
            xp = "0",
            maxxp = "1000",
            sobre = "Use /sobremim",
            avatar = "https://cdn.discordapp.com/embed/avatars/0.png"
        } = req.query;

        const canvas = createCanvas(1000, 600);
        const ctx = canvas.getContext("2d");

        // FUNDO
        const bg = await loadImage("https://i.postimg.cc/Sx6rgWhp/In-Shot-20260506-050947511.jpg");
        ctx.drawImage(bg, 0, 0, 1000, 600);

        // OVERLAY
        ctx.fillStyle = "rgba(0,0,0,0.65)";
        ctx.fillRect(0, 300, 1000, 300);

        // AVATAR (Simplificado para evitar erros de WebP/PNG)
        const avatarURL = avatar.replace(".webp", ".png").split("?")[0];
        try {
            const avatarImg = await loadImage(avatarURL);
            const avX = 30;
            const avY = 320;
            const avSize = 160;
            const radius = avSize / 2;

            ctx.save();
            ctx.beginPath();
            ctx.arc(avX + radius, avY + radius, radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatarImg, avX, avY, avSize, avSize);
            ctx.restore();

            // Borda do Avatar
            ctx.beginPath();
            ctx.arc(avX + radius, avY + radius, radius, 0, Math.PI * 2);
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 6;
            ctx.stroke();
        } catch (e) {
            console.error("Erro ao carregar avatar:", e);
        }

        // --- RENDERIZAÇÃO DE TEXTO ---
        ctx.fillStyle = "#ffffff";

        // Nome (Note que usamos o nome que registramos em GlobalFonts)
        ctx.font = "bold 48px DejaVu Sans";
        ctx.fillText(nome.toUpperCase(), 220, 380);

        // Info
        ctx.font = "28px DejaVu Sans";
        ctx.fillText(`ID: ${id}`, 220, 430);
        ctx.fillText(`IENE: ${iene}`, 220, 475);

        // Level
        ctx.font = "bold 40px DejaVu Sans";
        ctx.fillText("LEVEL", 650, 390);
        ctx.font = "bold 65px DejaVu Sans";
        ctx.fillText(lvl, 700, 470);

        // XP
        ctx.font = "bold 40px DejaVu Sans";
        ctx.fillText("XP", 860, 390);
        ctx.font = "26px DejaVu Sans";
        ctx.fillText(`${xp} / ${maxxp}`, 790, 470);

        // BARRA XP
        const barX = 650;
        const barY = 520;
        const barWidth = 280;
        const barHeight = 25;
        const porcentagem = Math.min(Number(xp) / Number(maxxp), 1);

        ctx.fillStyle = "#2b2b2b";
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = "#00ff88";
        ctx.fillRect(barX, barY, barWidth * porcentagem, barHeight);

        // SOBRE MIM
        ctx.fillStyle = "#ffffff";
        ctx.font = "40px DejaVu Sans";
        ctx.fillText("SOBRE MIM", 20, 555);

        ctx.font = "24px DejaVu Sans";
        let sobreTexto = sobre.length > 60 ? sobre.substring(0, 57) + "..." : sobre;
        ctx.fillText(sobreTexto, 20, 590);

        // ENVIAR IMAGEM
        const buffer = canvas.toBuffer("image/png");
        res.setHeader("Content-Type", "image/png");
        res.send(buffer);

    } catch (err) {
        console.error(err);
        res.status(500).send("Erro interno ao gerar imagem");
    }
});

module.exports = app;

