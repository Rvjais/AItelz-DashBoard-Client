function doPost(e) {
    try {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        var data = JSON.parse(e.postData.contents);

        // Define headers order
        var headers = [
            'Doctor Name',
            'Clinic/Hospital Name',
            'Phone Number',
            'Email ID',
            'City',
            'Call Date',
            'Call Time',
            'Execution ID'
        ];

        // Check if headers exist, if not add them
        if (sheet.getLastRow() === 0) {
            sheet.appendRow(headers);
        }

        // Prepare row data
        var row = [
            data.doctor_name || '',
            data.clinic_hospital_name || '',
            data.phone_number || '',
            data.email_id || '',
            data.city || '',
            data.call_date || '',
            data.call_time || '',
            data.execution_id || ''
        ];

        sheet.appendRow(row);

        return ContentService.createTextOutput(JSON.stringify({ 'status': 'success' }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ 'status': 'error', 'message': error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}
