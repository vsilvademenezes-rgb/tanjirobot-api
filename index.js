const express = require("express");
const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const https = require("https");

const app = express();

// Carrega a fonte uma vez quando o servidor inicia
let fontCarregada = false;

async function carregarFonte() {
    if (fontCarregada) return;
    return new Promise((resolve, reject) => {
        const url = "https://github.com/google/fonts/raw/main/apache/roboto/Roboto%5Bwdth%2Cwght%5D.ttf";
        https.get(url, (res) => {
            const chunks = [];
            res.on("data", chunk => chunks.push(chunk));
            res.on("end", () => {
                const buffer = Buffer.concat(chunks);
                GlobalFonts.register(buffer, "Roboto");
                fontCarregada = true;
                resolve();
            });
            res.on("error", reject);
        }).on("error", reject);
    });
}

app.get("/perfil", async (req, res) => {
    try {
        const {
            n = "Membro", ie = "0", i = "000000", l = "1",
            x = "0", m = "1000", s = "Use /sobremim",
            a = "https://cdn.discordapp.com/embed/avatars/0.png"
        } = req.query;

        await carregarFonte();

        const canvas = createCanvas(1000, 600);
        const ctx = canvas.getContext("2d");

        async function getImg(url) {
            const r = await fetch(url);
            const b = Buffer.from(await r.arrayBuffer());
            return await loadImage(b);
        }

        const fundoUrl = "https://i.postimg.cc/Sx6rgWhp/In-Shot-20260506-050947511.jpg";
        
        const [imgFundo, imgAvatar] = await Promise.all([
            getImg(fundoUrl),
            getImg(a).catch(() => getImg("https://cdn.discordapp.com/embed/avatars/0.png"))
        ]);

        // Camada 1: Fundo
        ctx.drawImage(imgFundo, 0, 0, 1000, 600);

        // Camada 2: Overlay Escuro
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 300, 1000, 300);

        // Camada 3: Avatar Circular
        ctx.save();
        ctx.beginPath();
        ctx.arc(110, 410, 80, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(imgAvatar, 30, 330, 160, 160);
        ctx.restore();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 6;
        ctx.stroke();

        // Camada 4: Textos (agora com Roboto registrada)
        ctx.fillStyle = "white";
        
        ctx.font = "bold 50px Roboto";
        ctx.fillText(n.toUpperCase(), 220, 380);

        ctx.font = "28px Roboto";
        ctx.fillText(`ID: ${i}`, 220, 430);
        ctx.fillText(`IENE: ${ie}`, 220, 475);

        ctx.font = "bold 35px Roboto";
        ctx.fillText("LEVEL", 650, 390);
        ctx.fillText("XP", 860, 390);

        ctx.font = "bold 65px Roboto";
        ctx.fillText(l, 690, 470);
        ctx.font = "24px Roboto";
        ctx.fillText(`${x}/${m}`, 790, 470);

        // Barra de XP
        const xpAtual = Number(String(x).replace(/\D/g, '')) || 0;
        const xpMax = Number(String(m).replace(/\D/g, '')) || 1;
        const larguraXP = Math.min(xpAtual / xpMax, 1) * 280;

        ctx.fillStyle = "#2b2b2b";
        ctx.beginPath();
        ctx.roundRect(650, 520, 280, 25, 12);
        ctx.fill();

        if (larguraXP > 0) {
            ctx.fillStyle = "#00ff88";
            ctx.beginPath();
            ctx.roundRect(650, 520, larguraXP, 25, 12);
            ctx.fill();
        }

        ctx.fillStyle = "white";
        ctx.font = "bold 35px Roboto";
        ctx.fillText("SOBRE MIM", 30, 555);
        ctx.font = "22px Roboto";
        ctx.fillText(s, 30, 590);

        res.setHeader("Content-Type", "image/png");
        res.send(canvas.toBuffer("image/png"));

    } catch (err) {
        console.error(err);
        res.status(500).send("Erro na API");
    }
});

module.exports = app;
