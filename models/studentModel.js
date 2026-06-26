class Student {
  constructor(matricule, nom, prenom, age, classe, user_id = null) {
    this.matricule = matricule;
    this.nom = nom;
    this.prenom = prenom;
    this.age = age;
    this.classe = classe;
    this.user_id = user_id;      // ← sera renseigné après création du user lié
  }
}

export default Student;