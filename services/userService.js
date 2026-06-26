import db from "../db/database.js";
import User from "../models/userModel.js";

// Ajouter un utilisateur
const createUser = (name, pseudo, role, password) => {
  const addUser = new User(name, pseudo, role, password);

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users(name, pseudo, role, password)
    VALUES(?, ?, ?, ?)
  `);

  return insertUser.run(
    addUser.name,
    addUser.pseudo,
    addUser.role,
    addUser.password
  );
};

// Afficher tous les utilisateurs
const getAllUsers = () => {
  return db.prepare(`SELECT * FROM users`).all();
};

// Afficher un utilisateur par son id
const getUserById = (id) => {
  return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id);
};

// Modifier un utilisateur
const updateUser = (id, data) => {
  const updateUserStmt = db.prepare(`
    UPDATE users
    SET name = ?, pseudo = ?, role = ?, password = ?
    WHERE id = ?
  `);

  return updateUserStmt.run(
    data.name,
    data.pseudo,
    data.role,
    data.password,
    id
  );
};

// Supprimer un utilisateur
const deleteUser = (id) => {
  return db.prepare(`DELETE FROM users WHERE id = ?`).run(id);
};

export { createUser, getAllUsers, getUserById, updateUser, deleteUser };