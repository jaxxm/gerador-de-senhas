
let recentPasswords = [];
const maxRecentPasswords = 5;

const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    similar: 'il1Lo0O',
    ambiguous: '{}[]()/\\\'"`~,;.<>'
};

document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    updateLengthValue();
    generatePassword();
    
    document.getElementById('length').addEventListener('input', updateLengthValue);
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', generatePassword);
    });
});

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    const themeToggle = document.querySelector('.theme-toggle');
    
    document.documentElement.setAttribute('data-theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    
    localStorage.setItem('theme', newTheme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const themeToggle = document.querySelector('.theme-toggle');
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

function updateLengthValue() {
    const lengthInput = document.getElementById('length');
    const lengthValue = document.getElementById('lengthValue');
    lengthValue.textContent = lengthInput.value;
}

function generatePassword() {
    const length = parseInt(document.getElementById('length').value);
    const options = {
        uppercase: document.getElementById('uppercase').checked,
        lowercase: document.getElementById('lowercase').checked,
        numbers: document.getElementById('numbers').checked,
        symbols: document.getElementById('symbols').checked,
        similar: document.getElementById('similar').checked,
        ambiguous: document.getElementById('ambiguous').checked
    };

    if (!Object.values(options).some(option => option)) {
        showToast('Selecione pelo menos uma caractere!', 'erro');
        return;
    }

    let charset = '';
    if (options.uppercase) charset += charSets.uppercase;
    if (options.lowercase) charset += charSets.lowercase;
    if (options.numbers) charset += charSets.numbers;
    if (options.symbols) charset += charSets.symbols;

    if (!options.similar) {
        charset = charset.split('').filter(char => !charSets.similar.includes(char)).join('');
    }

    if (!options.ambiguous) {
        charset = charset.split('').filter(char => !charSets.ambiguous.includes(char)).join('');
    }

    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    password = ensureCharacterTypes(password, options);

    document.getElementById('passwordOutput').value = password;
    
    evaluateStrength(password);
    
    addToRecentPasswords(password);
}

function ensureCharacterTypes(password, options) {
    const passwordArray = password.split('');
    let position = 0;

    if (options.uppercase && !password.match(/[A-Z]/)) {
        passwordArray[position] = charSets.uppercase.charAt(Math.floor(Math.random() * charSets.uppercase.length));
        position++;
    }

    if (options.lowercase && !password.match(/[a-z]/)) {
        passwordArray[position] = charSets.lowercase.charAt(Math.floor(Math.random() * charSets.lowercase.length));
        position++;
    }

    if (options.numbers && !password.match(/[0-9]/)) {
        passwordArray[position] = charSets.numbers.charAt(Math.floor(Math.random() * charSets.numbers.length));
        position++;
    }

    if (options.symbols && !password.match(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/)) {
        passwordArray[position] = charSets.symbols.charAt(Math.floor(Math.random() * charSets.symbols.length));
        position++;
    }

    for (let i = passwordArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
    }

    return passwordArray.join('');
}

function evaluateStrength(password) {
    let score = 0;
    let feedback = '';

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.match(/[a-z]/)) score += 1;
    if (password.match(/[A-Z]/)) score += 1;
    if (password.match(/[0-9]/)) score += 1;
    if (password.match(/[^a-zA-Z0-9]/)) score += 1;
    if (password.length >= 16) score += 1;

    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');

    if (score <= 2) {
        strengthFill.className = 'strength-fill strength-weak';
        strengthFill.style.width = '33%';
        feedback = 'Fracas - Considere senhas mais longas com mais tipos de caracteres';
    } else if (score <= 4) {
        strengthFill.className = 'strength-fill strength-medium';
        strengthFill.style.width = '66%';
        feedback = 'Médias - Boa senha, Porem com algo há melhorar';
    } else {
        strengthFill.className = 'strength-fill strength-strong';
        strengthFill.style.width = '100%';
        feedback = 'Fortes -senha perfeita!';
    }

    strengthText.textContent = feedback;
}

function copyPassword() {
    const passwordOutput = document.getElementById('passwordOutput');
    
    if (!passwordOutput.value) {
        showToast('Não a senhas para copiar!', 'erro');
        return;
    }

    navigator.clipboard.writeText(passwordOutput.value).then(() => {
        showToast('Senhas copiadas para a área de transferência!');
    }).catch(() => {

        passwordOutput.select();
        document.execCommand('copy');
        showToast('Senhas copiadas para a área de transferência!');
    });
}


function addToRecentPasswords(password) {

    if (recentPasswords.includes(password)) return;
    
    recentPasswords.unshift(password);
    
    if (recentPasswords.length > maxRecentPasswords) {
        recentPasswords = recentPasswords.slice(0, maxRecentPasswords);
    }
    
    updateRecentPasswordsList();
}

function updateRecentPasswordsList() {
    const recentList = document.getElementById('recentList');
    
    if (recentPasswords.length === 0) {
        recentList.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">Nenhuma senha recente</p>';
        return;
    }

    recentList.innerHTML = recentPasswords.map(password => `
        <div class="recent-item">
            <div class="recent-password">${password}</div>
            <button class="recent-copy" onclick="copyRecentPassword('${password}')">Copiar</button>
        </div>
    `).join('');
}

function copyRecentPassword(password) {
    navigator.clipboard.writeText(password).then(() => {
        showToast('Senhas copiada!');
    }).catch(() => {
        showToast('Error ao copiar senha', 'erro');
    });
}

function showToast(message, type = 'succeso') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type === 'error' ? 'error' : ''}`;
    
    if (type === 'error') {
        toast.style.background = 'var(--danger-color)';
    } else {
        toast.style.background = 'var(--success-color)';
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            generatePassword();
        }
    }
    
    if (e.ctrlKey && e.key === 'c') {
        if (e.target.id !== 'passwordOutput') {
            e.preventDefault();
            copyPassword();
        }
    }
});