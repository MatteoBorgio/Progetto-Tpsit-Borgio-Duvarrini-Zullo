const fs = require("fs");

function sendError(res, status, message) {
    return res.status(status).json({
        success: false,
        message: message,
    });
}

function sendSuccessResponse(res, status, message, results) {
    return res.status(status).json({
        success: true,
        message: message,
        results: results,
    });
}

function createFolder(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
    }
}

module.exports = {
    sendError,
    sendSuccessResponse,
    createFolder,
};
