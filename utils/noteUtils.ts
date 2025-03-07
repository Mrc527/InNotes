// utils/noteUtils.ts
import executeQuery from "@/utils/dbUtils";

const TIMEZONE_OFFSET = 1; // UTC+1

function convertToUTC(dateString: string | null): string | null {
    if (!dateString) {
        return null;
    }
    const date = new Date(dateString);
    date.setHours(date.getHours() - TIMEZONE_OFFSET); // Subtract 1 hour to convert from UTC+1 to UTC
    return date.toISOString();
}

function convertFromUTC(dateString: string): string {
    const date = new Date(dateString);
    date.setHours(date.getHours() + TIMEZONE_OFFSET); // Add 1 hour to convert from UTC to UTC+1
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

async function getNote(noteId: string, userId: string) {
    try {
        const queryResult = await executeQuery(
            `SELECT * FROM notes WHERE id = ? AND userId = ?`,
            [noteId, userId]
        );

        if (!Array.isArray(queryResult) || queryResult.length === 0) {
            // Check if the note is shared read-only with the user
            const sharedReadResult = await executeQuery(
                `SELECT * FROM note_shared_read WHERE noteId = ? AND userId = ?`,
                [noteId, userId]
            );

            if (Array.isArray(sharedReadResult) && sharedReadResult.length > 0) {
                const noteResult = await executeQuery(
                    `SELECT * FROM notes WHERE id = ?`,
                    [noteId]
                );
                if (Array.isArray(noteResult) && noteResult.length > 0) {
                    const note = noteResult[0];
                    return {
                        ...note,
                        creationDate: convertToUTC(note.creationDate),
                        lastUpdate: convertToUTC(note.lastUpdate),
                    };
                }
            }

            // Check if the note is shared editable with the user
            const sharedEditResult = await executeQuery(
                `SELECT * FROM note_shared_edit WHERE noteId = ? AND userId = ?`,
                [noteId, userId]
            );

            if (Array.isArray(sharedEditResult) && sharedEditResult.length > 0) {
                const noteResult = await executeQuery(
                    `SELECT * FROM notes WHERE id = ?`,
                    [noteId]
                );
                if (Array.isArray(noteResult) && noteResult.length > 0) {
                    const note = noteResult[0];
                    return {
                        ...note,
                        creationDate: convertToUTC(note.creationDate),
                        lastUpdate: convertToUTC(note.lastUpdate),
                    };
                }
            }

            // Check if the note is shared read-only with a group the user is in
            const groupReadResult = await executeQuery(
                `SELECT * FROM note_shared_read nsr
                 JOIN user_group_members ugm ON nsr.groupId = ugm.groupId
                 WHERE nsr.noteId = ? AND ugm.userId = ?`,
                [noteId, userId]
            );

            if (Array.isArray(groupReadResult) && groupReadResult.length > 0) {
                const noteResult = await executeQuery(
                    `SELECT * FROM notes WHERE id = ?`,
                    [noteId]
                );
                if (Array.isArray(noteResult) && noteResult.length > 0) {
                    const note = noteResult[0];
                    return {
                        ...note,
                        creationDate: convertToUTC(note.creationDate),
                        lastUpdate: convertToUTC(note.lastUpdate),
                    };
                }
            }

            // Check if the note is shared editable with a group the user is in
            const groupEditResult = await executeQuery(
                `SELECT * FROM note_shared_edit nse
                 JOIN user_group_members ugm ON nse.groupId = ugm.groupId
                 WHERE nse.noteId = ? AND ugm.userId = ?`,
                [noteId, userId]
            );

            if (Array.isArray(groupEditResult) && groupEditResult.length > 0) {
                const noteResult = await executeQuery(
                    `SELECT * FROM notes WHERE id = ?`,
                    [noteId]
                );
                if (Array.isArray(noteResult) && noteResult.length > 0) {
                    const note = noteResult[0];
                    return {
                        ...note,
                        creationDate: convertToUTC(note.creationDate),
                        lastUpdate: convertToUTC(note.lastUpdate),
                    };
                }
            }

            // Check if the note is public
            const publicResult = await executeQuery(
                `SELECT * FROM notes WHERE id = ? AND visibility = 'public'`,
                [noteId]
            );

            if (Array.isArray(publicResult) && publicResult.length > 0) {
                const note = publicResult[0];
                return {
                    ...note,
                    creationDate: convertToUTC(note.creationDate),
                    lastUpdate: convertToUTC(note.lastUpdate),
                };
            }

            return null;
        }

        const note = queryResult[0];
        return {
            ...note,
            creationDate: convertToUTC(note.creationDate),
            lastUpdate: convertToUTC(note.lastUpdate),
        };
    } catch (error) {
        console.error("Error fetching note:", error);
        return null;
    }
}

async function getNoteForEdit(noteId: string, userId: string) {
    try {
        const queryResult = await executeQuery(
            `SELECT * FROM notes WHERE id = ? AND userId = ?`,
            [noteId, userId]
        );

        if (Array.isArray(queryResult) && queryResult.length > 0) {
            const note = queryResult[0];
            return {
                ...note,
                creationDate: convertToUTC(note.creationDate),
                lastUpdate: convertToUTC(note.lastUpdate),
            };
        }

        // Check if the note is shared editable with the user
        const sharedEditResult = await executeQuery(
            `SELECT * FROM note_shared_edit WHERE noteId = ? AND userId = ?`,
            [noteId, userId]
        );

        if (Array.isArray(sharedEditResult) && sharedEditResult.length > 0) {
            const noteResult = await executeQuery(
                `SELECT * FROM notes WHERE id = ?`,
                [noteId]
            );
            if (Array.isArray(noteResult) && noteResult.length > 0) {
                const note = noteResult[0];
                return {
                    ...note,
                    creationDate: convertToUTC(note.creationDate),
                    lastUpdate: convertToUTC(note.lastUpdate),
                };
            }
        }

        // Check if the note is shared editable with a group the user is in
        const groupEditResult = await executeQuery(
            `SELECT * FROM note_shared_edit nse
             JOIN user_group_members ugm ON nse.groupId = ugm.groupId
             WHERE nse.noteId = ? AND ugm.userId = ?`,
            [noteId, userId]
        );

        if (Array.isArray(groupEditResult) && groupEditResult.length > 0) {
            const noteResult = await executeQuery(
                `SELECT * FROM notes WHERE id = ?`,
                [noteId]
            );
            if (Array.isArray(noteResult) && noteResult.length > 0) {
                const note = noteResult[0];
                return {
                    ...note,
                    creationDate: convertToUTC(note.creationDate),
                    lastUpdate: convertToUTC(note.lastUpdate),
                };
            }
        }

        return null;
    } catch (error) {
        console.error("Error fetching note for edit:", error);
        return null;
    }
}

export { getNote, getNoteForEdit };
