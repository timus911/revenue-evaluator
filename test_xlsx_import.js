
try {
    const XLSX = require('xlsx-js-style');
    console.log("Require successful");
    console.log("Utils available:", !!XLSX.utils);
    console.log("Read available:", !!XLSX.read);
} catch (e) {
    console.error("Require failed:", e);
}
