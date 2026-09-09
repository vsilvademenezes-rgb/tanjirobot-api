const express = require("express");
const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");

const app = express();

// ========================
// BANCO DE DRAGÕES
// ========================

const dragoes = [
  {
    id: "DRG-001",
    nome: "Dragão Rubro",
    elemento: "Fogo",
    raridade: "Comum",
    hp: 100,
    atk: 15,
    def: 10,
    cor: "#ff4400",
    imagem: "https://i.postimg.cc/23pVhpXp/1788984243651.png"
  },
  {
    id: "DRG-002",
    nome: "Dragão Ártico",
    elemento: "Gelo",
    raridade: "Comum",
    hp: 100,
    atk: 15,
    def: 10,
    cor: "#00aaff",
    imagem: "https://i.postimg.cc/XYrn312f/1788984530270.png"
  },
  {
    id: "DRG-003",
    nome: "Dragão Sombrio",
    elemento: "Trevas",
    raridade: "Comum",
    hp: 100,
    atk: 15,
    def: 10,
    cor: "#333333",
    imagem: "https://i.postimg.cc/Hk81FcxR/1788984591812.png"
  },
  {
    id: "DRG-004",
    nome: "Dragão Tempestade",
    elemento: "Elétrico",
    raridade: "Comum",
    hp: 100,
    atk: 15,
    def: 10,
    cor: "#ffcc00",
    imagem: "https://i.postimg.cc/Bbndptk5/1788984638135.png"
  },
  {
    id: "DRG-005",
    nome: "Dragão Verdante",
    elemento: "Natureza",
    raridade: "Comum",
    hp: 100,
    atk: 15,
    def: 10,
    cor: "#00aa44",
    imagem: "https://i.postimg.cc/kMjr4Ft9/1788984783918.png"
  },
  {
    id: "DRG-006",
    nome: "Dragão Abissal",
    elemento: "Água",
    raridade: "Comum",
    hp: 100,
    atk: 15,
    def: 10,
    cor: "#0044ff",
    imagem: "https://i.postimg.cc/DwXRB9pw/1788984820942.png"
  },
  {
    id: "DRG-007",
    nome: "Dragão Sagrado",
    elemento: "Luz",
    raridade: "Comum",
    hp: 100,
    atk: 15,
    def: 10,
    cor: "#ffdd00",
    imagem: "https://i.postimg.cc/4y0F1Pz6/1788984876319.png"
  }
];

// ========================
// FONTE
// ========================

let fontCarregada = false;

async function carregarFonte() {
  if (fontCarregada) return;

  try {
    const url =
      "https://cdn.jsdelivr.net/npm/@fontsource/roboto@5.0.8/files/roboto-latin-700-normal.woff2";

    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error("Não foi possível baixar a fonte.");
    }

    const buffer = Buffer.from(await resposta.arrayBuffer());

    GlobalFonts.register(buffer, "Roboto");

    fontCarregada = true;

    console.log("✅ Fonte Roboto carregada.");
  } catch (erro) {
    console.error("❌ Erro ao carregar fonte:", erro.message);
  }
}

// Carrega a fonte quando a API inicia
carregarFonte();

// ========================
// ROTA PRINCIPAL
// ========================

app.get("/", (req, res) => {
  res.json({
    online: true,
    nome: "Tanjiro API",
    sistema: "RPG de Dragões",
    totalDragoes: dragoes.length
  });
});

// ========================
// TODOS OS DRAGÕES
// ========================

app.get("/rpg/dragoes", (req, res) => {
  res.json(dragoes);
});

// ========================
// DRAGÃO PELO ID
// ========================

app.get("/rpg/dragoes/:id", (req, res) => {
  const id = String(req.params.id || "")
    .trim()
    .toUpperCase();

  const dragao = dragoes.find(
    d => d.id.toUpperCase() === id
  );

  if (!dragao) {
    return res.status(404).json({
      error: true,
      mensagem: "Dragão não encontrado.",
      idRecebido: id
    });
  }

  res.json(dragao);
});

// ========================
// 3 DRAGÕES ALEATÓRIOS
// ========================

app.get("/rpg/dragoes/aleatorios", (req, res) => {
  const embaralhados = [...dragoes].sort(
    () => Math.random() - 0.5
  );

  const tres = embaralhados.slice(0, 3);

  res.json(tres);
});

// ========================
// IMAGEM DO DRAGÃO
// ========================

app.get("/rpg/dragoes/imagem", async (req, res) => {
  try {
    // Pega o ID da URL
    const id = String(req.query.id || "")
      .trim()
      .toUpperCase();

    // Procura o dragão
    const dragao = dragoes.find(
      d => d.id.toUpperCase() === id
    );

    // Se não encontrou
    if (!dragao) {
      return res.status(404).json({
        error: true,
        mensagem: "Dragão não encontrado.",
        idRecebido: id,
        idsDisponiveis: dragoes.map(d => d.id)
      });
    }

    // Carrega a fonte
    await carregarFonte();

    // ========================
    // CRIA O CARD
    // ========================

    const canvas = createCanvas(700, 300);
    const ctx = canvas.getContext("2d");

    const fonte = fontCarregada
      ? "Roboto"
      : "sans-serif";

    // ========================
    // FUNDO
    // ========================

    const grad = ctx.createLinearGradient(
      0,
      0,
      700,
      300
    );

    grad.addColorStop(0, "#111111");
    grad.addColorStop(1, dragao.cor + "88");

    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.roundRect(
      0,
      0,
      700,
      300,
      20
    );
    ctx.fill();

    // ========================
    // BORDA
    // ========================

    ctx.strokeStyle = dragao.cor;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.roundRect(
      0,
      0,
      700,
      300,
      20
    );
    ctx.stroke();

    // ========================
    // IMAGEM DO DRAGÃO
    // ========================

    try {
      const respostaImagem = await fetch(
        dragao.imagem
      );

      if (!respostaImagem.ok) {
        throw new Error("Imagem não encontrada.");
      }

      const bufferImagem = Buffer.from(
        await respostaImagem.arrayBuffer()
      );

      const imagem = await loadImage(bufferImagem);

      ctx.drawImage(
        imagem,
        20,
        20,
        240,
        260
      );

    } catch (erro) {

      console.error(
        "Erro ao carregar imagem:",
        erro.message
      );

      ctx.fillStyle = dragao.cor + "44";

      ctx.beginPath();
      ctx.roundRect(
        20,
        20,
        240,
        260,
        15
      );
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.font = `bold 18px ${fonte}`;
      ctx.textAlign = "center";

      ctx.fillText(
        "Imagem indisponível",
        140,
        150
      );

      ctx.textAlign = "left";
    }

    // ========================
    // ID
    // ========================

    ctx.fillStyle = dragao.cor;
    ctx.font = `bold 18px ${fonte}`;
    ctx.textAlign = "left";

    ctx.fillText(
      dragao.id,
      280,
      50
    );

    // ========================
    // NOME
    // ========================

    ctx.fillStyle = "white";
    ctx.font = `bold 32px ${fonte}`;

    ctx.fillText(
      dragao.nome,
      280,
      95
    );

    // ========================
    // INFORMAÇÕES
    // ========================

    ctx.font = `20px ${fonte}`;
    ctx.fillStyle = "#aaaaaa";

    ctx.fillText(
      `Elemento: ${dragao.elemento}`,
      280,
      135
    );

    ctx.fillText(
      `Raridade: ${dragao.raridade}`,
      280,
      165
    );

    ctx.fillText(
      "Nível: 1",
      280,
      195
    );

    // ========================
    // STATS
    // ========================

    ctx.fillStyle = dragao.cor;
    ctx.font = `bold 22px ${fonte}`;

    ctx.fillText(
      "HP",
      280,
      235
    );

    ctx.fillText(
      "ATK",
      420,
      235
    );

    ctx.fillText(
      "DEF",
      560,
      235
    );

    // ========================
    // VALORES
    // ========================

    ctx.fillStyle = "white";
    ctx.font = `bold 28px ${fonte}`;

    ctx.fillText(
      dragao.hp,
      280,
      270
    );

    ctx.fillText(
      dragao.atk,
      420,
      270
    );

    ctx.fillText(
      dragao.def,
      560,
      270
    );

    // ========================
    // ENVIA A IMAGEM
    // ========================

    res.setHeader(
      "Content-Type",
      "image/png"
    );

    res.send(
      canvas.toBuffer("image/png")
    );

  } catch (erro) {

    console.error(
      "❌ Erro na API:",
      erro
    );

    res.status(500).json({
      error: true,
      mensagem: "Erro interno na API."
    });
  }
});

// ========================
// EXPORTA PARA A VERCEL
// ========================

module.exports = app;
