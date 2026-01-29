// 한글 키보드 컴포넌트 - 표준 한글 자판 배열 (Shift 지원)

const HANGUL_LAYOUT = [
    ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
    ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
    ['SHIFT', 'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ', 'BACK'],
    ['LANG', 'ENTER']
];

const ENGLISH_LAYOUT = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
    ['LANG', 'ENTER']
];

const SHIFT_MAP = {
    'ㅂ': 'ㅃ', 'ㅈ': 'ㅉ', 'ㄷ': 'ㄸ', 'ㄱ': 'ㄲ', 'ㅅ': 'ㅆ',
    'ㅐ': 'ㅒ', 'ㅔ': 'ㅖ',
};

// 역매핑도 필요함
Object.keys(SHIFT_MAP).forEach(key => {
    SHIFT_MAP[SHIFT_MAP[key]] = key;
});

let isShiftActive = false;
let currentLanguage = 'KOR'; // 'KOR' or 'ENG'

function createKeyboard(onKeyPress) {
    const keyboard = document.getElementById('keyboard');
    keyboard.innerHTML = '';

    const layout = currentLanguage === 'KOR' ? HANGUL_LAYOUT : ENGLISH_LAYOUT;

    layout.forEach(row => {
        const rowElement = document.createElement('div');
        rowElement.className = 'keyboard-row';

        row.forEach(key => {
            const keyElement = document.createElement('button');
            keyElement.className = 'key';

            if (key === 'ENTER') {
                keyElement.textContent = '입력';
                keyElement.classList.add('wide', 'enter-key');
                keyElement.dataset.key = 'Enter';
            } else if (key === 'BACK') {
                keyElement.textContent = '←';
                keyElement.classList.add('wide');
                keyElement.dataset.key = 'Backspace';
            } else if (key === 'SHIFT') {
                keyElement.textContent = '⇧';
                keyElement.classList.add('wide', 'shift-key');
                keyElement.dataset.key = 'Shift';
            } else if (key === 'LANG') {
                keyElement.textContent = currentLanguage === 'KOR' ? '한/A' : 'A/한';
                keyElement.classList.add('wide', 'lang-key');
                keyElement.dataset.key = 'Lang';
            } else {
                keyElement.textContent = key;
                keyElement.dataset.key = key;
            }

            keyElement.addEventListener('click', () => {
                const keyValue = keyElement.dataset.key;
                if (keyValue === 'Shift') {
                    toggleShift();
                } else if (keyValue === 'Lang') {
                    toggleLanguage(onKeyPress);
                } else {
                    onKeyPress(keyValue);
                    if (isShiftActive) toggleShift();
                }
            });

            rowElement.appendChild(keyElement);
        });

        keyboard.appendChild(rowElement);
    });
}

function toggleLanguage(onKeyPress) {
    currentLanguage = currentLanguage === 'KOR' ? 'ENG' : 'KOR';
    isShiftActive = false;
    createKeyboard(onKeyPress);
}

function toggleShift() {
    isShiftActive = !isShiftActive;
    const shiftBtn = document.querySelector('.shift-key');
    if (shiftBtn) {
        shiftBtn.classList.toggle('active', isShiftActive);
    }

    if (currentLanguage === 'KOR') {
        const keys = document.querySelectorAll('.key');
        keys.forEach(keyElement => {
            const currentKey = keyElement.dataset.key;
            if (SHIFT_MAP[currentKey]) {
                const newKey = SHIFT_MAP[currentKey];
                keyElement.textContent = newKey;
                keyElement.dataset.key = newKey;
            }
        });
    } else {
        // 영어의 경우 대소문자 변환
        const keys = document.querySelectorAll('.key');
        keys.forEach(keyElement => {
            const char = keyElement.dataset.key;
            if (char.length === 1 && /[a-zA-Z]/.test(char)) {
                const newKey = isShiftActive ? char.toUpperCase() : char.toLowerCase();
                keyElement.textContent = newKey;
                keyElement.dataset.key = newKey;
            }
        });
    }
}

function updateKeyboard(keyboardState) {
    const keys = document.querySelectorAll('.key');

    keys.forEach(key => {
        const char = key.dataset.key;
        if (['Enter', 'Backspace', 'Shift', 'Lang'].includes(char)) return;

        const state = keyboardState[char];
        if (state) {
            key.classList.remove('correct', 'present', 'absent');
            key.classList.add(state);
        }
    });
}
