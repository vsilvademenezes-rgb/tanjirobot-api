const express = require("express");
const sharp = require("sharp");
const axios = require("axios"); // Adicione o axios para baixar as imagens

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

        // 1. FUNÇÃO PARA TRANSFORMAR IMAGEM EM BASE64
        const getBase64 = async (url) => {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            return `data:${response.headers["content-type"]};base64,${Buffer.from(response.data).toString('base64')}`;
        };

        // Baixando o fundo e o avatar (evita o bug de imagem sumida)
        const fundoUrl = "https://i.postimg.cc/Sx6rgWhp/In-Shot-20260506-050947511.jpg";
        const [fundoBase64, avatarBase64] = await Promise.all([
            getBase64(fundoUrl),
            getBase64(a)
        ]);

        const porcentagem = Math.min(Number(x) / Number(m), 1) * 280;

        const svg = `
<svg width="1000" height="600" xmlns="http://www.w3.org/2000/svg">
    <image href="${fundoBase64}" width="1000" height="600" preserveAspectRatio="xMidYMid slice" />

    <rect x="0" y="300" width="1000" height="300" fill="black" fill-opacity="0.65" />

    <defs>
        <clipPath id="avatarClip">
            <circle cx="110" cy="410" r="80"/>
        </clipPath>
    </defs>

    <image
        href="${avatarBase64}"
        x="30"
        y="330"
        width="160"
        height="160"
        clip-path="url(#avatarClip)"
    />

    <circle cx="110" cy="410" r="80" fill="none" stroke="white" stroke-width="6" />

    <text x="220" y="380" fill="white" font-size="45" font-family="sans-serif" font-weight="bold">${n.toUpperCase()}</text>
    <text x="220" y="430" fill="white" font-size="25" font-family="sans-serif">ID: ${i}</text>
    <text x="220" y="470" fill="white" font-size="25" font-family="sans-serif">IENE: ${ie}</text>

    <text x="650" y="390" fill="white" font-size="35" font-family="sans-serif" font-weight="bold">LEVEL</text>
    <text x="690" y="470" fill="white" font-size="60" font-family="sans-serif" font-weight="bold">${l}</text>
    
    <text x="860" y="390" fill="white" font-size="35" font-family="sans-serif" font-weight="bold">XP</text>
    <text x="790" y="470" fill="white" font-size="24" font-family="sans-serif">${x} / ${m}</text>

    <rect x="650" y="510" width="280" height="25" rx="12" fill="#2b2b2b" />
    <rect x="650" y="510" width="${porcentagem}" height="25" rx="12" fill="#00ff88" />

    <text x="30" y="545" fill="white" font-size="35" font-family="sans-serif" font-weight="bold">SOBRE MIM</text>
    <text x="30" y="580" fill="white" font-size="22" font-family="sans-serif">${s}</text>
</svg>`;

        const png = await sharp(Buffer.from(svg))
            .png()
            .toBuffer();

        res.setHeader("Content-Type", "image/png");
        res.status(200).send(png);

    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao gerar imagem");
    }
});

module.exports = app;
