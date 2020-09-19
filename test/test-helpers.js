
function makeFoldersArray() {
    return [
        {
            id: 1,
            name: 'Important'
        },
        {
            id: 2,
            name: 'Super'
        },
        {
            id: 3,
            name: 'Spangley'
        }
    ]
}

function makeNotesArray(folders) {
    return [
        {
            id: 1,
            name: 'First test note',
            modified: '2029-01-22T16:28:32.615Z',
            folder_id: folders[0].id,
            content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum, exercitationem cupiditate dignissimos est perspiciatis, nobis commodi alias saepe atque facilis labore sequi deleniti. Sint, adipisci facere! Velit temporibus debitis rerum.'
        },
        {
            id: 2,
            name: 'Second test note',
            modified: '2100-05-22T16:28:32.615Z',
            folder_id: folders[1].id,
            content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum, exercitationem cupiditate dignissimos est perspiciatis, nobis commodi alias saepe atque facilis labore sequi deleniti. Sint, adipisci facere! Velit temporibus debitis rerum.'
        },
        {
            id: 3,
            name: 'Third test note',
            modified: '1919-12-22T16:28:32.615Z',
            folder_id: folders[2].id,
            content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum, exercitationem cupiditate dignissimos est perspiciatis, nobis commodi alias saepe atque facilis labore sequi deleniti. Sint, adipisci facere! Velit temporibus debitis rerum.'
        },
        {
            id: 4,
            name: 'Fourth test note',
            modified: '1920-12-22T16:28:32.615Z',
            folder_id: folders[0].id,
            content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum, exercitationem cupiditate dignissimos est perspiciatis, nobis commodi alias saepe atque facilis labore sequi deleniti. Sint, adipisci facere! Velit temporibus debitis rerum.'
        }
    ]
}


function makeExpectedFolder(folder, notes=[]) {

    const number_of_notes = notes.filter(note => note.folder_id === folder.id).length
  
    return {
      id: folder.id,
      name: folder.name,
      number_of_notes
    }

}

function makeExpectedNotes(folderId, notes) {
    const expectedNotes = notes
      .filter(note => note.folder_id === folderId)
  
    return expectedNotes.map(note => {
      return {
        id: note.id,
        content: note.content,
        date_created: note.date_created.toISOString(),
      }
    })
}

function makeMaliciousNote() {
    const maliciousNote = {
        id: 911,
        name: 'Naughty naughty very naughty <script>alert("xss");</script>',
        modified: new Date().toISOString(),
        folder_id: 2,
        content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    }

    const expectedNote = {
        ...maliciousNote,
        name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        content:  `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }

    return {
        maliciousNote,
        expectedNote
    }

}


function makeMaliciousFolder() {
    const maliciousFolder = {
        id: 911,
        name: 'Naughty naughty very naughty <script>alert("xss");</script>'
    }

    const expectedFolder = {
        ... maliciousFolder,
        name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;'
    }

    return {
        maliciousFolder,
        expectedFolder
    }
}

function makeNotefulFixtures() {
    const testFolders = makeFoldersArray()
    const testNotes = makeNotesArray(testFolders)
    return { testFolders, testNotes }
}


function cleanTables(db) {
    return db.transaction(trx =>
      trx.raw(
        `TRUNCATE noteful_notes, noteful_folders`
      )
      .then(() =>
        Promise.all([
          trx.raw(`ALTER SEQUENCE noteful_folders_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE noteful_notes_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('noteful_folders_id_seq', 0)`),
          trx.raw(`SELECT setval('noteful_notes_id_seq', 0)`),
        ])
      )
    )
}

function seedNotefulTables(db, folders, notes=[]) {
    // use a transaction to group the queries and auto rollback on any failure
    return db.transaction(async trx => {
      await trx.into('noteful_folders').insert(folders)
      // update the auto sequence to match the forced id values
      await trx.raw(
        `SELECT setval('noteful_folders_id_seq', ?)`,
        [folders[folders.length - 1].id],
      )
      // only insert notes if there are some, also update the sequence counter
      await trx.into('noteful_notes').insert(notes)
      await trx.raw(
        `SELECT setval('noteful_notes_id_seq', ?)`,
        [notes.length],
      )
    })
}

function seedMaliciousFolder(db, folder) {
    return db
        .into('noteful_folders')
        .insert([folder])
}

function seedMaliciousNote(db, note) {
    return db
        .into('noteful_notes')
        .insert([note])
}


module.exports = {
    makeFoldersArray,
    makeNotesArray,
    makeMaliciousFolder,
    makeMaliciousNote,
    makeExpectedFolder,
    makeExpectedNotes,

    makeNotefulFixtures,
    cleanTables,
    seedNotefulTables,
    seedMaliciousFolder,
    seedMaliciousNote,
}