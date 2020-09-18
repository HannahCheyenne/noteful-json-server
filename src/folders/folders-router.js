const path = require('path')
const express = require('express');
const xss = require('xss');
const FoldersService = require('./folders-service');

const foldersRouter = express.Router();
const jsonParser = express.json();

const serializeFolder = folder => ({
    id: article.id,
    style: article.style,
    title: xss(article.title), // sanitize title
    content: xss(article.content), // sanitize content
    date_published: article.date_published,
    author: article.author,
})