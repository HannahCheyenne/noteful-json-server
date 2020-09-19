const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app')
const helpers = require('./test-helpers')
// const { makeFoldersArray, makeMaliciousFolder } = require('./folders.fixtures')

describe.only('Folders Endpoints', function() {

    let db;

    const {
        testFolders,
        testNotes,
    } = helpers.makeNotefulFixtures()

    
    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    });
    after('disconnect from db', () => db.destroy());
    beforeEach('clean the table', () => db.raw('TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE'))
    afterEach('cleanup',() => db.raw('TRUNCATE noteful_folders, noteful_notes RESTART IDENTITY CASCADE'))


    describe(`Get /api/folders`, () => {

        context('Given no folders', () => {
            
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/folders')
                    .expect(200, [])
            })
        })

        context('Given there are folders in the database', () => {

            beforeEach('insert folders', () => 
                helpers.seedNotefulTables(
                    db,
                    testFolders,
                    testNotes
                )
            )

            it(`responds with 200 and all of the folders`, () => {
                const expectedFolders = testFolders.map(folder => 
                    helpers.makeExpectedFolder(
                        folder,
                        testNotes
                    )    
                )
                return supertest(app)
                    .get('/api/folders')
                    .expect(200, expectedFolders)
            })
        })

        context('Given an XSS attack folder', () => {

            const { 
                maliciousFolder, 
                expectedFolder 
            } = helpers.makeMaliciousFolder()

            beforeEach('insert malicious folder', () => {
                return helpers.seedMaliciousFolder(
                    db,
                    maliciousFolder,
                )
            })

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get('/api/folders')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].name).to.eql(expectedFolder.name)
                        expect(res.body[0].content).to.eql(expectedFolder.content)
                    })
            })

        })

    })


    describe(`Get /api/folders/:folder_id`, () => {

        context('Given no folders', () => {

            it('responds with 404', () => {
                const folderId = 123456;
                return supertest(app)
                    .get(`/api/folders/${folderId}`)
                    .expect(404, { error: { message: `Folder doesn't exist` } })
            })

        })

        context('Given there are folders in the database', () => {

            beforeEach('insert tables', () => 
                helpers.seedNotefulTables(
                    db,
                    testFolders,
                    testNotes,
                )
            )

            it(`responds with 200 and the specified folder`, () => {
                const folderId = 2;
                const expectedFolder = helpers.makeExpectedFolder(
                    testFolders[folderId - 1],
                    testNotes,
                )
                return supertest(app)
                    .get(`/api/folders/${folderId}`)
                    .expect(200, expectedFolder)
            })

        })

        context(`Given an XSS attack folder`, () => {

            const { 
                maliciousFolder, 
                expectedFolder,
            } = helpers.makeMaliciousFolder()

            beforeEach('insert malicious folder', () => {
                return helpers.seedMaliciousFolder(
                    db,
                    maliciousFolder,
                )
            })

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/folders/${maliciousFolder.id}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.name).to.eql(expectedFolder.name)
                    })
            })
        })

    })


    describe(`POST /api/folders`, () => {

        it(`creates a folder, responding with 201 and new folder`, function() {

            this.retries(3)

            const newFolder = {
                name: 'Test new folder'
            }

            return supertest(app)
                .post('/api/folders')
                .send(newFolder)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(newFolder.name)
                })
                .then(postRes =>
                    supertest(app)
                        .get(`/api/folders/${postRes.body.id}`)
                        .expect(postRes.body)    
                )
        })

        // const requireFields = ['name']

        // requireFields.forEach(field => {
        //     const newFolder = {
        //         name: 'Test new folder'
        //     }
            
        //     it(`responds with 400 and an error message when the '${field}' is missing`, () => {

        //         delete newFolder[field]

        //         return supertest(app)
        //             .post('/api/folders')
        //             .send(newFolder)
        //             .expect(400, {
        //                 error: {
        //                     message: `Missing '${field}' in request body`
        //                 }
        //             })
        //     })

        // })

        
        it(`removes XSS attack content from response`, () => {

            const { 
                maliciousFolder, 
                expectedFolder,
            } = helpers.makeMaliciousFolder()

            beforeEach('insert malicious folder', () => {
                return helpers.seedMaliciousFolder(
                    db,
                    maliciousFolder,
                )
            })

            return supertest(app)
                .post('/api/folders')
                .send(maliciousFolder)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(expectedFolder.name)
                })

        })

    })


    describe(`DELETE /api/folders/:folder_id`, () => {

        context('Given no folders', () => {

            it(`responds with 404`, () => {

                const folderId = 123456;

                return supertest(app)
                    .delete(`/api/folders/${folderId}`)
                    .expect(404, { error: { message: `Folder doesn't exist` } })
            })
        })

        context('Given there are folders in the database', () => {

            beforeEach('insert folders', () => 
                helpers.seedNotefulTables(
                    db,
                    testFolders,
                    testNotes,
            ))

            it(`responds with 204 and removes the folder`, () => {
               
                const idToRemove = 3;   
                const tempFolders = testFolders.map(folder => 
                    helpers.makeExpectedFolder(
                        folder,
                        testNotes
                    )    
                )
                
                const expectedFolders = tempFolders.filter(folder => folder.id !== idToRemove)

                return supertest(app)
                    .delete(`/api/folders/${idToRemove}`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get('/api/folders')
                            .expect(expectedFolders)
                    )

            })

        })

    })


    describe(`PATCH /api/folders/:folder_id`, () => {

        context(`Given no folders`, () => {
            
            it(`responds with 404`, () => {
                const folderId = 123456;

                return supertest(app)
                    .patch(`/api/folders/${folderId}`)
                    .expect(404, { error: { message: `Folder doesn't exist` } })
            })

        })

        context(`Given there are folders in the database`, () => {

            beforeEach('insert folders', () => {
                helpers.seedNotefulTables(
                    db,
                    testFolders,
                    testNotes,
                )
            })

            it(`responds with 204 and updates the article`, () => {

                const idToUpdate = 2
 
                const tempFolders = testFolders.map(folder => 
                    helpers.makeExpectedFolder(
                        folder,
                        testNotes
                    )    
                )

                const updateFolder = {
                    name: 'Updated folder name'
                }

                const expectedFolder = {
                    ...tempFolders[idToUpdate - 1],
                    ...updateFolder
                }
                return supertest(app)
                    .patch(`/api/folders/${idToUpdate}`)
                    .send(updateFolder)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/api/folders/${idToUpdate}`)
                            .expect(expectedFolder)    
                    )
                
            })

            it.skip(`responds with 400 when no required fields supplied`, () => {

                const idToUpdate = 2
                return supertest(app)
                    .patch(`/api/articles/${idToUpdate}`)
                    .send({ irrelevantField: 'foo' })
                    .expect(400, {
                        error: {
                            message: `Request body must contain either 'title', 'style', 'content'`
                        }
                    })
            })

        })

    })


})