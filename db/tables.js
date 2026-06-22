import db from "./database.js";

// CREATION DE LA TABLE users
const tableUsers = `
    CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        password TEXT NOT NULL
    )
`;
db.exec(tableUsers);
const insertUsers = db.prepare(`
        INSERT INTO users(name, role, password)
        VALUES(?, ?, ?)
`);

// CREATION DE LA TABLE students
const tableStudents = `
        CREATE TABLE IF NOT EXISTS students(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            matricule TEXT UNIQUE NOT NULL,
            nom TEXT NOT NULL,
            prenom TEXT NOT NULL,
            age INTEGER NOT NULL,
            classe TEXT NOT NULL
        )
    `;
db.exec(tableStudents);
const insertStudents = db.prepare(`
            INSERT OR IGNORE INTO students(matricule, nom, prenom, age, classe)
            VALUES(?, ?, ?, ?, ?)
    `);

// CREATION DE LA TABLE teachers
const tableTeachers = `
    CREATE TABLE IF NOT EXISTS teachers(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        matiere TEXT NOT NULL
    )
`;
db.exec(tableTeachers);
const insertTeachers = db.prepare(`
        INSERT INTO teachers(nom, matiere)
        VALUES(?, ?)
`);

// CREATION DE LA TABLE subjects
const tableSubjects = `
    CREATE TABLE IF NOT EXISTS subjects(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        teacher_id INTEGER,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    )
`;
db.exec(tableSubjects);
const insertSubjects = db.prepare(`
        INSERT INTO subjects(nom, teacher_id)
        VALUES(?, ?)
`);

// CREATION DE LA TABLE grades
const tableGrades = `
    CREATE TABLE IF NOT EXISTS grades(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        note REAL NOT NULL CHECK (note >= 0 AND note <= 20),
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (subject_id) REFERENCES subjects(id)
    )
`;
db.exec(tableGrades);
const insertGrades = db.prepare(`
        INSERT INTO grades(student_id, subject_id, note)
        VALUES(?, ?, ?)
`);

// CREATION DE LA TABLE Absences
const tableAbsences = `
    CREATE TABLE IF NOT EXISTS absences(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id)
    )
`;
db.exec(tableAbsences);
const insertAbsences = db.prepare(`
        INSERT INTO absences(student_id, date, status)
        VALUES(?, ?, ?)
`);

// Insertions
insertUsers.run("Bob LeBon", "enseignant", "mdp_bob123");
insertUsers.run("Alice Peigne", "admin", "mdp_alice456");

insertStudents.run("MAT-2026-001", "Kouadio", "Menelick", 18, "1er A1");
insertStudents.run("MAT-2026-002", "Diallo", "Amoin", 19, "1er A1");
insertStudents.run("MAT-2026-003", "Koffi", "Sebastien", 18, "1er C1");

insertTeachers.run("IRIE BI", "Mathématiques");
insertTeachers.run("DRAMANE SCHELLA", "Français");

insertSubjects.run("Mathématiques", 1);
insertSubjects.run("Français", 2);

insertGrades.run(1, 1, 15.5);
insertGrades.run(2, 1, 10.5);
insertGrades.run(1, 2, 9);
insertGrades.run(2, 2, 16);

const nowDate = new Date().toISOString().split("T")[0];
insertAbsences.run(1, nowDate, "Justifié");
insertAbsences.run(3, nowDate, "non-justifié");

console.log("Données de test insérées avec succès");

const queryGrades = db.prepare(`
    SELECT 
        students.nom,
        students.prenom,
        subjects.nom AS matiere,
        grades.note
    FROM grades
    JOIN students ON grades.student_id = students.id
    JOIN subjects ON grades.subject_id = subjects.id
`);
console.log("LISTE DES NOTES");
console.log(queryGrades.all());