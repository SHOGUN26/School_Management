import db from "../db/database.js";
import Grades from "../models/gardeModel.js";

//AJOUTER LES NOTES
const addMultipleGrades = (student_id, subject_id, note) => {

    const addGrades = new Grades(student_id,subject_id,note)
  const insertGrades = db.prepare(
    `
        INSERT INTO grades(student_id, subject_id, note)
        VALUES(?, ?, ?)
        `,
  );

    return insertGrades.run(addGrades.student_id, addGrades.subject_id, addGrades.note)


  
};




//MODIFICATION DE LA NOTE

const updateGrades = (id, data) => {
  const updateGradesStmt = db.prepare(`
        UPDATE grades SET note = ?
        WHERE id = ?

    `);

  return updateGradesStmt.run(data.note, id);
};



//SUPPRESSION DE LA NOTE
const deleteGrades = (id) => {
    return db.prepare(`
            DELETE FROM grades WHERE id = ?
        `).run(id);
};

//CALCUL DE LA MOYENNE

// Obtenir toutes les notes d'un étudiant dans une matière
const getStudentGrades = (studentId) => {

      return db.prepare(`
        SELECT
            subjects.nom AS matiere,
            grades.note
        FROM grades
        JOIN subjects
            ON grades.subject_id = subjects.id
        WHERE grades.student_id = ?
    `).all(studentId);

};
const calculateAverage = (student_id, subject_id) => {

    const grades = getStudentGrades(student_id, subject_id);

    if (grades.length === 0) {
        return 0;
    }

    let somme = 0;

    for (const grade of grades) {
        somme += grade.note;
    }

    return somme / grades.length;
};


//Meilleur étudiant

const getBestStudentInSubject = (subject_id) => {

    const grades = db.prepare(`
        SELECT DISTINCT student_id
        FROM grades
        WHERE subject_id = ?
    `).all(subject_id);

    let bestStudent = null;
    let bestAverage = 0;

    for (const grade of grades) {

        const average = calculateAverage(
            grade.student_id,
            subject_id
        );

        if (average > bestAverage) {
            bestAverage = average;
            bestStudent = grade.student_id;
        }
    }

    return {
        student_id: bestStudent,
        average: bestAverage
    };
};


export {addMultipleGrades,calculateAverage,getBestStudentInSubject,updateGrades,deleteGrades,getStudentGrades}


