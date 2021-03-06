function getAllScores(req, res) {
    const request = require('request');
    const { JSDOM } = require('jsdom');
    const iconv = require('iconv-lite');
    const { decodeAuthorization, isNotLogin, getScoreType } = require('./util.js');

    if (!req.headers.authorization) return res.status(403).json({ message: 'You need to get your authorization token first!' });
    var authDt = decodeAuthorization(req.headers.authorization);
    if (!authDt) return res.status(403).json({ message: 'Invalid authorization token!' });

    request.get({
        url: global.urls.allScores,
        encoding: null,
        headers: {
            "cookie": authDt.sessionID,
        }
    }, (err, response, body) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Something went wrong!' });
        };
        if (response.statusCode !== 200) return res.status(response.statusCode).json({ message: 'You might need to renew your authorization token!' });

        var data = iconv.decode(body, 'big5');
        if (isNotLogin(data)) return res.status(403).json({ message: 'You might need to login again!' });

        var dom = new JSDOM(data);

        var dataTest = [];
        var dataNormal = [];
        var d = Array.from(dom.window.document.querySelector("table").querySelectorAll("tr"));
        for (var i = 1; i < d.length; i += 2) {
            var tableName = Array.from(d[i - 1].querySelectorAll("td"));
            var tableValue = Array.from(d[i].querySelectorAll("td"));
            for (var f = 1; f < tableName.length; f++) {
                if (tableName[f].textContent === "") continue;
                if (tableValue[0].textContent.includes("平時成績")) {
                    if (!dataNormal.find(e => e.name === tableName[f].textContent)) {
                        dataNormal.push({
                            name: tableName[f].textContent,
                            values: [{name: tableValue[0].textContent, value: Number(tableValue[f].textContent)}],
                        })
                    } else {
                        var l = dataNormal.find(e => e.name === tableName[f].textContent);
                        l.values.push({name: tableValue[0].textContent, value: Number(tableValue[f].textContent)})
                    }
                    continue;
                }
                if (!dataTest.find(e => e.name === tableName[f].textContent)) {
                    dataTest.push({
                        name: tableName[f].textContent,
                        values: [{name: getScoreType(tableValue[0].textContent), value: Number(tableValue[f].textContent)}],
                    })
                } else {
                    var l = dataTest.find(e => e.name === tableName[f].textContent);
                    l.values.push({name: getScoreType(tableValue[0].textContent), value: Number(tableValue[f].textContent)})
                }
            }
        }

        dataTest.map(e => e.values.sort((a, b) => {
            return a.name.term - b.name.term || a.name.year - b.name.year || a.name.test - b.name.test;
        }));

        res.status(200).json({
            message: "Success!",
            data: {
                dataTest,
                dataNormal
            }
        });
    });
}

module.exports.getAllScores = getAllScores;