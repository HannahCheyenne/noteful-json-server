const path = require('path')
const express = require('express');
const xss = require('xss');
const FoldersService = require('./folders-service');

const foldersRouter = express.Router();
const jsonParser = express.json();

foldersRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        FoldersService.getAllFolders(knexInstance)
            .then(folders => {
                res.json(folders.map(FoldersService.serializeFolder))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const { name } = req.body
        const newFolder = { name }

        for(const [key, value] of Object.entries(newFolder)) {
            if(value === null) {
                return res.status(400).json({
                    error: {
                        message: `Missing '${key}' in request body`
                    }
                })
            }
        }

        FoldersService.insertFolder(
            knexInstance,
            newFolder
        )
            .then(folder => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${folder.id}`))
                    .json(FoldersService.serializeFolder(folder))
            })
            .catch(next)

    })

foldersRouter
    .route('/:folder_id')
    .all((req, res, next) => {
        const knexInstance = req.app.get('db')
        const idToGet = req.params.folder_id

        FoldersService.getById(
            knexInstance,
            idToGet
        )
            .then(folder => {
                if(!folder) {
                    return res.status(404).json({
                        error: {
                            message: `Folder doesn't exist`
                        }
                    })
                }
                res.folder = folder
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(FoldersService.serializeFolder(res.folder))
    })
    .delete((req, res, next) => {
        const knexInstance = req.app.get('db')
        const idToDelete = req.params.folder_id

        FoldersService.deleteFolder(
            knexInstance,
            idToDelete
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const idToUpdate = req.params.folder_id
        const { name } = req.body
        const folderToUpdate = { name }

        const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length
        if(numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain 'name'`
                }
            })
        }

        FoldersService.updateFolder(
            knexInstance,
            idToUpdate,
            folderToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })


module.exports = foldersRouter;






