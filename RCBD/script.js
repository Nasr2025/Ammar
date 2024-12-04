// متغيرات عامة للتحكم في البيانات
let treatments = 2;
let blocks = 2;
let data = [];

// دالة لتنسيق الأرقام
function formatNumber(num) {
    return Number(num.toFixed(2)).toString();
}

// إنشاء الجدول
function createTable() {
    const treatments = parseInt(document.getElementById('treatments').value);
    const blocks = parseInt(document.getElementById('blocks').value);

    if (!treatments || !blocks || treatments < 2 || blocks < 2) {
        alert('يجب أن يكون عدد المعاملات والمكررات 2 على الأقل');
        return;
    }

    let table = '<table><tr><th>المكررات / المعاملات</th>';
    
    // إنشاء رأس الجدول (المعاملات)
    for (let i = 1; i <= treatments; i++) {
        table += `<th>T${i}</th>`;
    }
    table += '</tr>';
    
    // إنشاء صفوف الجدول (المكررات)
    for (let i = 1; i <= blocks; i++) {
        table += `<tr><td>R${i}</td>`;
        for (let j = 1; j <= treatments; j++) {
            table += `<td><input type="number" id="value-${j}-${i}" step="0.01"></td>`;
        }
        table += '</tr>';
    }
    
    table += '</table>';
    
    document.getElementById('dataTable').innerHTML = table;
    document.getElementById('calculateBtn').style.display = 'block';
    document.getElementById('results').style.display = 'none';
}

// حساب النتائج
function calculateResults() {
    const treatments = parseInt(document.getElementById('treatments').value);
    const blocks = parseInt(document.getElementById('blocks').value);
    
    // تهيئة مصفوفة البيانات
    let data = Array(treatments).fill().map(() => Array(blocks).fill(0));
    
    // جمع البيانات من المدخلات
    let allValid = true;
    for (let i = 1; i <= treatments; i++) {
        for (let j = 1; j <= blocks; j++) {
            let value = parseFloat(document.getElementById(`value-${i}-${j}`).value);
            if (isNaN(value)) {
                alert('الرجاء إدخال جميع البيانات بشكل صحيح');
                allValid = false;
                break;
            }
            data[i-1][j-1] = value;
        }
        if (!allValid) break;
    }
    
    if (!allValid) return;
    
    // حساب المجاميع
    let treatmentSums = data.map(row => row.reduce((a, b) => a + b, 0));
    let blockSums = Array(blocks).fill(0);
    for (let j = 0; j < blocks; j++) {
        for (let i = 0; i < treatments; i++) {
            blockSums[j] += data[i][j];
        }
    }
    
    let grandTotal = treatmentSums.reduce((a, b) => a + b, 0);
    
    // حساب الإحصائيات
    let cf = Math.pow(grandTotal, 2) / (treatments * blocks);
    let totalSS = data.flat().reduce((a, b) => a + Math.pow(b, 2), 0) - cf;
    let treatmentSS = treatmentSums.reduce((a, b) => a + Math.pow(b, 2), 0) / blocks - cf;
    let blockSS = blockSums.reduce((a, b) => a + Math.pow(b, 2), 0) / treatments - cf;
    let errorSS = totalSS - treatmentSS - blockSS;
    
    // حساب درجات الحرية
    let treatmentDf = treatments - 1;
    let blockDf = blocks - 1;
    let errorDf = treatmentDf * blockDf;
    let totalDf = treatments * blocks - 1;
    
    // حساب متوسط المربعات
    let treatmentMS = treatmentSS / treatmentDf;
    let blockMS = blockSS / blockDf;
    let errorMS = errorSS / errorDf;
    
    // حساب قيمة F
    let fValue = treatmentMS / errorMS;
    
    // عرض النتائج مع القوانين
    document.querySelectorAll('.step-content')[0].innerHTML = `
        <div style="text-align: center;">
        C.F. = (G.T)² / (t × r)
        <br>C.F. = (${formatNumber(grandTotal)})² / (${treatments} × ${blocks})
        <br>C.F. = ${formatNumber(cf)}
        </div>
    `;
    
    document.querySelectorAll('.step-content')[1].innerHTML = `
        <div style="text-align: center;">
        Total SS = Σ(X²) - C.F.
        <br>Total SS = ${formatNumber(totalSS)}
        </div>
    `;
    
    document.querySelectorAll('.step-content')[2].innerHTML = `
        <div style="text-align: center;">
        Treatment SS = (Σ(Ti²)/r) - C.F.
        <br>Treatment SS = ${formatNumber(treatmentSS)}
        </div>
    `;
    
    document.querySelectorAll('.step-content')[3].innerHTML = `
        <div style="text-align: center;">
        Replicates SS = (Σ(Ri²)/t) - C.F.
        <br>Replicates SS = ${formatNumber(blockSS)}
        </div>
    `;
    
    document.querySelectorAll('.step-content')[4].innerHTML = `
        <div style="text-align: center;">
        Error SS = Total SS - (Treatment SS + Replicates SS)
        <br>Error SS = ${formatNumber(errorSS)}
        </div>
    `;
    
    // إنشاء جدول ANOVA
    document.getElementById('anovaTable').innerHTML = `
        <table dir="ltr">
            <tr>
                <th>S.O.V</th>
                <th>d.f</th>
                <th>S.S</th>
                <th>M.S</th>
                <th>F. cal</th>
            </tr>
            <tr>
                <td>Treatment</td>
                <td>${treatmentDf}</td>
                <td>${formatNumber(treatmentSS)}</td>
                <td>${formatNumber(treatmentMS)}</td>
                <td>${formatNumber(fValue)}</td>
            </tr>
            <tr>
                <td>Replicates</td>
                <td>${blockDf}</td>
                <td>${formatNumber(blockSS)}</td>
                <td>${formatNumber(blockMS)}</td>
                <td>-</td>
            </tr>
            <tr>
                <td>Error</td>
                <td>${errorDf}</td>
                <td>${formatNumber(errorSS)}</td>
                <td>${formatNumber(errorMS)}</td>
                <td>-</td>
            </tr>
            <tr>
                <td>Total</td>
                <td>${totalDf}</td>
                <td>${formatNumber(totalSS)}</td>
                <td>-</td>
                <td>-</td>
            </tr>
        </table>
    `;
    
    document.getElementById('results').style.display = 'block';
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

// تحسين وظيفة الطي
function toggleStep(element) {
    const content = element.nextElementSibling;
    const arrow = element.querySelector('.arrow');
    
    // إغلاق جميع الخطوات الأخرى
    document.querySelectorAll('.step-content.show').forEach(item => {
        if (item !== content) {
            item.classList.remove('show');
            item.previousElementSibling.querySelector('.arrow').style.transform = 'rotate(0deg)';
        }
    });
    
    // تبديل حالة الخطوة الحالية
    content.classList.toggle('show');
    arrow.style.transform = content.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
}

// تهيئة الجدول عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', createTable);

// إضافة مستمعي الأحداث
document.getElementById('createTableBtn').addEventListener('click', createTable);
document.getElementById('calculateBtn').addEventListener('click', calculateResults);

// إضافة مستمعي الأحداث
document.getElementById('treatments').addEventListener('change', (e) => {
    treatments = parseInt(e.target.value);
    createTable();
});

document.getElementById('blocks').addEventListener('change', (e) => {
    blocks = parseInt(e.target.value);
    createTable();
});

const treatmentInput = document.getElementById('treatments');
treatmentInput.addEventListener('change', (e) => {
    treatments = parseInt(e.target.value);
    createTable();
});

const blockInput = document.getElementById('blocks');
blockInput.addEventListener('change', (e) => {
    blocks = parseInt(e.target.value);
    createTable();
});

const inputs = document.querySelectorAll('input[type="number"]');
inputs.forEach(input => {
    input.addEventListener('input', validateInput);
});

// التحقق من صحة المدخلات
function validateInput(event) {
    const input = event.target;
    const value = input.value;

    if (value === '' || isNaN(value)) {
        input.classList.add('invalid');
    } else {
        input.classList.remove('invalid');
    }
}

document.getElementById('calculate-btn').removeEventListener('click', calculateResults);

const calculateButton = document.querySelector('.neon-button');
calculateButton.addEventListener('click', calculateResults);

document.getElementById('anova-toggle').addEventListener('click', toggleAnova);
