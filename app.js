const express = require("express");
const startBrowser = require("./startBrowser");
const fs = require("fs");
const app = express();
const port = 3000;

app.get("/search_engine/:search_engine/q/:query", (req, res) => {
    const search_engine = req.params.search_engine;
    const query = req.params.query;
    startBrowser
        .startBrowser(search_engine, query)
        .then((result) => {
            let search_metadata = {
                status: res.status === 200 ? "success" : "error",
                created_at: new Date().toISOString(),
                processed_at: new Date().toISOString(),
                duckduckgo_url: `https://www.${search_engine}.com/?q=${query}`,
            };

            res.send({ search_metadata, ...result });
        })
        .catch((err) => {
            console.log(err);
        });
});

app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
});
