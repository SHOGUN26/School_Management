import readline from "readline";

//CREATION DE L'INTERFACE
 const reponse = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (text) =>
  new Promise((resolve) => reponse.question(text, resolve));

const fermerInterface = () => reponse.close();

export {question,fermerInterface}