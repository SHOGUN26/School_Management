import db from "../db/database.js";
import Student from "../models/studentModel.js";

// Créer un étudiant
const createStudent = (matricule, nom, prenom, age, classe, user_id = null) => {
  const addStudent = new Student(matricule, nom, prenom, age, classe, user_id);

  const insertStudents = db.prepare(`
    INSERT OR IGNORE INTO students(matricule, nom, prenom, age, classe, user_id)
    VALUES(?, ?, ?, ?, ?, ?)
  `);

  return insertStudents.run(
    addStudent.matricule,
    addStudent.nom,
    addStudent.prenom,
    addStudent.age,
    addStudent.classe,
    addStudent.user_id
  );
};

// Afficher tous les étudiants
const getAllStudents = () => {
  return db.prepare(`SELECT * FROM students`).all();
};

// Afficher un étudiant par son id
const getStudentById = (id) => {
  return db.prepare(`SELECT * FROM students WHERE id = ?`).get(id);
};

// Mettre à jour un étudiant
const updateStudent = (id, data) => {
  const updateStudentStmt = db.prepare(`
    UPDATE students
    SET matricule = ?, nom = ?, prenom = ?, age = ?, classe = ?, user_id = ?
    WHERE id = ?
  `);

  return updateStudentStmt.run(
    data.matricule,
    data.nom,
    data.prenom,
    data.age,
    data.classe,
    data.user_id ?? null,
    id
  );
};

// Supprimer un étudiant et tout ce qui lui est lié
const deleteStudent = (id) => {
  const transaction = db.transaction(() => {
    db.prepare(`DELETE FROM grades WHERE student_id = ?`).run(id);
    db.prepare(`DELETE FROM absences WHERE student_id = ?`).run(id);
    return db.prepare(`DELETE FROM students WHERE id = ?`).run(id);
  });

  return transaction();
};

export { createStudent, getAllStudents, getStudentById, updateStudent, deleteStudent };
