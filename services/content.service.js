import sanitizeHtml from 'sanitize-html';

export async function sanitizedContent (content) {
    const sanitizecontent = sanitizeHtml( content, {
        allowedAttribute : {},
        allowedTags : []
    }).trim();

    return sanitizecontent;
}