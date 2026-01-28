// 한글 키보드 컴포넌트 - 표준 한글 자판 배열 (Shift 지원)

const KEYBOARD_LAYOUT = [
    ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
    ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
    ['SHIFT', 'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ', 'BACK'],
    ['ENTER'] // 엔터를 독립된 마지막 줄 혹은 레이아웃에 맞춰 배치
];

// 엔터 위치 조정을 위해 레이아웃 재구성
const FINAL_LAYOUT = [
    ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
    ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
    ['SHIFT', 'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ', 'BACK'],
    ['ENTER']
];

// 쌍자음/복합모음 매핑
const SHIFT_MAP = {
    'ㅂ': 'ㅃ', 'ㅈ': 'ㅉ', 'ㄷ': 'ㄸ', 'ㄱ': 'ㄲ', 'ㅅ': 'ㅆ',
    'ㅐ': 'ㅒ', 'ㅔ': 'ㅖ',
    'ㅃ': 'ㅂ', 'ㅉ': 'ㅈ', 'ㄸ': 'ㄷ', 'ㄲ': 'ㄱ', 'ㅆ': 'ㅅ',
    'ㅒ': 'ㅐ', 'ㅖ': 'ㅔ'
};

let isShiftActive = false;

function createKeyboard(onKeyPress) {
    const keyboard = document.getElementById('keyboard');
    keyboard.innerHTML = '';

    FINAL_LAYOUT.forEach(row => {
        const rowElement = document.createElement('div');
        rowElement.className = 'keyboard-row';

        row.forEach(key => {
            const keyElement = document.createElement('button');
            keyElement.className = 'key';
            keyElement.dataset.key = key;

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
            } else {
                keyElement.textContent = key;
                keyElement.dataset.key = key;
            }

            keyElement.addEventListener('click', () => {
                if (keyElement.dataset.key === 'Shift') {
                    toggleShift();
                } else {
                    onKeyPress(keyElement.dataset.key);
                    // 글자 입력 후에는 자동으로 Shift 해제 (일반적인 한글 입력기 방식)
                    if (isShiftActive) toggleShift();
                }
            });

            rowElement.appendChild(keyElement);
        });

        keyboard.appendChild(rowElement);
    });
}

function toggleShift() {
    isShiftActive = !isShiftActive;
    const shiftBtn = document.querySelector('.shift-key');
    if (shiftBtn) {
        shiftBtn.classList.toggle('active', isShiftActive);
    }

    const keys = document.querySelectorAll('.key');
    keys.forEach(keyElement => {
        const currentKey = keyElement.dataset.key;
        if (SHIFT_MAP[currentKey]) {
            const newKey = SHIFT_MAP[currentKey];
            keyElement.textContent = newKey;
            keyElement.dataset.key = newKey;
        }
    });
}

function updateKeyboard(keyboardState) {
    const keys = document.querySelectorAll('.key');

    keys.forEach(key => {
        const char = key.dataset.key;
        if (['Enter', 'Backspace', 'Shift'].includes(char)) return;

        const state = keyboardState[char];
        if (state) {
            key.classList.remove('correct', 'present', 'absent');
            key.classList.add(state);
        }
    });
}
