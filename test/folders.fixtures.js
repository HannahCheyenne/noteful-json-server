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

module.exports = {
    makeFoldersArray,
    makeMaliciousFolder
}