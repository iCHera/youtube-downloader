const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core'); 

const app = express();
app.use(cors());

const PORT = 4000;

app.listen(PORT, () => {
    console.log(`Сервер запущен и работает на порту ${PORT}`);
});

app.get('/download', async (req, res) => {
    try {
        const videoURL = req.query.url;

        if (!videoURL || !ytdl.validateURL(videoURL)) {
            return res.status(400).send('Ошибка: Неправильная ссылка на YouTube видео');
        }

        const info = await ytdl.getInfo(videoURL);
        const title = info.videoDetails.title.replace(/[^\w\s.-]/gi, '');

        res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);

        ytdl(videoURL, {
            filter: 'audioandvideo',
            quality: 'highest'
        }).pipe(res);

    } catch (error) {
        console.error('Ошибка на сервере:', error.message);
        res.status(500).send(`Произошла ошибка на сервере: ${error.message}`);
    }
});