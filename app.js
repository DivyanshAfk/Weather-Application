const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
const fs = require("fs");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// Read the contents of index.html file
const indexHTML = fs.readFileSync(__dirname + "/index.html", "utf8");

app.get("/", function(req, res) {
    // Send the HTML content as a response
    res.send(indexHTML);
});

app.post("/", function(req, res) {
    const city = req.body.cityName;
    const api = "63109e6a93a0c923b2937714da908b2e";
    const unit = "metric";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api}&units=${unit}`;

    https.get(url, function(response) {
        let rawData = "";
        response.on("data", function(chunk) {
            rawData += chunk;
        });
        response.on("end", function() {
            try {
                const weatherData = JSON.parse(rawData);
                const temperature = weatherData.main.temp;
                const weatherDescription = weatherData.weather[0].description;
                const icon = weatherData.weather[0].icon;
                const imageURL = `https://openweathermap.org/img/wn/${icon}@2x.png`;

                // Construct the HTML response dynamically
                const dynamicHTML = `
                    <h1>Weather in ${city}</h1>
                    <p>Temperature: ${temperature}°C</p>
                    <p>Condition: ${weatherDescription}</p>
                    <img src="${imageURL}" alt="Weather Icon">
                `;

                // Send the dynamic HTML as a response
                res.send(dynamicHTML);
            } catch (error) {
                console.error("Error parsing JSON:", error);
                res.status(500).send("Error fetching weather data. Please try again later.");
            }
        });
    }).on("error", function(error) {
        console.error("Error making HTTPS request:", error);
        res.status(500).send("Error fetching weather data. Please try again later.");
    });
});

app.listen(port, function() {
    console.log(`Server is running at port:${port}`);
});
 