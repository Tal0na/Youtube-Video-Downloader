const express = require('express');
const readline = require('readline');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const ytdl = require('ytdl-core');


const app = express(); 

// bodyParser middleware 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html"); 
})

app.post("/", (req, res) => {
    const videoLink = req.body.link;
    console.log(videoLink);
    download(videoLink, res);
})

const port = 5000; 
app.listen(port, () => console.log("Server Listen to 127.0.0.1:", port));



async function download(videoLink, res){
    let n = Math.floor(Math.random() * 10000);
    let url = videoLink;
    let videID = ytdl.getURLVideoID(url);

    const output = path.resolve(__dirname, 'video-' + n + '.mp4');
    const video = ytdl(url);

    // Get Info
    ytdl.getInfo(videID).then(info => {
        console.log('title:', info.videoDetails.title);
        console.log('rating:', info.player_response.videoDetails.averageRating);
        console.log('uploaded by:', info.videoDetails.author.name);     
    });

    video.pipe(fs.createWriteStream(output));
    video.once('response', () => {
    starttime = Date.now();
    });

    video.on('progress', (chunkLength, downloaded, total) => {
        const percent = downloaded / total;
        const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
        const estimatedDownloadTime = (downloadedMinutes / percent) - downloadedMinutes;
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(`${(percent * 100).toFixed(2)}% downloaded `);
        process.stdout.write(`(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)\n`);
        process.stdout.write(`running for: ${downloadedMinutes.toFixed(2)}minutes`);
        process.stdout.write(`, estimated time left: ${estimatedDownloadTime.toFixed(2)}minutes `);
        readline.moveCursor(process.stdout, 0, -1);
      });
      
      video.on('end', () => {
        process.stdout.write('\n\n');
        console.log("Download Completed!");
        res.sendFile(__dirname + "/index.html");
      });


}


