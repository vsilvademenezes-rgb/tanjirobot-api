const BASE = "https://apis.roblox.com/cloud/v2";

const GROUP_ID = process.env.GROUP_ID || "351317982";
const MAX_RANK = Number(process.env.MAX_RANK || 8);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { secret, groupId, userId, rank } = req.body || {};

  if (!secret || secret !== process.env.LYtErdh4fE6Gwm1ar9cVlpGKXY4CQ/gOX7nRuZ/DxD0LazIFZXlKaGJHY2lPaUpTVXpJMU5pSXNJbXRwWkNJNkluTnBaeTB5TURJeExUQTNMVEV6VkRFNE9qVXhPalE1V2lJc0luUjVjQ0k2SWtwWFZDSjkuZXlKaGRXUWlPaUpTYjJKc2IzaEpiblJsY201aGJDSXNJbWx6Y3lJNklrTnNiM1ZrUVhWMGFHVnVkR2xqWVhScGIyNVRaWEoyYVdObElpd2lZbUZ6WlVGd2FVdGxlU0k2SWt4WmRFVnlaR2cwWmtVMlIzZHRNV0Z5T1dOV2JIQkhTMWhaTkVOUkwyZFBXRGR1VW5WYUwwUjRSREJNWVhwSlJpSXNJbTkzYm1WeVNXUWlPaUl4TVRNNE56azVNRGd6SWl3aVpYaHdJam94TnpnNU5qa3pNemM0TENKcFlYUWlPakUzT0RrMk9EazNOemdzSW01aVppSTZNVGM0T1RZNE9UYzNPSDAuanh1bzFyRXhjMkN0UWJ5N2ZGb2VjS2lqblloWEpWOGNHTko1ZFRFcUxyZG1uWGpmOHIwR3JOamZUNExZWlNSSlZEQVRUdGZxVW1ONDBWWG1qc2xQUnBHd3VoYVNhU09ZcHZjQ0NVZVktQ2lOOTRVY3VvRXMzSk51bTJMdG1Ibkc0ZDljTFZNenlCb0xOeUhQX1NQbWU5YUQ2cVdkM2ZMYktMNk5aY3ZuaWU2VEZaWTNOUlVQQ2lhYXZrM19td3hfUnR0dGZqVzlaSDlweEVBQ05zaEJkVVZaOU8xR1Y0QUtTcUJyTkp3cFJRa3hEamFaV1lXOFVQcGo2R2VZSG1XZm01MU5FSE5VWWFVRXBnLVRlaEdMcFRjSC1nZGY0OGg5czlIUDh4UlRPQkxWOGhhVFY2X3VkVG1hc3FsX2E3aUVpSmhSQUlyRWJaMVhJb2tkWEtnT0F3) {
    return res.status(401).json({ error: "Não autorizado" });
  }
  if (String(groupId) !== String(GROUP_ID)) {
    return res.status(403).json({ error: "Grupo inválido" });
  }
  if (!Number.isInteger(userId) || !Number.isInteger(rank)) {
    return res.status(400).json({ error: "userId e rank devem ser números" });
  }
  if (rank < 1 || rank > MAX_RANK) {
    return res.status(400).json({ error: "Rank fora do permitido" });
  }

  const headers = {
    "x-api-key": process.env.RBX-XKuAwr3hKkifFEZQ7uodX8DVLobqfwRUr3R6EO4vqClljsKnoZcSDDJkH_dsTYpv,
    "Content-Type": "application/json",
  };

  try {
    const filter = encodeURIComponent(`user == 'users/${userId}'`);
    const mRes = await fetch(
      `${BASE}/groups/${GROUP_ID}/memberships?filter=${filter}`,
      { headers }
    );
    const mData = await mRes.json();
    if (!mRes.ok) {
      return res.status(502).json({ error: "Erro ao buscar membro", detalhe: mData });
    }
    const membership = mData.groupMemberships?.[0];
    if (!membership) {
      return res.status(404).json({ error: "Usuário não está no grupo" });
    }

    let roles = [];
    let pageToken = "";
    do {
      const url = `${BASE}/groups/${GROUP_ID}/roles?maxPageSize=20${
        pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""
      }`;
      const rRes = await fetch(url, { headers });
      const rData = await rRes.json();
      if (!rRes.ok) {
        return res.status(502).json({ error: "Erro ao buscar cargos", detalhe: rData });
      }
      roles = roles.concat(rData.groupRoles || []);
      pageToken = rData.nextPageToken || "";
    } while (pageToken);

    const cargoAtual = roles.find((r) => r.path === membership.role);
    if (cargoAtual && cargoAtual.rank > MAX_RANK) {
      return res.status(403).json({ error: "Não é permitido alterar esse membro" });
    }

    const cargoNovo = roles.find((r) => r.rank === rank);
    if (!cargoNovo) {
      return res.status(400).json({ error: "Cargo com esse rank não existe" });
    }

    const pRes = await fetch(`${BASE}/${membership.path}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ role: cargoNovo.path }),
    });
    const pData = await pRes.json();
    if (!pRes.ok) {
      return res.status(502).json({ error: "Erro ao mudar cargo", detalhe: pData });
    }

    return res.status(200).json({ ok: true, cargo: cargoNovo.displayName });
  } catch (err) {
    return res.status(500).json({ error: "Erro interno", detalhe: String(err) });
  }
};
