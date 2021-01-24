function calculate(dirtyString) {
    const start = new Date().getTime();
    const str = dirtyString.replace(/\s*/g, '');
    const array = str.match(/(?<=\d)-(?=-?\d)|(-?\d+\.\d+)|(-?\d+)|[+*/]/g).map(item => /[-+*/](?!-?\d+)/.test(item) ? item : +item);
    console.log(array);

    const calc = {
        '+': (a,b) => +parseFloat(a+b).toFixed(2),
        '-': (a,b) => +parseFloat(a-b).toFixed(2),
        '*': (a,b) => +parseFloat(a*b).toFixed(2),
        '/': (a,b) => +a === 0 || +b === 0 ? 0 : +parseFloat(a/b).toFixed(2)
    }
    
    const low = (idx) => {
        for (let i = idx-1; i >= 0; i--) {
            if (array[i] !== null) {
                const num = array[i];
                array[i] = null;
                return num;
            }
        }
    };

    const high = (idx) => {
        for (let i = idx+1; i <= array.length; i++) {
            if (array[i] !== null) {
                const num = array[i];
                array[i] = null;
                return num;
            }
        }
    };

    array.forEach((item,i) => {
        if (/[*/]/.test(item)) {
            array[i] = calc[item](low(i),high(i));
        }
    });

    array.forEach((item,i) => {
        if (/[-+]/.test(item)) {
            array[i] = calc[item](low(i),high(i));
        }
    });

    return {total: array.find(i => i !== null), time: new Date().getTime() - start};
}

const outer = document.querySelector('.outer');
const timeInfo = document.querySelector('.time');

document.querySelector('.form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (e.target.field.value !== '') {
        const result = calculate(e.target.field.value);
        e.target.field.value = result.total;
        outer.innerHTML = result.total
        timeInfo.innerHTML = `It took <b>${result.time}</b> millisecond(s) to solve the example.`
    }
});

document.querySelector('.form').addEventListener('input', (e) => {
    e.preventDefault();
    outer.innerHTML = 0;
    timeInfo.innerHTML = '?';
})
