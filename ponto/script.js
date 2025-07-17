function gerarSenha() {
    let tamanho = document.getElementById("tamanho").value;
    tamanho = parseInt(tamanho);
    
    let caracteres = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    
    let senha = "";
    for (let i = 0; i < tamanho; i++) {
        let indiceAleatorio = Math.floor(Math.random() * caracteres.length);
        senha += caracteres.charAt(indiceAleatorio);
    }
    
    document.getElementById("senha").value = senha;
}

function copiarSenha() {
    
    let senhaInput = document.getElementById("senha");

    
    senhaInput.select();
    senhaInput.setSelectionRange(0, 99999);
    
    document.execCommand("copy");
    
    alert("Senha copiada para a área de transferência!");
}