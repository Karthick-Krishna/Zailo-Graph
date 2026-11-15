const fs = require('fs');

const tools = fs.readdirSync('tools')
  .filter(f => f.endsWith('.html') && f !== 'feedback.html')
  .map(f => f.replace('.html', ''));

const convRegistry = fs.readFileSync('src/services/conversion/conversionRegistry.ts', 'utf8');
const convIndex = fs.readFileSync('src/services/conversion/index.ts', 'utf8');
const sessionCtx = fs.readFileSync('src/context/SessionContext.tsx', 'utf8');
const utilities = fs.readFileSync('src/types/utility.ts', 'utf8');

const report = tools.map(id => {
  const isImageUtil = utilities.includes("id: '" + id + "'");
  const isConvRegistry = convRegistry.includes("id: '" + id + "'");
  const isConvDispatched = convIndex.includes("case '" + id + "':");
  const isSpecialSession = sessionCtx.includes("'" + id + "'");
  
  let engine = 'unknown';
  let status = 'MISSING_ENGINE';
  
  if (isConvDispatched && isConvRegistry) {
    engine = 'DocumentConversionPanel (Dispatched)';
    status = 'OK';
  } else if (isImageUtil) {
    engine = 'Workspace/ControlRack (Image Utility)';
    status = 'OK';
  } else if (isSpecialSession) {
    engine = 'SessionContext Special Handler';
    status = 'OK';
  } else if (isConvRegistry && !isConvDispatched) {
    engine = 'In Registry but NOT dispatched in executeDocumentConversion';
    status = 'UNWIRED';
  } else if (!isConvRegistry && !isImageUtil) {
    engine = 'Not in Conversion Registry & Not in Utility Registry';
    status = 'UNREGISTERED';
  }
  
  return { id, engine, status };
});

const ok = report.filter(r => r.status === 'OK');
const problematic = report.filter(r => r.status !== 'OK');

console.log(`AUDIT SUMMARY: ${ok.length}/${tools.length} OK, ${problematic.length} NEED FIXING`);
if (problematic.length > 0) {
  console.log('Problematic tools:');
  console.table(problematic);
}
