import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import url from 'url';
import fs from 'fs/promises';

//setting up dotenv
dotenv.config();

//setting up app  
const app = express();
//defining PORT and __dirname
const PORT = process.env.PORT || 3000;
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//setting up parsers/middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//setting up static files
app.use(express.static(path.join(__dirname, 'public')));

//setting up ejs as view engine
app.set('view engine', 'ejs');

//basic GET request
app.get('/', async (req, res) =>{
    try {
        const files = await fs.readdir(`./files`);
        console.log(files);
        res.render('index', {files: files});
    } catch (error) {
        console.log(`Error: ${error}`);
    }
});

app.post('/create',async (req, res) => {
    try {
        await fs.writeFile(path.join(__dirname,'files',`${req.body.title.split(' ').join('-')}.txt`), req.body.description)
        console.log('File Created');
        res.redirect('/');
    } catch (error) {
        console.log(`Some error in writing file: ${error}`);
        res.status(500).send('Internal Server Error');
    }
})

app.get('/file/:filename', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname,'files',`${req.params.filename}`),'utf-8');
        res.render('show', {title: req.params.filename, description: data});
    } catch (error) {
        console.log(`Error: ${error}`);
        res.status(404).send('File Not Found');
    }
})


app.get('/edit/:filename', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname,'files',`${req.params.filename}`),'utf-8');
        res.render('edit', {title: req.params.filename, description: data});
    } catch (error) {
        console.log(`Error: ${error}`);
        res.status(404).send('File Not Found');
    }
})

app.post('/edit', async (req, res) => {
    try {
        await fs.rename(path.join(__dirname,'files',`${req.body.previousName.split(' ').join('-')}.txt`), path.join(__dirname,'files',`${req.body.newName.split(' ').join('-')}.txt`));
        await fs.writeFile(path.join(__dirname,'files',`${req.body.newName.split(' ').join('-')}.txt`), req.body.EditedDescription);
        console.log('File edited');
        res.redirect('/');
    } catch (error) {
        console.log(`Some error in editing file: ${error}`);
        res.status(500).send('Internal Server Error');
    }
})

app.get('/delete/:filename', async (req, res) => {
    try {
        await fs.unlink(path.join(__dirname,'files',`${req.params.filename}`));
        console.log('File deleted');
        res.redirect('/');
    } catch (error) {
        console.log(`Some error in deleting file: ${error}`);
        res.status(500).send('Internal Server Error');
    }
})
//listening on PORT
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
