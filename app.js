document.getElementById('form').addEventListener('submit', handleFileUpload);
let newWorkbook;

function handleFileUpload(event) {
    event.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const phoneColumnInput = document.getElementById('phoneColumnInput').value;
    const prefixInput = document.getElementById('prefixInput').value;
    const phoneLengthInput = parseInt(document.getElementById('phoneLengthInput').value);

    if (fileInput.files.length === 0) {
        alert('Por favor, selecciona un archivo.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        processExcel(data, phoneColumnInput, prefixInput, phoneLengthInput);
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

function processExcel(data, phoneColumn, prefix, phoneLength) {
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    let jsonData = XLSX.utils.sheet_to_json(worksheet);

    const response = jsonData.map(item => {
        if (item[phoneColumn]) {
            let phoneNumberString = String(item[phoneColumn])
                .replace(/\s+/g, '').replace(/-/g, '').split(':::')[0].replace(/\+/g, '');

            let phone = phoneNumberString.startsWith(prefix) ? phoneNumberString.substring(prefix.length) : phoneNumberString;
            if (phone.length >= phoneLength) {
                item['Prefijo'] = prefix;
                item['Número de Teléfono'] = phone;
            }
            delete item[phoneColumn];
        }
        return item;
    });

    newWorkbook = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.json_to_sheet(response);
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Sheet1');
    document.getElementById('downloadBtn').style.display = 'block';
}

document.getElementById('downloadBtn').addEventListener('click', () => {
    XLSX.writeFile(newWorkbook, 'archivo_procesado.xlsx');
});
