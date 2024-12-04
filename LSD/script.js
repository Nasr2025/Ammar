// متغيرات عامة للتحكم في البيانات
let treatmentsCount = 3;
let replicationsCount = 3;

// دالة إنشاء الجدول
function createTable() {
    const treatments = parseInt(document.getElementById('treatments').value);
    const replications = parseInt(document.getElementById('replications').value);
    
    if (isNaN(treatments) || isNaN(replications) || treatments < 2 || replications < 2) {
        alert('الرجاء إدخال قيم صحيحة (2 أو أكثر) لعدد المعاملات والمكررات');
        return;
    }

    const table = document.createElement('table');
    table.className = 'data-table';
    
    // إنشاء صف العناوين
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th></th>' + 
        Array.from({length: replications}, (_, i) => `<th>R${i + 1}</th>`).join('') +
        '<th>مجموع الصف</th>';
    table.appendChild(headerRow);
    
    // إنشاء صفوف البيانات
    for (let i = 0; i < treatments; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `<td>T${i + 1}</td>` + 
            Array.from({length: replications}, (_, j) => 
                `<td><input type="number" step="0.01" data-treatment="${i}" data-replication="${j}" required></td>`
            ).join('') +
            '<td class="row-sum">0</td>';
        table.appendChild(row);
    }

    // إضافة صف المجاميع
    const sumRow = document.createElement('tr');
    sumRow.innerHTML = '<td>مجموع العمود</td>' + 
        Array.from({length: replications}, () => '<td class="column-sum">0</td>').join('') +
        '<td class="total-sum">0</td>';
    table.appendChild(sumRow);

    // إضافة الجدول للصفحة
    const tableContainer = document.getElementById('dataTable');
    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);

    // إضافة مستمعي الأحداث لتحديث المجاميع
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', updateSums);
    });

    // إظهار زر حساب النتائج
    document.querySelector('.calculate-btn').style.display = 'block';
}

// دالة تحديث المجاميع
function updateSums() {
    const treatments = parseInt(document.getElementById('treatments').value);
    const replications = parseInt(document.getElementById('replications').value);
    const rowSums = new Array(treatments).fill(0);
    const columnSums = new Array(replications).fill(0);
    let totalSum = 0;

    // حساب مجاميع الصفوف والأعمدة
    for (let i = 0; i < treatments; i++) {
        for (let j = 0; j < replications; j++) {
            const input = document.querySelector(`input[data-treatment="${i}"][data-replication="${j}"]`);
            const value = parseFloat(input.value) || 0;
            rowSums[i] += value;
            columnSums[j] += value;
            totalSum += value;
        }
    }

    // تحديث مجاميع الصفوف
    const rowSumElements = document.querySelectorAll('.row-sum');
    rowSums.forEach((sum, i) => {
        rowSumElements[i].textContent = sum.toFixed(2);
    });

    // تحديث مجاميع الأعمدة
    const columnSumElements = document.querySelectorAll('.column-sum');
    columnSums.forEach((sum, i) => {
        columnSumElements[i].textContent = sum.toFixed(2);
    });

    // تحديث المجموع الكلي
    document.querySelector('.total-sum').textContent = totalSum.toFixed(2);
}

// دالة جمع البيانات من الجدول
function collectData() {
    const treatments = parseInt(document.getElementById('treatments').value);
    const replications = parseInt(document.getElementById('replications').value);
    const data = [];
    
    for (let i = 0; i < treatments; i++) {
        data[i] = [];
        for (let j = 0; j < replications; j++) {
            const input = document.querySelector(`input[data-treatment="${i}"][data-replication="${j}"]`);
            const value = parseFloat(input.value);
            data[i][j] = isNaN(value) ? 0 : value;
        }
    }
    
    return data;
}

// دالة حساب المتوسط
function calculateMean(numbers) {
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

// دالة حساب النتائج
function calculateResults() {
    const data = collectData();
    const treatments = data.length;
    const replications = data[0].length;
    
    // حساب المجاميع
    const treatmentSums = data.map(treatment => treatment.reduce((a, b) => a + b, 0));
    const replicationSums = Array(replications).fill(0);
    let totalSum = 0;

    // حساب مجاميع المكررات
    for (let i = 0; i < treatments; i++) {
        for (let j = 0; j < replications; j++) {
            const value = data[i][j];
            replicationSums[j] += value;
            totalSum += value;
        }
    }

    // معامل التصحيح
    const CF = Math.pow(totalSum, 2) / (treatments * replications);

    // مجموع المربعات الكلي
    const totalSS = data.flat().reduce((acc, val) => acc + Math.pow(val, 2), 0) - CF;

    // مجموع مربعات المعاملات
    const treatmentSS = treatmentSums.reduce((acc, sum) => acc + Math.pow(sum, 2), 0) / replications - CF;

    // مجموع مربعات الصفوف
    const rowSS = replicationSums.reduce((acc, sum) => acc + Math.pow(sum, 2), 0) / treatments - CF;

    // مجموع مربعات الأعمدة
    const columnSS = replicationSums.reduce((acc, sum) => acc + Math.pow(sum, 2), 0) / treatments - CF;

    // مجموع مربعات الخطأ
    const errorSS = totalSS - treatmentSS - rowSS - columnSS;

    // درجات الحرية
    const dfTreatment = treatments - 1;
    const dfRow = treatments - 1;
    const dfColumn = replications - 1;
    const dfError = (treatments - 1) * (replications - 2);
    const dfTotal = treatments * replications - 1;

    // متوسط المربعات
    const msTreatment = treatmentSS / dfTreatment;
    const msRow = rowSS / dfRow;
    const msColumn = columnSS / dfColumn;
    const msError = errorSS / dfError;

    // قيمة F المحسوبة
    const fTreatment = msTreatment / msError;
    const fRow = msRow / msError;
    const fColumn = msColumn / msError;

    // دالة لتنسيق الأرقام بدون أصفار زائدة
    function formatNumber(num) {
        return Number(num.toFixed(2)).toString();
    }

    // عرض النتائج
    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'results';
    resultsDiv.innerHTML = `
        <div class="step-box" onclick="toggleStep(this)">
            <h4>1. معامل التصحيح (C.F.)</h4>
            <div class="step-content">
                <div class="formula">C.F. = (G.T)² / N</div>
                <div class="calculation">
                    = (${formatNumber(totalSum)})² / (${treatments} × ${replications})
                    = ${formatNumber(CF)}
                </div>
            </div>
        </div>

        <div class="step-box" onclick="toggleStep(this)">
            <h4>2. مجموع المربعات الكلي (Total SS)</h4>
            <div class="step-content">
                <div class="formula">Total SS = ΣX² - C.F.</div>
                <div class="calculation">
                    = ${formatNumber(data.flat().reduce((acc, val) => acc + Math.pow(val, 2), 0))} - ${formatNumber(CF)}
                    = ${formatNumber(totalSS)}
                </div>
            </div>
        </div>

        <div class="step-box" onclick="toggleStep(this)">
            <h4>3. مجموع مربعات المعاملات (Treatment SS)</h4>
            <div class="step-content">
                <div class="formula">Treatment SS = Σ(Ti²/r) - C.F.</div>
                <div class="calculation">
                    = (${treatmentSums.map(sum => formatNumber(Math.pow(sum, 2) / replications)).join(' + ')}) - ${formatNumber(CF)}
                    = ${formatNumber(treatmentSS)}
                </div>
            </div>
        </div>

        <div class="step-box" onclick="toggleStep(this)">
            <h4>4. مجموع مربعات الصفوف (Row SS)</h4>
            <div class="step-content">
                <div class="formula">Row SS = Σ(Ri²/r) - C.F.</div>
                <div class="calculation">
                    = (${replicationSums.map(sum => formatNumber(Math.pow(sum, 2) / treatments)).join(' + ')}) - ${formatNumber(CF)}
                    = ${formatNumber(rowSS)}
                </div>
            </div>
        </div>

        <div class="step-box" onclick="toggleStep(this)">
            <h4>5. مجموع مربعات الأعمدة (Column SS)</h4>
            <div class="step-content">
                <div class="formula">Column SS = Σ(Ci²/t) - C.F.</div>
                <div class="calculation">
                    = (${replicationSums.map(sum => formatNumber(Math.pow(sum, 2) / treatments)).join(' + ')}) - ${formatNumber(CF)}
                    = ${formatNumber(columnSS)}
                </div>
            </div>
        </div>

        <div class="step-box" onclick="toggleStep(this)">
            <h4>6. مجموع مربعات الخطأ (Error SS)</h4>
            <div class="step-content">
                <div class="formula">Error SS = Total SS - Treatment SS - Row SS - Column SS</div>
                <div class="calculation">
                    = ${formatNumber(totalSS)} - ${formatNumber(treatmentSS)} - ${formatNumber(rowSS)} - ${formatNumber(columnSS)}
                    = ${formatNumber(errorSS)}
                </div>
            </div>
        </div>

        <div class="step-box" onclick="toggleStep(this)">
            <h4>7. ANOVA</h4>
            <div class="anova-table">
                <table dir="rtl">
                    <tr>
                        <th>S.O.V</th>
                        <th>df</th>
                        <th>SS</th>
                        <th>MS</th>
                        <th>F</th>
                    </tr>
                    <tr>
                        <td>Treatments</td>
                        <td>${dfTreatment}</td>
                        <td>${formatNumber(treatmentSS)}</td>
                        <td>${formatNumber(msTreatment)}</td>
                        <td>${formatNumber(fTreatment)}</td>
                    </tr>
                    <tr>
                        <td>Rows</td>
                        <td>${dfRow}</td>
                        <td>${formatNumber(rowSS)}</td>
                        <td>${formatNumber(msRow)}</td>
                        <td>${formatNumber(fRow)}</td>
                    </tr>
                    <tr>
                        <td>Columns</td>
                        <td>${dfColumn}</td>
                        <td>${formatNumber(columnSS)}</td>
                        <td>${formatNumber(msColumn)}</td>
                        <td>${formatNumber(fColumn)}</td>
                    </tr>
                    <tr>
                        <td>Error</td>
                        <td>${dfError}</td>
                        <td>${formatNumber(errorSS)}</td>
                        <td>${formatNumber(msError)}</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>Total</td>
                        <td>${dfTotal}</td>
                        <td>${formatNumber(totalSS)}</td>
                        <td>-</td>
                        <td>-</td>
                    </tr>
                </table>
            </div>
        </div>
    `;
    
    // إضافة النتائج للصفحة
    const oldResults = document.querySelector('.results');
    if (oldResults) {
        oldResults.remove();
    }
    document.querySelector('.calculator-box').appendChild(resultsDiv);
    
    // تمرير إلى النتائج
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// دالة لتبديل حالة العنصر
function toggleStep(element) {
    element.classList.toggle('active');
}

// إضافة مستمع الحدث
document.getElementById('treatments').addEventListener('change', (e) => {
    treatmentsCount = parseInt(e.target.value);
    createTable();
});

document.getElementById('replications').addEventListener('change', (e) => {
    replicationsCount = parseInt(e.target.value);
    createTable();
});
