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

module.exports = {
    sendError,
    sendSuccessResponse,
};
