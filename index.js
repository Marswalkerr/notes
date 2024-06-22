const express = require("express");
const path = require("path");
const fs = require("fs");
const { fileLoader } = require("ejs");
const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    fs.readdir("./files", (err, files) => {
        res.render("index", {files: files});
    })
});

app.post("/create", (req, res) => {
    fs.writeFile(`./files/${req.body.title.split(" ").join("")}.txt`, req.body.details, (err) => {
        res.redirect("/");
    });

})

app.get("/files/:filename", (req, res) => {
    fs.readFile(`./files/${req.params.filename}`, "utf-8", (err, filedata) => {
        res.render("show", {filename: req.params.filename, filedata: filedata});
    })
})

app.get("/files/delete/:filename", (req, res) => {
    fs.unlink(`./files/${req.params.filename}`, (err, filedata) => {
        res.redirect("/");
    })
})

app.get("/edit/:filename", (req, res) => {
    fs.readFile(`./files/${req.params.filename}`, "utf-8", (err, filedata) => {
        res.render("edit", {filename: req.params.filename, filedata: filedata});
    })
})

app.post("/update/:filename", (req, res) => {
    const oldFileName = req.params.filename; // current filename
    const newFileName = req.body.title.split(" ").join("") + ".txt"; // new filename from form input
    const newFileDetails = req.body.details; // new details from form input

    fs.readFile(`./files/${oldFileName}`, "utf-8", (err, filedata) => {
        if (err) {
            console.log(err);
            res.send("Error reading file for update");
            return;
        }

        // Check if details have changed
        if (filedata !== newFileDetails) {
            // Update file content
            fs.writeFile(`./files/${newFileName}`, newFileDetails, (err) => {
                if (err) {
                    console.log(err);
                    res.send("Error updating file details");
                    return;
                }

                // Remove old file if filename has changed
                if (oldFileName !== newFileName) {
                    fs.unlink(`./files/${oldFileName}`, (err) => {
                        if (err) {
                            console.log(err);
                            res.send("Error deleting old file");
                            return;
                        }
                        console.log("Old file deleted successfully");
                    });
                }

                console.log("File details updated successfully");
                res.redirect("/"); // redirect to home page after update
            });
        } else {
            // Only rename the file if the filename has changed
            if (oldFileName !== newFileName) {
                fs.rename(`./files/${oldFileName}`, `./files/${newFileName}`, (err) => {
                    if (err) {
                        console.log(err);
                        res.send("Error renaming file");
                        return;
                    }
                    console.log("File renamed successfully");
                    res.redirect("/"); // redirect to home page after rename
                });
            } else {
                console.log("No changes detected");
                res.redirect("/"); // redirect to home page if no changes detected
            }
        }
    });
});


app.listen(3000, () => {
    console.log("Listening on port 3000");
});