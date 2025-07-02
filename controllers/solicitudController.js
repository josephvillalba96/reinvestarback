const Solicitud = require('../models/solicitud');
const ejs = require('ejs');
const path = require('path');
// const pdf = require('html-pdf');
const puppeteer = require('puppeteer');

// Crear solicitud
exports.crearSolicitud = async (req, res) => {
  try {
    const nuevaSolicitud = new Solicitud(req.body);
    const guardada = await nuevaSolicitud.save();
    res.status(201).json(guardada);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Listar solicitudes
// Listar solicitudes por asesor
exports.listarSolicitudes = async (req, res) => {
  try {
    const asesor = req.query.id;

    if (!asesor) {
      return res.status(400).json({ mensaje: 'Debe proporcionar el parámetro ?asesor' });
    }

    // Aquí filtra por el campo que tengas: advisorName, advisorId, etc.
    const solicitudes = await Solicitud.find({ advisorId: asesor });

    if (solicitudes.length === 0) {
      return res.status(404).json({ mensaje: 'No hay solicitudes registradas para este asesor' });
    }
    res.json(solicitudes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.descargarSolicitud = async (req, res) => {
  try {
    const solicitud = await Solicitud.findById(req.params.id);
    if (!solicitud) return res.status(404).json({ error: 'Solicitud no encontrada' });

    // Renderiza el HTML desde la plantilla EJS
    const htmlPath = path.join(__dirname, '../templates/plantilla.ejs');
    const htmlContent = await ejs.renderFile(htmlPath, { solicitud });

    // Lanza el navegador (usa --no-sandbox en servidores sin entorno gráfico)
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    // Establece el contenido de la página
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Genera el PDF
    const pdfBuffer = await page.pdf({
      format: 'letter',
      printBackground: true,
      margin: {
        top: '5mm',
        bottom: '5mm',
        left: '5mm',
        right: '5mm',
      },
    });

    await browser.close();

    // Configura las cabeceras y envía el PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="solicitud-${solicitud._id}.pdf"`,
    });

    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generando PDF con Puppeteer:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const ExcelJS = require('exceljs');

exports.descargarExcel = async (req, res) => {
  try {
    const solicitudes = await Solicitud.find();

    if (!solicitudes.length) {
      return res.status(404).json({ error: 'No hay registros para exportar.' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Solicitudes');

    // 🟡 Columnas según el listado proporcionado
    worksheet.columns = [
      { header: 'Number', key: '_id', width: 15 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'BORROWERS NAME', key: 'borrowerName', width: 30 },
      { header: 'LEGAL STATUS', key: 'legalStatus', width: 15 },
      { header: 'ISSUED DATE', key: 'issuedDate', width: 15 },
      { header: 'SUBJECT PROPERTY ADDRESS', key: 'propertyAddress', width: 30 },
      { header: 'STIMATED FICO SCORE', key: 'ficoScore', width: 20 },
      { header: 'LOAN TYPE', key: 'loanType', width: 20 },
      { header: 'PROPERTY TYPE', key: 'propertyType', width: 20 },
      { header: 'ESTIMATED CLOSING DATE', key: 'closingDate', width: 20 },
      { header: 'INTEREST RATE STRUCTURE', key: 'interestStructure', width: 25 },
      { header: 'LOAN TERM', key: 'loanTerm', width: 15 },
      { header: 'PREPAYMENT PENALTY', key: 'prepaymentPenalty', width: 20 },
      { header: 'MAXIMUM LTV (Loan to Value)', key: 'maxLTV', width: 25 },
      { header: 'MAXIMUM LTC (Loan to Cost)', key: 'maxLTC', width: 25 },
      { header: 'As-is Value', key: 'asIsValue', width: 20 },
      { header: 'Original Acquisition Price', key: 'acquisitionPrice', width: 25 },
      { header: 'Land or Acquisition Cost', key: 'landCost', width: 25 },
      { header: 'Financed Construction / Rehab Budget', key: 'constructionBudget', width: 35 },
      { header: 'Total Cost', key: 'totalCost', width: 20 },
      { header: 'Estimated After Completion Value', key: 'afterCompletionValue', width: 30 },
      { header: 'Fee2', key: 'feePercent', width: 10 },
      { header: 'Origination Fee', key: 'originationFee', width: 20 },
      { header: 'Underwriting Fee', key: 'underwritingFee', width: 20 },
      { header: 'Processing Fee', key: 'processingFee', width: 20 },
      { header: 'Servicing Fee', key: 'servicingFee', width: 20 },
      { header: 'Legal Fee', key: 'legalFee', width: 20 },
      { header: 'Appraisal Fee', key: 'appraisalFee', width: 20 },
      { header: 'Budget review and Permit Validation report', key: 'budgetReview', width: 35 },
      { header: 'Fee', key: 'brokerFeePercent', width: 15 },
      { header: 'Broker Fee', key: 'brokerFee', width: 20 },
      { header: 'Transaction Fee', key: 'transactionFee', width: 20 },
      { header: 'TOTAL LOAN AMOUNT (subject to appraisal value)', key: 'totalLoanAmount', width: 35 },
      { header: 'ANNUAL INTEREST RATE ()', key: 'interestRate', width: 20 },
      { header: 'REQUESTED LEVERAGE', key: 'requestedLeverage', width: 25 },
      { header: 'APPROX. MONTHLY INTEREST PAYMENT**', key: 'monthlyInterest', width: 30 },
      { header: 'CONSTRUCTION HOLDBACK', key: 'constructionHoldback', width: 25 },
      { header: 'INITIAL FUNDING (without construction holdback)', key: 'initialFunding', width: 35 },
      { header: 'DAY 1 APPROX. MONTHLY INTEREST PAYMENT**', key: 'day1Interest', width: 35 },
      { header: 'Loan to As-is Value (LTV)', key: 'loanToAsValueLTV', width: 25 },
      { header: 'Loan to As-Is Value (LTAIV) %', key: 'ltaivPercent', width: 25 },
      { header: 'Loan to As-Is Value (LTAIV) $', key: 'ltaivAmount', width: 25 },
      { header: 'Loan to Cost (LTC) %', key: 'ltcPercent', width: 25 },
      { header: 'Loan to Cost (LTC) $', key: 'ltcAmount', width: 25 },
      { header: 'Loan to ARV (Maximum 75%) %', key: 'larvPercent', width: 30 },
      { header: 'Loan to ARV (Maximum 75%) $', key: 'larvAmount', width: 30 },
      { header: '1) Minimum Credit Score required', key: 'minCreditScore', width: 30 },
      { header: '2) Commitment deposit', key: 'commitmentDeposit', width: 25 },
      { header: 'Cash to close (Down payment + closing costs)', key: 'cashToClose', width: 35 },
      { header: '10% of Construction Budget', key: 'constructionBudgetPercent', width: 30 },
      { header: '6 months payment reserves', key: 'paymentReserves', width: 30 },
      { header: 'Construction budget delta', key: 'budgetDelta', width: 25 },
      { header: 'Total', key: 'totalLiquidity', width: 15 },
      { header: 'BORROWER NAME:', key: 'borrowerNameSignature', width: 25 },
      { header: 'ENTITY NAME:', key: 'entityName', width: 25 },
      { header: 'GUARANTOR NAME:', key: 'guarantorName', width: 25 },
    ];

    // 🔁 Agregar cada fila con los datos
    solicitudes.forEach(solicitud => {
      worksheet.addRow(solicitud.toObject());
    });

    // ✅ Negrita para la primera fila
    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // 📥 Enviar Excel al navegador
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=solicitudes.xlsx');

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error generando Excel:', error);
    res.status(500).json({ error: 'Error generando el Excel' });
  }
};

