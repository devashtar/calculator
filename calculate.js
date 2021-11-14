import { handlerResult } from "./history.js";

const form = document.querySelector('.calculator');
const input = form[0];
const btn = form[1];

input.addEventListener('input', ({target: { value }}) => {
    if (value === '' || value.trim() === '') return btn.disabled = 'disabled';
    btn.disabled = '';
})

form.addEventListener('submit', function(event) {
    event.preventDefault();
    const start = Date.now();
    const obj = {}

    const { parseArray, timeParse } = parseString(this[0].value);
    obj.task = parseArray.join('');
    obj.timeParse = timeParse;

    const { polishNotationArray, timePolNot } = getPolishNotation(parseArray);
    obj.timePolNot = timePolNot;

    const { result, timeCalc } = parsePolishNotationArray(polishNotationArray);
    obj.timeCalc = timeCalc;
    obj.timeTotal = Date.now() - start;
    obj.result = result;

    handlerResult(obj);

    this[0].value = '';
});

const prior = { // Приоритеты
    '(': 4,
    '^': 3,
    '*': 2,
    '/': 2,
    '+': 1,
    '-': 1
}

const calc = {
    fixFloatNum: (n) => (Math.round(+n * 1000) / 1000), // Если число с плавающей точкой, то сократить запись после точки
    '+': (a, b) => +a + +b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a === '0' || b === '0' ? 0 : Math.round(a / b * 1000) / 1000,    // Если число с плавающей точкой, то сократить запись после точки
    '^': (a, b) => a ** b
}


function parseString(dirtyString) {     // Удаляем пробелы со строки и достаем операторы с операндами, а так же скобки.
    const start = Date.now();
    const str = dirtyString.replace(/\s*/g, '');
    const array = str.match(/(?<=\d)-(?=-?\d)|(-?\d+\.\d+)|(?<=[)])-|(-?\d+)|[-](?=\()|[+*/()^]/g);
    return { parseArray: array, timeParse: Date.now() - start };
}

function getPolishNotation(array) {

    const start = Date.now();

    const outputArray = [],   // итоговый массив без "скобок"
        stackTempValues = [];   // Временный стек с операторами и открывающей скобкой [+-/*(]

    for (const value of array) {
        if (/-?\d+/.test(value)) {  // если число(положительное, отрицательное, дробное) то добавить в итоговый массив
            
            outputArray.push(value);

        } else if (/[(]/.test(value)) {     // если "открывающая скобка" то добавить в итоговый массив

            stackTempValues.push(value);

        } else if (/[)]/.test(value)) {     // если "закрывающая скобка" то вытаскиваем(с конца массива "стека") элементы, пока не попадётся "открывающая скобка", удаляем ёё и останавливаемся.  

            for (let i = stackTempValues.length - 1; i >= 0; i--) {
                if (/[(]/.test(stackTempValues[i])) {
                    stackTempValues.pop();
                    break;
                } else {
                    outputArray.push(stackTempValues.pop());
                }
            }

        } else {    // обрабатываем операторы [+-/*^], в зависимости от оператора(лево-ассоциативный, право-ассоциативный)  

            /*
                ЕСЛИ оператор на вершине стека приоритетнее текущего оператора(согласно таблицы(объекта) "prior");
                ЕСЛИ операция на вершине стека лево-ассоциативная с приоритетом как у текущего оператора(согласно таблицы(объекта) "prior");
                ТОГДА выталкиваем верхний элемент стека(stackTempValues) в выходную строку(outputArray) пока в этом стеке не встретится правило, не удовлетворяющее двум предыдущим или стек станет пустым.
            */

            const weightCurOperator = prior[value];

            for (let i = stackTempValues.length - 1; i >= 0; i--) {
                const weightLastStackOperator = prior[stackTempValues[i]];

                if (weightLastStackOperator > weightCurOperator || (value !== '^' && weightLastStackOperator === weightCurOperator)) {

                    if (weightLastStackOperator !== 4) {      //  4 === '(' - скобка является одним из ключевых значений, для работы с стеком(stackTempValues)
                        outputArray.push(stackTempValues.pop());
                    } else {    // как только цикл дошел до открывающей скобки в стеке, выходим
                        break; 
                    }
                }

            }

            stackTempValues.push(value);
            
        }
    }

    if (stackTempValues.length !== 0) {
        for (let i = stackTempValues.length - 1; i >= 0; i--) outputArray.push(stackTempValues.pop());
    }

    return { polishNotationArray: outputArray, timePolNot: Date.now() - start };
}

function parsePolishNotationArray(array) {  // Выполняем операции с "польской записью"

    const start = Date.now();

    const tmpArray = [];

    array.forEach(item => {     // Пока попадается "число", кладем его в tmpArray или берем из него два последних и выполняем операцию,
        if (/-?\d+/.test(item)) {   // после кладем получившийся результат в tmpArray, пока там не останется одно число(результат).
            tmpArray.push(item);
        } else {
            const op2 = tmpArray.pop();
            const op1 = tmpArray.pop();

            const result = calc[item](op1, op2);

            tmpArray.push(result)
        }
    });

    const currentResult = calc.fixFloatNum(tmpArray.pop());
    
    return { result: currentResult, timeCalc: Date.now() - start };
}

