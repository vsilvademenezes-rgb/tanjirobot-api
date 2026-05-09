const express = require("express");
const PImage = require("pureimage");
const axios = require("axios");
const stream = require("stream");

const app = express();

app.get("/perfil", async (req, res) => {

    const {
        nome = "Membro",
        iene = "0",
        id = "000",
        lvl = "1",
        xp = "0",
        maxxp = "1000",
        sobre = "Use /sobremim",
        avatar = ""
    } = req.query;

    const img = PImage.make(1000, 600);
    const ctx = img.getContext("2d");

    try {

        // FUNDO
        const bgResp = await axios.get(
            "https://i.postimg.cc/Sx6rgWhp/In-Shot-20260506-050947511.jpg",
            { responseType: "arraybuffer" }
        );

        const bgImg = await PImage.decodeJPEGFromStream(
            stream.Readable.from(bgResp.data)
        );

        ctx.drawImage(bgImg, 0, 0, 1000, 600);

        // OVERLAY
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 300, 1000, 300);

        // AVATAR REDONDO
        try {

            let avatarURL;

            if (!avatar || avatar === "]") {

                avatarURL = "https://cdn.discordapp.com/embed/avatars/0.png";

            } else {

                avatarURL = avatar
                    .replace(".webp", ".png")
                    .split("?")[0];

            }

            console.log("Avatar URL:", avatarURL);

            const avResp = await axios.get(avatarURL, {
                responseType: "arraybuffer"
            });

            const avImg = await PImage.decodePNGFromStream(
                stream.Readable.from(avResp.data)
            );

            console.log("Avatar carregado");

            const avX = 30;
            const avY = 320;
            const size = 150;
            const radius = size / 2;

            ctx.save();

            ctx.beginPath();
            ctx.arc(
                avX + radius,
                avY + radius,
                radius,
                0,
                Math.PI * 2,
                true
            );

            ctx.closePath();
            ctx.clip();

            ctx.drawImage(avImg, avX, avY, size, size);

            ctx.restore();

        } catch (eav) {

            console.log("Erro avatar:");
            console.log(eav);

            ctx.fillStyle = "#555";
            ctx.fillRect(30, 320, 150, 150);

        }

        // TEXTOS
        ctx.fillStyle = "#ffffff";

        // NOME
        ctx.font = "50pt sans-serif";
        ctx.fillText(nome.toUpperCase(), 210, 380);

        // INFO
        ctx.font = "30pt sans-serif";
        ctx.fillText("ID: " + id, 210, 430);
        ctx.fillText("IENE: " + iene, 210, 480);

        // LEVEL
        ctx.font = "40pt sans-serif";
        ctx.fillText("LEVEL", 650, 430);

        ctx.font = "55pt sans-serif";
        ctx.fillText(lvl, 700, 500);

        // XP
        ctx.font = "40pt sans-serif";
        ctx.fillText("XP", 880, 430);

        ctx.font = "30pt sans-serif";
        ctx.fillText(xp + " / " + maxxp, 820, 500);

        // SOBRE MIM
        ctx.font = "45pt sans-serif";
        ctx.fillText("SOBRE MIM", 20, 560);

        ctx.font = "25pt sans-serif";

        const sobreLimpo =
            sobre.length > 60
                ? sobre.substring(0, 57) + "..."
                : sobre;

        ctx.fillText(sobreLimpo, 20, 595);

        // ENVIAR IMAGEM
        res.setHeader("Content-Type", "image/png");

        await PImage.encodePNGToStream(img, res);

    } catch (e) {

        console.log(e);

        res.status(500).send("Erro interno na API");

    }

});

module.exports = app;
