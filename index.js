const express = require("express");
const axios = require("axios");
const { createCanvas, loadImage } = require("@napi-rs/canvas");

const app = express();

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

        // CANVAS
        const canvas = createCanvas(1000, 600);
        const ctx = canvas.getContext("2d");

        // FUNDO
        const bg = await loadImage(
            "https://i.postimg.cc/Sx6rgWhp/In-Shot-20260506-050947511.jpg"
        );

        ctx.drawImage(bg, 0, 0, 1000, 600);

        // OVERLAY
        ctx.fillStyle = "rgba(0,0,0,0.65)";
        ctx.fillRect(0, 300, 1000, 300);

        // AVATAR
        let avatarURL = avatar;

        avatarURL = avatarURL
            .replace(".webp", ".png")
            .split("?")[0];

        const avatarImg = await loadImage(avatarURL);

        const avX = 30;
        const avY = 320;
        const avSize = 160;
        const radius = avSize / 2;

        ctx.save();

        ctx.beginPath();
        ctx.arc(
            avX + radius,
            avY + radius,
            radius,
            0,
            Math.PI * 2
        );

        ctx.closePath();
        ctx.clip();

        ctx.drawImage(
            avatarImg,
            avX,
            avY,
            avSize,
            avSize
        );

        ctx.restore();

        // BORDA AVATAR
        ctx.beginPath();

        ctx.arc(
            avX + radius,
            avY + radius,
            radius,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 6;
        ctx.stroke();

        // NOME
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 48px sans-serif";

        ctx.fillText(
            nome.toUpperCase(),
            220,
            380
        );

        // INFO
        ctx.font = "28px sans-serif";

        ctx.fillText(
            "ID: " + id,
            220,
            430
        );

        ctx.fillText(
            "IENE: " + iene,
            220,
            475
        );

        // LEVEL
        ctx.font = "bold 38px sans-serif";

        ctx.fillText(
            "LEVEL",
            690,
            390
        );

        ctx.font = "bold 65px sans-serif";

        ctx.fillText(
            lvl,
            720,
            470
        );

        // XP
        ctx.font = "bold 38px sans-serif";

        ctx.fillText(
            "XP",
            860,
            390
        );

        ctx.font = "26px sans-serif";

        ctx.fillText(
            xp + " / " + maxxp,
            810,
            470
        );

        // BARRA XP
        const barX = 650;
        const barY = 520;
        const barWidth = 280;
        const barHeight = 25;

        const porcentagem =
            Math.min(
                Number(xp) / Number(maxxp),
                1
            );

        // FUNDO BARRA
        ctx.fillStyle = "#2b2b2b";

        ctx.fillRect(
            barX,
            barY,
            barWidth,
            barHeight
        );

        // XP
        ctx.fillStyle = "#00ff88";

        ctx.fillRect(
            barX,
            barY,
            barWidth * porcentagem,
            barHeight
        );

        // SOBRE MIM
        ctx.fillStyle = "#ffffff";

        ctx.font = "bold 40px sans-serif";

        ctx.fillText(
            "SOBRE MIM",
            25,
            555
        );

        ctx.font = "24px sans-serif";

        let sobreTexto = sobre;

        if (sobreTexto.length > 65) {
            sobreTexto =
                sobreTexto.substring(0, 62) + "...";
        }

        ctx.fillText(
            sobreTexto,
            25,
            590
        );

        // ENVIAR
        res.setHeader(
            "Content-Type",
            "image/png"
        );

        res.send(
            canvas.toBuffer("image/png")
        );

    } catch (err) {

        console.log(err);

        res.status(500).send(
            "Erro ao gerar imagem"
        );

    }

});

module.exports = app;
