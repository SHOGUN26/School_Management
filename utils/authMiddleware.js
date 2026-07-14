import jwt from "jsonwebtoken";

// À terme, mets cette clé dans un fichier .env, jamais en dur dans le code
const JWT_SECRET = process.env.JWT_SECRET || "change_moi_dans_un_.env";

// Vérifie que le token est présent et valide -> attache req.user
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]; // format attendu : "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token manquant, authentification requise" });
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ error: "Token invalide ou expiré" });
    }

    req.user = payload; // { id, pseudo, role }
    next();
  });
};

// Vérifie que le rôle de l'utilisateur connecté fait partie des rôles autorisés
const authorizeRoles = (...rolesAutorises) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentification requise" });
    }

    if (!rolesAutorises.includes(req.user.role)) {
      return res.status(403).json({ error: "Accès refusé : rôle insuffisant" });
    }

    next();
  };
};

export { authenticateToken, authorizeRoles, JWT_SECRET };