import executeQuery from "@/utils/dbUtils";

async function getNote(noteId: string, userId: string) {
    try {
        const [queryResult] = await executeQuery(
            `SELECT * FROM notes WHERE id = ? AND userId = ?`,
            [noteId, userId]
        );

        if (!Array.isArray(queryResult) || queryResult.length === 0) {
            // Check if the note is shared read-only with the user
            const [sharedReadResult] = await executeQuery(
                `SELECT * FROM note_shared_read WHERE noteId = ? AND userId = ?`,
                [noteId, userId]
            );

            if (Array.isArray(sharedReadResult) && sharedReadResult.length > 0) {
                const [noteResult] = await executeQuery(
                    `SELECT * FROM notes WHERE id = ?`,
                    [noteId]
                );
                if (Array.isArray(noteResult) && noteResult.length > 0) {
                    return noteResult[0];
                }
            }

            // Check if the note is shared editable with the user
            const [sharedEditResult] = await executeQuery(
                `SELECT * FROM note_shared_edit WHERE noteId = ? AND userId = ?`,
                [noteId, userId]
            );

            if (Array.isArray(sharedEditResult) && sharedEditResult.length > 0) {
                const [noteResult] = await executeQuery(
                    `SELECT * FROM notes WHERE id = ?`,
                    [noteId]
                );
                if (Array.isArray(noteResult) && noteResult.length > 0) {
                    return noteResult[0];
                }
            }

            // Check if the note is shared read-only with a group the user is in
            const [groupReadResult] = await executeQuery(
                `SELECT * FROM note_shared_read nsr
                 JOIN user_group_members ugm ON nsr.groupId = ugm.groupId
                 WHERE nsr.noteId = ? AND ugm.userId = ?`,
                [noteId, userId]
            );

            if (Array.isArray(groupReadResult) && groupReadResult.length > 0) {
                const [noteResult] = await executeQuery(
                    `SELECT * FROM notes WHERE id = ?`,
                    [noteId]
                );
                if (Array.isArray(noteResult) && noteResult.length > 0) {
                    return noteResult[0];
                }
            }

            // Check if the note is shared editable with a group the user is in
            const [groupEditResult] = await executeQuery(
                `SELECT * FROM note_shared_edit nse
                 JOIN user_group_members ugm ON nse.groupId = ugm.groupId
                 WHERE nse.noteId = ? AND ugm.userId = ?`,
                [noteId, userId]
            );

            if (Array.isArray(groupEditResult) && groupEditResult.length > 0) {
                const [noteResult] = await executeQuery(
                    `SELECT * FROM notes WHERE id = ?`,
                    [noteId]
                );
                if (Array.isArray(noteResult) && noteResult.length > 0) {
                    return noteResult[0];
                }
            }

            // Check if the note is public
            const [publicResult] = await executeQuery(
                `SELECT * FROM notes WHERE id = ? AND visibility = 'public'`,
                [noteId]
            );

            if (Array.isArray(publicResult) && publicResult.length > 0) {
                return publicResult[0];
            }

            return null;
        }

        return queryResult[0];
    } catch (error) {
        console.error("Error fetching note:", error);
        return null;
    }
}

async function getNoteForEdit(noteId: string, userId: string) {
    try {
        const [queryResult] = await executeQuery(
            `SELECT * FROM notes WHERE id = ? AND userId = ?`,
            [noteId, userId]
        );

        if (Array.isArray(queryResult) && queryResult.length > 0) {
            return queryResult[0];
        }

        // Check if the note is shared editable with the user
        const [sharedEditResult] = await executeQuery(
            `SELECT * FROM note_shared_edit WHERE noteId = ? AND userId = ?`,
            [noteId, userId]
        );

        if (Array.isArray(sharedEditResult) && sharedEditResult.length > 0) {
            const [noteResult] = await executeQuery(
                `SELECT * FROM notes WHERE id = ?`,
                [noteId]
            );
            if (Array.isArray(noteResult) && noteResult.length > 0) {
                return noteResult[0];
            }
        }

        // Check if the note is shared editable with a group the user is in
        const [groupEditResult] = await executeQuery(
            `SELECT * FROM note_shared_edit nse
             JOIN user_group_members ugm ON nse.groupId = ugm.groupId
             WHERE nse.noteId = ? AND ugm.userId = ?`,
            [noteId, userId]
        );

        if (Array.isArray(groupEditResult) && groupEditResult.length > 0) {
            const [noteResult] = await executeQuery(
                `SELECT * FROM notes WHERE id = ?`,
                [noteId]
            );
            if (Array.isArray(noteResult) && noteResult.length > 0) {
                return noteResult[0];
            }
        }

        return null;
    } catch (error) {
        console.error("Error fetching note for edit:", error);
        return null;
    }
}

export { getNote, getNoteForEdit };
