import { Music } from "./views.js";

export async function fetchCollectionData() {
    let documents = [
        new Music("Teste", "teste", "Levada", "C", "acaso-nao-sabeis.html", "1"),
        new Music("Outro Teste", "teste", "Levada", "D", "bom-e-agradavel.html", "1"),
        new Music("Testando de Novo", "teste", "Levada", "D", "bom-e-agradavel.html", "1"),
        new Music("Testando de Novo", "teste", "Levada", "D", "bom-e-agradavel.html", "1")
      ];;
    
    return documents;
  }
  
  export async function getFileURL(audioPath) {    
    return `http://test.com/${audioPath}`;
  }