// 한글 키보드 컴포넌트 - 표준 한글 자판 배열

const KEYBOARD_LAYOUT = [
    ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
    ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
    ['ENTER', 'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ', 'BACK']
];

// 쌍자음 매핑 (Shift + 자음)
const DOUBLE_CONSONANTS = {
    'ㅂ': 'ㅃ', 'ㅈ': 'ㅉ', 'ㄷ': 'ㄸ', 'ㄱ': 'ㄲ', 'ㅅ': 'ㅆ'
};

// 복합 모음 매핑
const COMPLEX_VOWELS = {
    'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ',
    'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ',
    'ㅡㅣ': 'ㅢ'
};

function createKeyboard(onKeyPress) {
    const keyboard = document.getElementById('keyboard');
    keyboard.innerHTML = '';

    KEYBOARD_LAYOUT.forEach(row => {
        const rowElement = document.createElement('div');
        rowElement.className = 'keyboard-row';

        row.forEach(key => {
            const keyElement = document.createElement('button');
            keyElement.className = 'key';

            if (key === 'ENTER') {
                keyElement.textContent = '입력';
                keyElement.classList.add('wide');
                keyElement.dataset.key = 'Enter';
            } else if (key === 'BACK') {
                keyElement.textContent = '←';
                keyElement.classList.add('wide');
                keyElement.dataset.key = 'Backspace';
            } else {
                keyElement.textContent = key;
                keyElement.dataset.key = key;
            }

            keyElement.addEventListener('click', () => {
                onKeyPress(keyElement.dataset.key);
            });

            rowElement.appendChild(keyElement);
        });

        keyboard.appendChild(rowElement);
    });
}

function updateKeyboard(keyboardState) {
    const keys = document.querySelectorAll('.key');

    keys.forEach(key => {
        const char = key.dataset.key;
        if (char === 'Enter' || char === 'Backspace') return;

        const state = keyboardState[char];
        if (state) {
            key.classList.remove('correct', 'present', 'absent');
            key.classList.add(state);
        }
    });
}
