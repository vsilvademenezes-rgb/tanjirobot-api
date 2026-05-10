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

function corDaBarra(p) {
    if (p <= 20)  return "#888888";
    if (p <= 40)  return "#aa88cc";
    if (p <= 60)  return "#cc88bb";
    if (p <= 80)  return "#ff99bb";
    return "#ff4488";
}

function corDoBorda(p) {
    if (p <= 20)  return "#aaaaaa";
    if (p <= 40)  return "#bb99dd";
    if (p <= 60)  return "#dd99cc";
    if (p <= 80)  return "#ffaac8";
    return "#ff66aa";
}

app.get("/ship", async (req, res) => {
    try {
        const {
            a1 = "https://cdn.discordapp.com/embed/avatars/0.png",
            a2 = "https://cdn.discordapp.com/embed/avatars/1.png",
            p = "0"
        } = req.query;

        await carregarFonte();

        const porcentagem = Math.min(Math.max(Number(p), 0), 100);
        const canvas = createCanvas(610, 200);
        const ctx = canvas.getContext("2d");

        async function getImg(url) {
            const r = await fetch(url);
            const b = Buffer.from(await r.arrayBuffer());
            return await loadImage(b);
        }

        const [imgA1, imgA2, imgNezuko] = await Promise.all([
            getImg(a1).catch(() => getImg("https://cdn.discordapp.com/embed/avatars/0.png")),
            getImg(a2).catch(() => getImg("https://cdn.discordapp.com/embed/avatars/1.png")),
            getImg("https://i.postimg.cc/02Pz1nZx/1778398183228.png")
        ]);

        // Fundo gradiente
        const grad = ctx.createLinearGradient(0, 0, 610, 0);
        grad.addColorStop(0,    "#5588ff");
        grad.addColorStop(0.5,  "#cc66cc");
        grad.addColorStop(1,    "#ff66aa");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(0, 0, 610, 200, 20);
        ctx.fill();

        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.beginPath();
        ctx.roundRect(0, 0, 610, 200, 20);
        ctx.fill();

        const fonte = fontCarregada ? "Roboto" : "serif";
        const corBorda = corDoBorda(porcentagem);

        // Avatar 1 - esquerda
        ctx.save();
        ctx.beginPath();
        ctx.arc(100, 100, 70, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(imgA1, 30, 30, 140, 140);
        ctx.restore();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(100, 100, 70, 0, Math.PI * 2);
        ctx.stroke();

        // Avatar 2 - direita
        ctx.save();
        ctx.beginPath();
        ctx.arc(510, 100, 70, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(imgA2, 440, 30, 140, 140);
        ctx.restore();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(510, 100, 70, 0, Math.PI * 2);
        ctx.stroke();

        // Nezuko atrás do coração
        ctx.drawImage(imgNezuko, 230, -10, 150, 210);

        // Coração na frente da Nezuko
        ctx.save();
        ctx.translate(305, 72);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-8, -35, -55, -35, -55, 10);
        ctx.bezierCurveTo(-55, 40, 0, 72, 0, 72);
        ctx.bezierCurveTo(0, 72, 55, 40, 55, 10);
        ctx.bezierCurveTo(55, -35, 8, -35, 0, 0);
        ctx.stroke();
        ctx.restore();

        // Porcentagem dentro do coração
        ctx.fillStyle = "white";
        ctx.font = `bold 24px ${fonte}`;
        ctx.textAlign = "center";
        ctx.fillText(`${porcentagem}%`, 305, 108);

        // Barra de compatibilidade
        const barraTamanho = (porcentagem / 100) * 100;
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.roundRect(255, 162, 100, 12, 6);
        ctx.fill();

        if (barraTamanho > 0) {
            ctx.fillStyle = corBorda;
            ctx.beginPath();
            ctx.roundRect(255, 162, barraTamanho, 12, 6);
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
