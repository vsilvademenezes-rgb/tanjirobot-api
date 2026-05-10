const express = require("express");
const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");

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

        // Criar o canvas (tamanho do seu fundo)
        const canvas = createCanvas(1000, 600);
        const ctx = canvas.getContext("2d");

        // 1. Carregar Imagens (Fundo e Avatar)
        const fundoUrl = "https://i.postimg.cc/Sx6rgWhp/In-Shot-20260506-050947511.jpg";
        
        // Usamos Promise.all para carregar tudo de uma vez e ser mais rápido
        const [imgFundo, imgAvatar] = await Promise.all([
            loadImage(fundoUrl).catch(() => null),
            loadImage(a).catch(() => loadImage("https://cdn.discordapp.com/embed/avatars/0.png"))
        ]);

        // 2. Desenhar o Fundo
        if (imgFundo) {
            ctx.drawImage(imgFundo, 0, 0, 1000, 600);
        } else {
            ctx.fillStyle = "#1a1a1a";
            ctx.fillRect(0, 0, 1000, 600);
        }

        // 3. Overlay Escuro (Retângulo na parte de baixo)
        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        ctx.fillRect(0, 300, 1000, 300);

        // 4. Desenhar Avatar Circular
        ctx.save();
        ctx.beginPath();
        ctx.arc(110, 410, 80, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(imgAvatar, 30, 330, 160, 160);
        ctx.restore();

        // Borda do Avatar
        ctx.strokeStyle = "white";
        ctx.lineWidth = 6;
        ctx.stroke();

        // 5. Configuração de Texto e Cores
        ctx.fillStyle = "white";
        ctx.font = "bold 45px sans-serif";
        
        // Nome
        ctx.fillText(n.toUpperCase(), 220, 380);

        // IDs e Info
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

        // 6. Barra de XP
        const porcentagem = Math.min(Number(x) / Number(m), 1) * 280;
        
        // Fundo da Barra
        ctx.fillStyle = "#2b2b2b";
        ctx.beginPath();
        ctx.roundRect(650, 510, 280, 25, 12);
        ctx.fill();

        // Progresso
        ctx.fillStyle = "#00ff88";
        ctx.beginPath();
        ctx.roundRect(650, 510, porcentagem, 25, 12);
        ctx.fill();

        // 7. Sobre Mim
        ctx.fillStyle = "white";
        ctx.font = "bold 35px sans-serif";
        ctx.fillText("SOBRE MIM", 30, 545);
        
        ctx.font = "22px sans-serif";
        ctx.fillText(s, 30, 580);

        // Enviar a imagem final
        const buffer = canvas.toBuffer("image/png");
        res.setHeader("Content-Type", "image/png");
        res.status(200).send(buffer);

    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao gerar perfil");
    }
});

// Exportar para a Vercel
module.exports = app;

// Caso queira testar localmente:
if (require.main === module) {
    app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
}
