const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_biblioteca_2026";
async function autenticar(req, reply) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(401).send({ success: false, error: "Token de autenticacao nao fornecido" });
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
  } catch (err) {
    return reply.status(401).send({ success: false, error: "Token invalido ou expirado" });
  }
}
async function apenasbibliotecario(req, reply) {
  if (!req.usuario || req.usuario.tipo !== "Bibliotecario") {
    return reply.status(403).send({ success: false, error: "Acesso restrito a Bibliotecarios" });
  }
}
async function acessoPropriouOuBibliotecario(req, reply) {
  if (!req.usuario) {
    return reply.status(401).send({ success: false, error: "Nao autenticado" });
  }
  if (req.usuario.tipo === "Bibliotecario") return;
  if (String(req.usuario.id) !== String(req.params.id)) {
    return reply.status(403).send({ success: false, error: "Sem permissao para acessar dados de outro utilizador" });
  }
}
module.exports = { autenticar, apenasbibliotecario, acessoPropriouOuBibliotecario };
