import xlsx from 'xlsx';
import ApiError from './ApiError.js';

const readEnrollmentNumbers = (file) => {
  try {
    // Read the Excel file from the temp file path instead of a buffer
    const workbook = xlsx.readFile(file.tempFilePath);
    
    // Check if workbook has any sheets
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new ApiError(400, "Excel file is empty or has no sheets");
    }
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Check if worksheet is empty
    if (!worksheet || !worksheet['!ref']) {
      throw new ApiError(400, "The first sheet is empty");
    }
    
    // Convert to JSON
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    // Check if data is empty
    if (!data || data.length === 0) {
      throw new ApiError(400, "No data found in the Excel file");
    }
    
    // Extract enrollment numbers
    // Assuming the column name is 'enrollmentNumber' or 'enrollment_number'
    const enrollmentNumbers = data.map(row => {
      const number = row.enrollmentNumber || row.enrollment_number;
      if (!number) {
        throw new ApiError(400, "Excel file must contain 'enrollmentNumber' or 'enrollment_number' column");
      }
      return number.toString();
    });

    return enrollmentNumbers;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(400, "Error reading Excel file: " + error.message);
  }
};

export { readEnrollmentNumbers };