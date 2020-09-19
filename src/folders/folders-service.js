const xss = require('xss')

const FoldersService = {
    getAllFolders(db) {
        return db
            .from('noteful_folders AS fol')
            .select(
                'fol.id',
                'fol.name',
                db.raw(
                    `count(DISTINCT notes) AS number_of_notes`
                ),
            )
            .leftJoin(
                'noteful_notes AS notes',
                'fol.id',
                'notes.folder_id',
            )
            .groupBy('fol.id')
            
    },
    insertFolder(knex, newFolder) {
        return knex
            .insert(newFolder)
            .into('noteful_folders')
            .returning('*')
            .then(rows => {
                return rows[0]
            });
    },
    getById(db, id) {
        return FoldersService.getAllFolders(db)
            .where('fol.id', id)
            .first()
    },
    getNotesForFolder(db, folder_id) {
        return db
            .from('noteful_notes AS notes')
            .select(
                'notes.id',
                'notes.content',
                'notes.modified',
            )
            .where('notes.folder_id', folder_id)
            .groupBy('notes.id')
    },

    serializeFolder(folder) {
        return {
            id: folder.id,
            name: xss(folder.name), // sanitize title
            number_of_notes: Number(folder.number_of_notes) || 0,            
        }
    },

    
    deleteFolder(knex, id) {
        return knex('noteful_folders')
            .where({ id })
            .delete();
    },
    updateFolder(knex, id, newFolderFields) {
        return knex('noteful_folders')
            .where({ id })
            .update(newFolderFields);
    },
};

module.exports = FoldersService;