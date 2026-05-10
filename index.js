const express = require("express");
const sharp = require("sharp");

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

        const porcentagem =
            Math.min(
                Number(x) / Number(m),
                1
            ) * 280;

        const svg = `
<svg width="1000" height="600" xmlns="http://www.w3.org/2000/svg">

    <!-- FUNDO -->
    <image
        href="https://i.postimg.cc/Sx6rgWhp/In-Shot-20260506-050947511.jpg"
        width="1000"
        height="600"
    />

    <!-- OVERLAY -->
    <rect
        x="0"
        y="300"
        width="1000"
        height="300"
        fill="rgba(0,0,0,0.65)"
    />

    <!-- AVATAR -->
    <defs>
        <clipPath id="avatarClip">
            <circle cx="110" cy="400" r="80"/>
        </clipPath>
    </defs>

    <image
        href="${a}"
        x="30"
        y="320"
        width="160"
        height="160"
        clip-path="url(#avatarClip)"
    />

    <!-- BORDA -->
    <circle
        cx="110"
        cy="400"
        r="80"
        fill="none"
        stroke="white"
        stroke-width="6"
    />

    <!-- NOME -->
    <text
        x="220"
        y="380"
        fill="white"
        font-size="48"
        font-family="Arial"
        font-weight="bold"
    >
        ${n.toUpperCase()}
    </text>

    <!-- INFO -->
    <text
        x="220"
        y="430"
        fill="white"
        font-size="28"
        font-family="Arial"
    >
        ID: ${i}
    </text>

    <text
        x="220"
        y="475"
        fill="white"
        font-size="28"
        font-family="Arial"
    >
        IENE: ${ie}
    </text>

    <!-- LEVEL -->
    <text
        x="650"
        y="390"
        fill="white"
        font-size="40"
        font-family="Arial"
        font-weight="bold"
    >
        LEVEL
    </text>

    <text
        x="700"
        y="470"
        fill="white"
        font-size="65"
        font-family="Arial"
        font-weight="bold"
    >
        ${l}
    </text>

    <!-- XP -->
    <text
        x="860"
        y="390"
        fill="white"
        font-size="40"
        font-family="Arial"
        font-weight="bold"
    >
        XP
    </text>

    <text
        x="790"
        y="470"
        fill="white"
        font-size="26"
        font-family="Arial"
    >
        ${x} / ${m}
    </text>

    <!-- BARRA XP -->
    <rect
        x="650"
        y="520"
        width="280"
        height="25"
        rx="10"
        fill="#2b2b2b"
    />

    <rect
        x="650"
        y="520"
        width="${porcentagem}"
        height="25"
        rx="10"
        fill="#00ff88"
    />

    <!-- SOBRE -->
    <text
        x="20"
        y="555"
        fill="white"
        font-size="40"
        font-family="Arial"
        font-weight="bold"
    >
        SOBRE MIM
    </text>

    <text
        x="20"
        y="590"
        fill="white"
        font-size="24"
        font-family="Arial"
    >
        ${s}
    </text>

</svg>
`;

        // CONVERTER SVG PRA PNG REAL
        const png = await sharp(
            Buffer.from(svg)
        )
        .png()
        .toBuffer();

        res.setHeader(
            "Content-Type",
            "image/png"
        );

        res.send(png);

    } catch (err) {

        console.log(err);

        res.status(500).send("Erro");

    }

});

module.exports = app;
