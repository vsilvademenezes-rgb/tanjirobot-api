const express = require("express");
const PImage = require("pureimage");
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const app = express();
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const font = PImage.registerFont('fonte.ttf', 'CustomFont');
font.loadSync();

client.login("MTQ1MDI2NzY2NzcwMDM4Nzg2MQ.GRB0-I.adOVDa4u9RDgNrA9jw1O0m7s3oEWQsfRCa7lFs");

app.get("/perfil", async (req, res) => {
    const { 
        nome = "Membro", iene = "0", id = "000", lvl = "1", xp = "0", maxxp = "1000", 
        sobre = "Use /sobremim", 
        avatar = "https://discord.com/assets/712392946314352650.png"
    } = req.query;
    
    const img = PImage.make(1000, 600);
    const ctx = img.getContext('2d');

    try {
        const bgResp = await axios.get("https://i.postimg.cc/Sx6rgWhp/In-Shot-20260506-050947511.jpg", { responseType: 'arraybuffer' });
        const bgImg = await PImage.decodeJPEGFromStream(require('stream').Readable.from(bgResp.data));
        ctx.drawImage(bgImg, 0, 0, 1000, 600);

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 300, 1000, 300);

        const avX = 30;  
        const avY = 320; 
        const size = 150; 
        const radius = size / 2; 

        ctx.save(); 
        ctx.beginPath();
        ctx.arc(avX + radius, avY + radius, radius, 0, Math.PI * 2, true); 
        ctx.closePath();
        ctx.clip(); 

        try {
            const avResp = await axios.get(avatar, { responseType: 'arraybuffer' });
            const avImg = await PImage.decodePNGFromStream(require('stream').Readable.from(avResp.data));
            ctx.drawImage(avImg, avX, avY, size, size);
        } catch (eav) {
            ctx.fillStyle = "#555";
            ctx.fillRect(avX, avY, size, size);
        }
        
        ctx.restore();

        ctx.fillStyle = "#ffffff";
        
        ctx.font = "50pt 'CustomFont'";
        ctx.fillText(nome.toUpperCase(), 210, 380);
        
        ctx.font = "30pt 'CustomFont'";
        ctx.fillText("ID: " + id, 210, 430);
        ctx.fillText("IENE: " + iene, 210, 480);

        ctx.font = "40pt 'CustomFont'";
        ctx.fillText("LEVEL", 650, 430);
        ctx.font = "55pt 'CustomFont'"; 
        ctx.fillText(lvl, 700, 500);
        
        ctx.font = "40pt 'CustomFont'";
        ctx.fillText("XP", 880, 430);
        ctx.font = "30pt 'CustomFont'";
        ctx.fillText(xp + " / " + maxxp, 820, 500);

        ctx.font = "45pt 'CustomFont'";
        ctx.fillText("SOBRE MIM", 20, 560);
        ctx.font = "25pt 'CustomFont'";
        const sobreLimpo = sobre.length > 60 ? sobre.substring(0, 57) + "..." : sobre;
        ctx.fillText(sobreLimpo, 20, 595);

        res.setHeader('Content-Type', 'image/png');
        await PImage.encodePNGToStream(img, res);

    } catch (e) {
        console.error(e);
        res.status(500).send("Erro interno na API");
    }
});

app.listen(3000, () => console.log("PERFIL 2.0 ONLINE ⚔️ (COM AVATAR REDONDO)"));
EOF
