const TokenDialogStrings = {
    // Dialog settings
    DIALOG_TITLE: "Remote Service Gateway Tokens",

    // Main content
    DEFAULT_TEXT: "Token will appear here...",
    TITLE_LABEL: "Generate or revoke your Remote Service Gateway tokens. <br> Copy the tokens in the text fields below to use them. <br> <a href='https://developers.snap.com/spectacles/about-spectacles-features/apis/remoteservice-gateway'>Learn more about Remote Service Gateway</a>.",
    GENERATE_BUTTON: "Generate",
    REVOKE_BUTTON: "Revoke",
    COPY_BUTTON: "Copy",
    COPIED_BUTTON: "Copied",
    ISSUED_LABEL: "Issued:",
    ISSUED_PLACEHOLDER: "Issued: Not generated yet",

    // Token type labels
    OPENAI_LABEL: "OpenAI",
    GOOGLE_LABEL: "Google",
    SNAP_LABEL: "Snap",

    // Confirmation content
    CONFIRMATION_QUESTION: "Are you sure you want to revoke the {TOKEN_TYPE} token?",
    CONFIRMATION_WARNING: "This action cannot be undone and will permanently break any Lenses using this token.",
    CANCEL_BUTTON: "Cancel",
    CONFIRM_REVOKE_BUTTON: "Yes, Revoke",

    // Status messages
    LOADING: "Loading...",
    REVOKING: "Revoking token...",
    TOKEN_REVOKED: "Token revoked.",

    // Unauthorized view
    UNAUTHORIZED_TITLE: "Manage Your Tokens",
    UNAUTHORIZED_MESSAGE: "Log in to Lens Studio to generate, copy, and revoke your Remote Service Gateway tokens.",
    LOGIN_BUTTON: "Login",
    LEARN_MORE_BUTTON: "Learn More",
    LEARN_MORE_URL: "https://developers.snap.com/spectacles/about-spectacles-features/apis/remoteservice-gateway",

    // Error messages (user-facing)
    DEFAULT_ERROR_MESSAGE: "An unexpected error occurred",
    RESPONSE_PARSE_ERROR: "Error parsing server response",
    SERVER_ERROR: "Server returned an error",
    NO_TOKEN_IN_RESPONSE: "No token found in server response"
};

export default TokenDialogStrings;
