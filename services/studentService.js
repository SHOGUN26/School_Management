import db from "../db/database.js";
import Student from "../models/studentModel.js";

// Créer ou ajouter étudiant
const createStudent = (matricule, nom, prenom, age, classe) => {
    const addStudent = new Student(matricule, nom, prenom, age, classe)
  
    const insertStudents = db.prepare(`
            INSERT OR IGNORE INTO students(matricule, nom, prenom, age, classe)
            VALUES(?, ?, ?, ?, ?)
        `);
        return insertStudents.run(addStudent.matricule, addStudent.nom, addStudent.prenom, addStudent.age, addStudent.classe);
};

// afficher tout les étudiants
const getAllStudents = () => {
    return db.prepare(`
            SELECT * FROM students
        `).all();
};


// afficher un étuidant grâce à son id
const getStudentById = (id) => {
    return db.prepare(`
            SELECT * FROM students
            WHERE id = ?
        `).get(id);
};


// faire une mise à jour
const updateStudent = (id, data) => {
  const updateStudentStmt = db.prepare(`
    UPDATE students 
    SET matricule = ?, nom = ?, prenom = ?, age = ?, classe = ?
    WHERE id = ?
  `);

  return updateStudentStmt.run(
    data.matricule,
    data.nom,
    data.prenom,
    data.age,
    data.classe,
    id
  );
};

// SUPPRIMER UN ÉTUDIANT ET TOUT CE QUI LUI EST LIÉ
const deleteStudent = (id) => {
  const transaction = db.transaction(() => {
    db.prepare(`DELETE FROM grades WHERE student_id = ?`).run(id);
    db.prepare(`DELETE FROM absences WHERE student_id = ?`).run(id);
    return db.prepare(`DELETE FROM students WHERE id = ?`).run(id);
  });

  return transaction();
};


export { createStudent, getAllStudents, getStudentById, updateStudent, deleteStudent }