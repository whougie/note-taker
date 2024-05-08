const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const generateUniqueId = require('generate-unique-id');

const dbFilePath = ("./db/db.json");

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// handles the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// handles the notes page
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/notes.html'));
});

// handles the /api/notes
app.get('/api/notes', async (req, res) => {
  try {
    const data = await getDbData();
    res.json(JSON.parse(data));
  } catch(error) {
    res.status(500).json({status: "bad", message: "Issues reading values from DB file"});
  }
});

// handles the save notes
app.post('/api/notes', async (req, res) => {
  const id = generateUniqueId();
  let dbData = await getDbData();
  if (dbData.length !== 0) 
    dbData = JSON.parse(dbData);
  req.body.id = id; // setting the id generated to the request so the save simpler
  dbData.push(req.body);
  fs.writeFile(dbFilePath, 
    JSON.stringify(dbData))
    .then( () => {
      res.json({status: "Great", message: "Successfully wrote the db.json"});
    }) 
    .catch(error => {
      if (error) {
        res.status(500).json({status: "bad", message: "Issues writing values from DB file"});
      }
    })
  });
  
  // handles the delete notes
  app.delete('/api/notes/:id', async (req, res) => {
    let dbData = await getDbData();
    dbData = JSON.parse(dbData);
    if (dbData.length !== 0) {
      dbData.forEach( (entry, index) => {
        if (entry.id === req.params.id) {
          dbData.splice(index, 1);
          
          // Save the file back to the DB file system
          fs.writeFile(dbFilePath, 
            JSON.stringify(dbData))
            .then( () => {
              res.json({status: "Great", message: "Successfully wrote the db.json"});
            }) 
            .catch(error => {
              if (error) {
                res.status(500).json({status: "bad", message: "Issues writing values from DB file"});
              }
            })
          }
        })
      }
    })
    
    
    app.listen(PORT, () => {
      console.log("Now listening at http://localhost:"+PORT);
    })
    
    
    ////
    // Function Declarations
    ////
    async function getDbData() {
      let fileData = await fs.readFile(dbFilePath, 'utf-8', (error) => {
        error ? console.log(error) : console.log("Read db.json successfully");
      });
      
      if (!fileData) {
        fileData = [];
        return fileData;
      } else {
        return fileData;
      }
    }