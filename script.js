const STUDENTS_DATA = [
    "Isabella García", "Annelis Alzolar", "Franniel Rodriguez", "Laura Fermín", 
    "Rania Cabeza", "Yenny Perdomo", "Gabriela Requena", "Fiorella Colina", 
    "Diego Marín", "Matías Becerra", "Leonardo Portero", "Oliver Josué", 
    "Pablo Navarro", "Samuel Jiménez", "París Elena"
];

// Los valores se almacenan INTERNAMENTE como enteros (multiplicados por 100) para evitar problemas de punto flotante.
const MAX_LIFE = 2000;       // Representa 20.00
const INITIAL_LIFE_VALUE = 2000; // Representa 20.00 (Vida completa)
const KEY_PREFIX = 'studentTraits_';

// Constantes de penalización (x100)
const PENALTY_GROSERIAS = 50;           // 0.50
const PENALTY_FALTA_INJUSTIFICADA = 70; // 0.70
const PENALTY_DISCIPLINA = 70;          // 0.70
const PENALTY_VESTIMENTA = 25;          // 0.25
const PENALTY_GLOBAL = 70;              // 0.70 (Para el botón de inicio)

const DECIMAL_DIVISOR = 100; // Para convertir de interno a visible

let currentStudentName = null;

// Estructura de datos por defecto para un estudiante
function getDefaultTraitData() {
    return {
        life: INITIAL_LIFE_VALUE 
    };
}

// ----------------------------------------------------
// MANEJO DE DATOS (LOAD, SAVE, CONVERSIÓN)
// ----------------------------------------------------

/**
 * Convierte un valor interno (entero, x100) a un valor decimal visible.
 * @param {number} value - Valor interno entero.
 * @returns {string} - Valor visible (ej: "20.00", "19.75", "0.00").
 */
function formatValue(value) {
    const decimalValue = (parseInt(value) || 0) / DECIMAL_DIVISOR;
    return decimalValue.toFixed(2);
}

/**
 * Carga los datos de rasgos de un estudiante desde localStorage.
 */
function loadStudentData(name) {
    const key = KEY_PREFIX + name;
    const storedData = localStorage.getItem(key);
    
    if (storedData) {
        const data = JSON.parse(storedData);
        data.life = parseInt(data.life) || INITIAL_LIFE_VALUE;
        // Limitar la vida entre 0 y MAX_LIFE
        if (data.life > MAX_LIFE) {
             data.life = MAX_LIFE;
        } else if (data.life < 0) {
             data.life = 0;
        }
        return { life: data.life }; 
    } else {
        // Si no hay datos, se inicializa con el valor correcto (2000 = 20.00)
        const data = getDefaultTraitData();
        saveStudentData(name, data);
        return data;
    }
}

/**
 * Guarda los datos de rasgos de un estudiante en localStorage.
 */
function saveStudentData(name, data) {
    const key = KEY_PREFIX + name;
    localStorage.setItem(key, JSON.stringify(data));
    updateStudentCardLife(name, data.life);
}

// ----------------------------------------------------
// NAVEGACIÓN Y RENDERIZACIÓN DE PANTALLAS
// ----------------------------------------------------

function switchScreen(showId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(showId).classList.add('active');
}

/**
 * Renderiza la lista de estudiantes en la pantalla de inicio.
 */
function renderStudentList() {
    const listContainer = document.getElementById('student-list');
    listContainer.innerHTML = '';

    STUDENTS_DATA.forEach(name => {
        const data = loadStudentData(name); 
        
        const card = document.createElement('div');
        card.className = 'student-card';
        card.dataset.name = name;
        
        const lifeDisplay = formatValue(data.life);

        // Ícono: Calavera si la vida es muy baja (menos de 0.50)
        let heartIcon = (data.life >= PENALTY_GROSERIAS) ? '<i class="fas fa-heart"></i>' : '<i class="fas fa-skull"></i>';

        card.innerHTML = `
            <span class="student-name">${name}</span>
            <span class="student-trait" data-life="${data.life}">
                ${heartIcon} ${lifeDisplay}/${formatValue(MAX_LIFE)}
            </span>
        `;
        
        card.addEventListener('click', () => openStudentProfile(name));
        listContainer.appendChild(card);
    });
}

/**
 * Actualiza el valor de vida en la tarjeta de la lista.
 */
function updateStudentCardLife(name, life) {
    const cardSpan = document.querySelector(`.student-card[data-name="${name}"] .student-trait`);
    if (cardSpan) {
        const lifeDisplay = formatValue(life);
        let heartIcon = (life >= PENALTY_GROSERIAS) ? '<i class="fas fa-heart"></i>' : '<i class="fas fa-skull"></i>';
        cardSpan.innerHTML = `${heartIcon} ${lifeDisplay}/${formatValue(MAX_LIFE)}`; 
    }
}

/**
 * Actualiza la barra de vida y los valores numéricos en el perfil.
 */
function updateProfileView(life) {
    const bar = document.getElementById('trait-bar');
    const valueSpan = document.getElementById('trait-value');
    
    let lifeForPercent = Math.max(0, life);
    let percent = (lifeForPercent / MAX_LIFE) * 100;
    
    bar.style.width = `${percent}%`;
    valueSpan.textContent = `${formatValue(life)}/${formatValue(MAX_LIFE)}`; 
    
    if (life === 0) {
        bar.style.backgroundColor = 'var(--color-negative)'; 
    } else {
        bar.style.backgroundColor = 'var(--color-positive)'; 
    }
}


function openStudentProfile(name) {
    currentStudentName = name;
    const data = loadStudentData(name);

    document.getElementById('profile-name').textContent = name;
    document.getElementById('profile-title').textContent = `Perfil de ${name.split(' ')[0]}`;
    
    updateProfileView(data.life); 
    switchScreen('profile-screen');
}

// ----------------------------------------------------
// LÓGICA DE ACCIÓN INDIVIDUAL (PENALIZACIONES)
// ----------------------------------------------------

/**
 * Maneja las acciones de disminuir la barra de vida según el tipo de penalización.
 */
function handleTraitAction(penaltyType) {
    if (!currentStudentName) return;

    const studentData = loadStudentData(currentStudentName);
    let newLife = studentData.life;
    let deduction = 0;

    switch (penaltyType) {
        case 'groserias':
            deduction = PENALTY_GROSERIAS; 
            break;
        case 'falta':
            deduction = PENALTY_FALTA_INJUSTIFICADA; 
            break;
        case 'disciplina':
            deduction = PENALTY_DISCIPLINA; 
            break;
        case 'vestimenta':
            deduction = PENALTY_VESTIMENTA; 
            break;
        default:
            return; 
    }
    
    newLife -= deduction;
    
    if (newLife < 0) {
        newLife = 0;
    }

    studentData.life = newLife;
    
    saveStudentData(currentStudentName, studentData); 
    updateProfileView(studentData.life);
}

// ----------------------------------------------------
// LÓGICA DE REINICIO GLOBAL
// ----------------------------------------------------

/**
 * Borra todos los datos de rasgos de todos los estudiantes del LocalStorage.
 */
function resetAllTraits() {
    const confirmation = confirm("¡ADVERTENCIA! ¿Estás seguro de que quieres REINICIAR los rasgos de TODOS los estudiantes? Esta acción no se puede deshacer y todos volverán a 20.00.");

    if (confirmation) {
        STUDENTS_DATA.forEach(name => {
            const key = KEY_PREFIX + name;
            localStorage.removeItem(key);
        });
        
        renderStudentList();
        alert("Todos los rasgos han sido reiniciados a 20.00.");
    }
}

// ----------------------------------------------------
// LÓGICA DE PENALIZACIÓN GLOBAL (0.70 a TODOS)
// ----------------------------------------------------

function applyGlobalPenalty() {
    const confirmation = confirm("¡ADVERTENCIA! ¿Estás seguro de que quieres aplicar una penalización de -0.70 a TODOS los estudiantes?");

    if (confirmation) {
        let studentsPenalized = 0;
        
        STUDENTS_DATA.forEach(name => {
            const studentData = loadStudentData(name);
            let newLife = studentData.life - PENALTY_GLOBAL; // Restamos 70 (0.70)
            
            if (newLife < 0) {
                newLife = 0;
            }

            if (studentData.life !== newLife) {
                studentData.life = newLife;
                saveStudentData(name, studentData);
                studentsPenalized++;
            }
        });
        
        // Si el usuario está en un perfil, actualizamos la vista
        if (currentStudentName) {
            const data = loadStudentData(currentStudentName);
            updateProfileView(data.life);
        }
        
        renderStudentList();
        
        alert(`Penalización global de -0.70 aplicada a ${studentsPenalized} estudiantes.`);
    }
}


// ----------------------------------------------------
// Inicialización y Event Listeners
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // 1. Iniciar la lista de estudiantes
    renderStudentList();

    // 2. Configurar el botón de volver (perfil -> lista)
    document.getElementById('back-button').addEventListener('click', () => {
        currentStudentName = null;
        switchScreen('home-screen');
        renderStudentList(); 
    });

    // 3. Configurar los botones de penalización individuales
    document.querySelectorAll('.action-btn[data-penalty]').forEach(button => {
        button.addEventListener('click', (e) => {
            const penalty = e.currentTarget.dataset.penalty;
            handleTraitAction(penalty);
        });
    });

    // 4. Configurar el botón de Reinicio Global
    const resetButton = document.getElementById('reset-all-btn');
    if (resetButton) {
        resetButton.addEventListener('click', resetAllTraits);
    }
    
    // 5. Configurar el NUEVO botón de Penalización Global
    const globalPenaltyButton = document.getElementById('global-penalty-btn');
    if (globalPenaltyButton) {
        globalPenaltyButton.addEventListener('click', applyGlobalPenalty);
    }
});