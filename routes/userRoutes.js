import express from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from "../services/userService.js";

const router = express.Router();

// GET /api/users -> lister tous les utilisateurs
router.get('/', (req, res) => {
  try {
    const users = getAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// GET /api/users/:id -> un utilisateur précis
router.get('/:id', (req, res) => {
  try {
    const user = getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
  }
});

// POST /api/users -> créer un utilisateur
router.post('/', (req, res) => {
  try {
    const { name, pseudo, role, password } = req.body;

    if (!name || !pseudo || !role || !password) {
      return res.status(400).json({ error: 'Champs manquants (name, pseudo, role, password requis)' });
    }

    const result = createUser(name, pseudo, role, password);
    res.status(201).json({ message: 'Utilisateur créé', id: result.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
  }
});

// PUT /api/users/:id -> modifier un utilisateur
router.put('/:id', (req, res) => {
  try {
    const existing = getUserById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    updateUser(req.params.id, req.body);
    res.json({ message: 'Utilisateur mis à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur' });
  }
});

// DELETE /api/users/:id -> supprimer un utilisateur
router.delete('/:id', (req, res) => {
  try {
    const existing = getUserById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    deleteUser(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

export default router;