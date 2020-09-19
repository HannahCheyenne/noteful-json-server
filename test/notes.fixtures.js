function makeNotesArray() {
    return [
        {
            id: 1,
            name: 'First test note',
            modified: '2029-01-22T16:28:32.615Z',
            folder_id: 1,
            content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum, exercitationem cupiditate dignissimos est perspiciatis, nobis commodi alias saepe atque facilis labore sequi deleniti. Sint, adipisci facere! Velit temporibus debitis rerum.'
        },
        {
            id: 2,
            name: 'Second test note',
            modified: '2100-05-22T16:28:32.615Z',
            folder_id: 2,
            content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum, exercitationem cupiditate dignissimos est perspiciatis, nobis commodi alias saepe atque facilis labore sequi deleniti. Sint, adipisci facere! Velit temporibus debitis rerum.'
        },
        {
            id: 3,
            name: 'Third test note',
            modified: '1919-12-22T16:28:32.615Z',
            folder_id: 3,
            content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum, exercitationem cupiditate dignissimos est perspiciatis, nobis commodi alias saepe atque facilis labore sequi deleniti. Sint, adipisci facere! Velit temporibus debitis rerum.'
        },
        {
            id: 4,
            name: 'Fourth test note',
            modified: '1920-12-22T16:28:32.615Z',
            folder_id: 1,
            content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum, exercitationem cupiditate dignissimos est perspiciatis, nobis commodi alias saepe atque facilis labore sequi deleniti. Sint, adipisci facere! Velit temporibus debitis rerum.'
        }
    ]
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

module.exports = {
    makeNotesArray,
    makeMaliciousNote
}