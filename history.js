const history = document.querySelector('.history');
const store = [];
const limit = 10;

function genCalcData() {
    const str = store.reduce((acc, {task, timeParse, timePolNot, timeCalc, timeTotal, result}) => {
        return acc += `<div class='item__history'>
            <p>Задача: <b>${task}</b></p>
            <p>Ответ: <b>${result}</b></p>
            <p>Время парсинга строки: <b>${timeParse}</b> мс.</p>
            <p>Время формирования "польской записи": <b>${timePolNot}</b> мс.</p>
            <p>Время разбора "ПЗ" и вычисления: <b>${timeCalc}</b> мс.</p>
            <p>Итоговое время: <b>${timeTotal}</b> мс.</p>
        </div>`
    }, '')

    return str;
}

export function handlerResult(data) {
    store.push(data);
    if (store.length > limit) store.pop();
    history.innerHTML = '';
    history.insertAdjacentHTML('beforeend', genCalcData())
}