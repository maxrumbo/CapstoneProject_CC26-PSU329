const SCRIPT_SECRET_KEY = 'APPS_SCRIPT_EMAIL_SECRET';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const configuredSecret = PropertiesService
      .getScriptProperties()
      .getProperty(SCRIPT_SECRET_KEY);

    if (!configuredSecret || payload.secret !== configuredSecret) {
      return jsonResponse({
        success: false,
        error: 'Unauthorized email webhook request',
      });
    }

    if (!payload.to || !payload.subject || !payload.text) {
      return jsonResponse({
        success: false,
        error: 'Missing required email fields',
      });
    }

    MailApp.sendEmail({
      to: payload.to,
      subject: payload.subject,
      body: payload.text,
      htmlBody: payload.html || payload.text,
      name: payload.fromName || 'SAWIT',
    });

    return jsonResponse({
      success: true,
      remainingQuota: MailApp.getRemainingDailyQuota(),
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      error: String(error && error.message ? error.message : error),
    });
  }
}

function jsonResponse(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
