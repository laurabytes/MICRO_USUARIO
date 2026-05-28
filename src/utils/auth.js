const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_biblioteca_2026";
async function autenticar(req, reply) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) return reply.status(401).send({ success: false, error: "Token nao fornecido" });
  try { req.usuario = jwt.verify(h.replace("Bearer ", ""), JWT_SECRET); } catch { return reply.status(401).send({ success: false, error: "Token invalido" }); }
}
async function apenasbibliotecario(req, reply) {
  if (!req.usuario || req.usuario.tipo !== "Bibliotecario") return reply.status(403).send({ success: false, error: "Acesso restrito a Bibliotecarios" });
}
async function acessoPropriouOuBibliotecario(req, reply) {
  if (!req.usuario) return reply.status(401).send({ success: false, error: "Nao autenticado" });
  if (req.usuario.tipo === "Bibliotecario") return;
  if (String(req.usuario.id) !== String(req.params.id)) return reply.status(403).send({ success: false, error: "Sem permissao" });
}
module.exports = { autenticar, apenasbibliotecario, acessoPropriouOuBibliotecario };
