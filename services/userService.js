import db from "../db/database.js";
import Users from "../models/userModel.js"


//AJOUTER UN UTILISATEUR
const createUser = (name, role)=>{

    const addUsers=new Users(name, role)

    const insertUsers = db.prepare(`
       INSERT OR IGNORE INTO users(name,role)
       VALUES(?,?)
        `)

    return insertUsers.run(addUsers.name,addUsers.role)
}

// afficher tout les utilisateurs
const getAllUsers = () => {
    return db.prepare(`
            SELECT * FROM users
        `).all();
};


// afficher un utilisateur grâce à son id
const getUserById = (id) => {
    return db.prepare(`
            SELECT * FROM users
            WHERE id = ?
        `).get(id);
};




//SUPPRESION D'UN UTILISATEUR
const deleteUser = (id) => {
    return db.prepare(`
            DELETE FROM users WHERE id = ?
        `).run(id);
};


export {createUser,getAllUsers,getUserById,deleteUser}