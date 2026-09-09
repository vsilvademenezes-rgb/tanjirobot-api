const express = require("express");
const {
  createCanvas,
  loadImage,
  GlobalFonts
} = require("@napi-rs/canvas");

const app = express();


// ==================================================
// BANCO DE DRAGÕES
// ==================================================

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


// ==================================================
// FONTE
// ==================================================

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

    const buffer =
      Buffer.from(await resposta.arrayBuffer());

    GlobalFonts.register(buffer, "Roboto");

    fontCarregada = true;

  } catch (erro) {

    console.error(
      "Erro ao carregar fonte:",
      erro.message
    );

  }

}


// Carrega a fonte quando a API inicia
carregarFonte();


// ==================================================
// ROTA PRINCIPAL
// ==================================================

app.get("/", (req, res) => {

  res.json({

    projeto: "Dragon RPG API",

    status: "online",

    versao: "1.0.0",

    mensagem:
      "API do RPG de Dragões funcionando!",

    rotas: {

      dragoes:
        "/rpg/dragoes",

      aleatorios:
        "/rpg/dragoes/aleatorios",

      dragao:
        "/rpg/dragoes/:id",

      imagem:
        "/rpg/dragoes/imagem?id=DRG-001"

    }

  });

});


// ==================================================
// ROTA: TODOS OS DRAGÕES
// ==================================================

app.get("/rpg/dragoes", (req, res) => {

  res.json({

    total: dragoes.length,

    dragoes: dragoes

  });

});


// ==================================================
// ROTA: DRAGÃO POR ID
// ==================================================

app.get("/rpg/dragoes/:id", (req, res) => {

  const id =
    req.params.id.toUpperCase();

  const dragao =
    dragoes.find(d => d.id === id);

  if (!dragao) {

    return res.status(404).json({

      erro: true,

      mensagem:
        "Dragão não encontrado."

    });

  }

  res.json(dragao);

});


// ==================================================
// ROTA: 3 DRAGÕES ALEATÓRIOS
// ==================================================

app.get("/rpg/dragoes/aleatorios", (req, res) => {

  const embaralhados =
    [...dragoes]
      .sort(() => Math.random() - 0.5);

  const tres =
    embaralhados.slice(0, 3);

  res.json({

    quantidade: tres.length,

    dragoes: tres

  });

});


// ==================================================
// ROTA: IMAGEM DO DRAGÃO
// ==================================================

app.get(
  "/rpg/dragoes/imagem",
  async (req, res) => {

    try {

      const id =
        String(req.query.id || "")
          .toUpperCase();

      // ------------------------------
      // Verifica o ID
      // ------------------------------

      if (!id) {

        return res.status(400).json({

          erro: true,

          mensagem:
            "Informe o ID do dragão. Exemplo: ?id=DRG-001"

        });

      }


      // ------------------------------
      // Procura o dragão
      // ------------------------------

      const dragao =
        dragoes.find(d => d.id === id);


      if (!dragao) {

        return res.status(404).json({

          erro: true,

          mensagem:
            "Dragão não encontrado."

        });

      }


      // ------------------------------
      // Fonte
      // ------------------------------

      await carregarFonte();

      const fonte =
        fontCarregada
          ? "Roboto"
          : "sans-serif";


      // ------------------------------
      // Canvas
      // ------------------------------

      const canvas =
        createCanvas(700, 300);

      const ctx =
        canvas.getContext("2d");


      // ------------------------------
      // Fundo
      // ------------------------------

      const gradiente =
        ctx.createLinearGradient(
          0,
          0,
          700,
          300
        );

      gradiente.addColorStop(
        0,
        "#111111"
      );

      gradiente.addColorStop(
        1,
        dragao.cor + "88"
      );

      ctx.fillStyle =
        gradiente;

      ctx.beginPath();

      ctx.roundRect(
        0,
        0,
        700,
        300,
        20
      );

      ctx.fill();


      // ------------------------------
      // Borda
      // ------------------------------

      ctx.strokeStyle =
        dragao.cor;

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


      // ------------------------------
      // Imagem do dragão
      // ------------------------------

      try {

        const resposta =
          await fetch(dragao.imagem);

        if (!resposta.ok) {
          throw new Error(
            "Imagem indisponível"
          );
        }

        const buffer =
          Buffer.from(
            await resposta.arrayBuffer()
          );

        const imagem =
          await loadImage(buffer);

        ctx.drawImage(
          imagem,
          20,
          20,
          240,
          260
        );

      } catch (erro) {

        ctx.fillStyle =
          dragao.cor + "44";

        ctx.beginPath();

        ctx.roundRect(
          20,
          20,
          240,
          260,
          15
        );

        ctx.fill();

      }


      // ==================================================
      // INFORMAÇÕES
      // ==================================================


      // ID

      ctx.fillStyle =
        dragao.cor;

      ctx.font =
        `bold 18px ${fonte}`;

      ctx.textAlign =
        "left";

      ctx.fillText(
        dragao.id,
        280,
        50
      );


      // Nome

      ctx.fillStyle =
        "#ffffff";

      ctx.font =
        `bold 32px ${fonte}`;

      ctx.fillText(
        dragao.nome,
        280,
        95
      );


      // Elemento

      ctx.font =
        `20px ${fonte}`;

      ctx.fillStyle =
        "#aaaaaa";

      ctx.fillText(
        `Elemento: ${dragao.elemento}`,
        280,
        135
      );


      // Raridade

      ctx.fillText(
        `Raridade: ${dragao.raridade}`,
        280,
        165
      );


      // Nível inicial

      ctx.fillText(
        `Nível: 1`,
        280,
        195
      );


      // ==================================================
      // STATUS
      // ==================================================

      ctx.fillStyle =
        dragao.cor;

      ctx.font =
        `bold 22px ${fonte}`;


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


      // Valores

      ctx.fillStyle =
        "#ffffff";

      ctx.font =
        `bold 28px ${fonte}`;


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


      // ==================================================
      // ENVIA IMAGEM
      // ==================================================

      res.setHeader(
        "Content-Type",
        "image/png"
      );

      res.send(
        canvas.toBuffer("image/png")
      );


    } catch (erro) {

      console.error(
        "Erro na geração da imagem:",
        erro
      );

      res.status(500).json({

        erro: true,

        mensagem:
          "Erro interno ao gerar imagem."

      });

    }

  }
);


// ==================================================
// EXPORTAÇÃO
// ==================================================

module.exports = app;
