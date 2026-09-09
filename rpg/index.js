const express = require("express");
const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");

const app = express();

const dragoes = [
  { id: "DRG-001", nome: "Dragão Rubro", elemento: "Fogo", raridade: "Comum", hp: 100, atk: 15, def: 10, cor: "#ff4400", imagem: "https://i.postimg.cc/23pVhpXp/1788984243651.png" },
  { id: "DRG-002", nome: "Dragão Ártico", elemento: "Gelo", raridade: "Comum", hp: 100, atk: 15, def: 10, cor: "#00aaff", imagem: "https://i.postimg.cc/XYrn312f/1788984530270.png" },
  { id: "DRG-003", nome: "Dragão Sombrio", elemento: "Trevas", raridade: "Comum", hp: 100, atk: 15, def: 10, cor: "#333333", imagem: "https://i.postimg.cc/Hk81FcxR/1788984591812.png" },
  { id: "DRG-004", nome: "Dragão Tempestade", elemento: "Elétrico", raridade: "Comum", hp: 100, atk: 15, def: 10, cor: "#ffcc00", imagem: "https://i.postimg.cc/Bbndptk5/1788984638135.png" },
  { id: "DRG-005", nome: "Dragão Verdante", elemento: "Natureza", raridade: "Comum", hp: 100, atk: 15, def: 10, cor: "#00aa44", imagem: "https://i.postimg.cc/kMjr4Ft9/1788984783918.png" },
  { id: "DRG-006", nome: "Dragão Abissal", elemento: "Água", raridade: "Comum", hp: 100, atk: 15, def: 10, cor: "#0044ff", imagem: "https://i.postimg.cc/DwXRB9pw/1788984820942.png" },
  { id: "DRG-007", nome: "Dragão Sagrado", elemento: "Luz", raridade: "Comum", hp: 100, atk: 15, def: 10, cor: "#ffdd00", imagem: "https://i.postimg.cc/4y0F1Pz6/1788984876319.png" },
];

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

// ========================
// ROTA: 3 DRAGÕES ALEATÓRIOS
// ========================
app.get("/rpg/dragoes/aleatorios", (req, res) => {
  const embaralhados = [...dragoes].sort(() => Math.random() - 0.5);
  const tres = embaralhados.slice(0, 3);
  res.json({
    dragao1_id: tres[0].id,
    dragao1_nome: tres[0].nome,
    dragao1_elemento: tres[0].elemento,
    dragao1_raridade: tres[0].raridade,

    dragao2_id: tres[1].id,
    dragao2_nome: tres[1].nome,
    dragao2_elemento: tres[1].elemento,
    dragao2_raridade: tres[1].raridade,

    dragao3_id: tres[2].id,
    dragao3_nome: tres[2].nome,
    dragao3_elemento: tres[2].elemento,
    dragao3_raridade: tres[2].raridade,
  });
});

// ========================
// ROTA: IMAGEM DO DRAGÃO
// ========================
app.get("/rpg/dragoes/imagem", async (req, res) => {
  try {
    const { id } = req.query;

    const dragao = dragoes.find(d => d.id === id);
    if (!dragao) return res.status(404).json({ message: "Dragão não encontrado!" });

    await carregarFonte();

    const canvas = createCanvas(700, 300);
    const ctx = canvas.getContext("2d");
    const fonte = fontCarregada ? "Roboto" : "serif";

    const grad = ctx.createLinearGradient(0, 0, 700, 300);
    grad.addColorStop(0, "#111111");
    grad.addColorStop(1, dragao.cor + "88");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(0, 0, 700, 300, 20);
    ctx.fill();

    ctx.strokeStyle = dragao.cor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(0, 0, 700, 300, 20);
    ctx.stroke();

    try {
      const r = await fetch(dragao.imagem);
      const b = Buffer.from(await r.arrayBuffer());
      const img = await loadImage(b);
      ctx.drawImage(img, 20, 20, 240, 260);
    } catch {
      ctx.fillStyle = dragao.cor + "44";
      ctx.beginPath();
      ctx.roundRect(20, 20, 240, 260, 15);
      ctx.fill();
    }

    ctx.fillStyle = dragao.cor;
    ctx.font = `bold 18px ${fonte}`;
    ctx.textAlign = "left";
    ctx.fillText(dragao.id, 280, 50);

    ctx.fillStyle = "white";
    ctx.font = `bold 32px ${fonte}`;
    ctx.fillText(dragao.nome, 280, 95);

    ctx.font = `20px ${fonte}`;
    ctx.fillStyle = "#aaaaaa";
    ctx.fillText(`Elemento: ${dragao.elemento}`, 280, 135);
    ctx.fillText(`Raridade: ${dragao.raridade}`, 280, 165);
    ctx.fillText(`Nível: 1`, 280, 195);

    ctx.fillStyle = dragao.cor;
    ctx.font = `bold 22px ${fonte}`;
    ctx.fillText(`❤️ HP`, 280, 235);
    ctx.fillText(`⚔️ ATK`, 420, 235);
    ctx.fillText(`🛡️ DEF`, 560, 235);

    ctx.fillStyle = "white";
    ctx.font = `bold 28px ${fonte}`;
    ctx.fillText(dragao.hp, 280, 270);
    ctx.fillText(dragao.atk, 420, 270);
    ctx.fillText(dragao.def, 560, 270);

    res.setHeader("Content-Type", "image/png");
    res.send(canvas.toBuffer("image/png"));

  } catch (err) {
    console.error(err);
    res.status(500).send("Erro na API");
  }
});

module.exports = app;