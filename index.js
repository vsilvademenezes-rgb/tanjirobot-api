const express = require("express");
const Jimp = require("jimp");

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

        // 1. Carregar Fontes Padrão do Jimp (Não depende do sistema)
        const fontBig = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
        const fontMed = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
        const fontSmall = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);

        // 2. Carregar Imagens
        const fundoUrl = "https://i.postimg.cc/Sx6rgWhp/In-Shot-20260506-050947511.jpg";
        const [imgFundo, imgAvatar] = await Promise.all([
            Jimp.read(fundoUrl),
            Jimp.read(a).catch(() => Jimp.read("https://cdn.discordapp.com/embed/avatars/0.png"))
        ]);

        // 3. Redimensionar Fundo
        imgFundo.resize(1000, 600);

        // 4. Criar Overlay (Retângulo Escuro)
        const overlay = new Jimp(1000, 300, 0x000000aa); // Preto com transparência
        imgFundo.composite(overlay, 0, 300);

        // 5. Preparar Avatar
        imgAvatar.resize(160, 160);
        // Criar máscara circular para o avatar
        const mask = await Jimp.read("https://i.imgur.com/vSRE8S3.png").catch(() => null); 
        if (mask) {
            mask.resize(160, 160);
            imgAvatar.mask(mask, 0, 0);
        }

        imgFundo.composite(imgAvatar, 30, 330);

        // 6. Desenhar Textos
        // Nome
        imgFundo.print(fontBig, 220, 330, n.toUpperCase());

        // ID e IENE
        imgFundo.print(fontMed, 220, 410, `ID: ${i}`);
        imgFundo.print(fontMed, 220, 450, `IENE: ${ie}`);

        // Level e XP
        imgFundo.print(fontMed, 650, 340, "LEVEL");
        imgFundo.print(fontBig, 680, 380, l);
        
        imgFundo.print(fontMed, 850, 340, "XP");
        imgFundo.print(fontMed, 800, 420, `${x}/${m}`);

        // Barra de XP (Simples)
        const larguraBarra = 280;
        const progresso = Math.min(Number(x) / Number(m), 1) * larguraBarra;
        
        const barraFundo = new Jimp(larguraBarra, 20, 0x2b2b2bff);
        const barraProgresso = new Jimp(progresso > 0 ? progresso : 1, 20, 0x00ff88ff);
        
        imgFundo.composite(barraFundo, 650, 500);
        imgFundo.composite(barraProgresso, 650, 500);

        // Sobre Mim
        imgFundo.print(fontMed, 30, 510, "SOBRE MIM");
        imgFundo.print(fontSmall, 30, 550, s);

        // 7. Enviar a imagem
        const buffer = await imgFundo.getBufferAsync(Jimp.MIME_PNG);
        res.setHeader("Content-Type", "image/png");
        res.status(200).send(buffer);

    } catch (err) {
        console.error(err);
        res.status(500).send("Erro: " + err.message);
    }
});

module.exports = app;
