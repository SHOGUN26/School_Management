import db from "../db/database.js";
import Absence from "../models/absenceModel.js"


//ENGERISTEMENT DES ABSENCES

const createAbsence = (student_id, status)=>{

    const date = new Date().toISOString().slice(0, 19).replace("T", " ");

    const addAbsence =new Absence(student_id,date, status)

    const insertAbsences = db.prepare(`
       INSERT OR IGNORE INTO absences(student_id,date, status)
       VALUES(?,?,?)
        `)

    return insertAbsences.run(addAbsence.student_id, addAbsence.date, addAbsence.status)
}


//MARQUER UNE ABSENCE : JUSTFIE/NON-JUSTUFIE
const marquerAbsence = (id, nouveauStatus) => {

  const stmt = db.prepare(`
    UPDATE absences
    SET status = ?
    WHERE id = ?
  `);

  return stmt.run(nouveauStatus, id);
};




// HISTORIQUE — toutes les absences d'un étudiant
const getAbsencesByStudent = (student_id) => {
  return db.prepare(`
    SELECT * FROM absences
    WHERE student_id = ?
    ORDER BY date DESC
  `).all(student_id);
};

// COMPTER LES ABSENCE 

const countUnjustifiedAbsences = (student_id) => {

    const result = db.prepare(`
        SELECT COUNT(*) AS total
        FROM absences
        WHERE student_id = ?
        AND status = ?
    `).get(student_id, "non_justifiee");

    return result.total;
};



export {createAbsence,marquerAbsence,getAbsencesByStudent, countUnjustifiedAbsences}