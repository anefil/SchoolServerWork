const fs = require("fs");
const http = require("http");

function parseURL(URL) {
    if (URL[1] != "p"){ // local server
        return URL.slice(1).split("/");
    } else {
        return URL.slice(8).split("/");
    }
}


let s = http.createServer((req,res) => {
    res.setHeader("Content-Type", "text/html");
    let debugInfo = `<hr><table> ${req.rawHeaders.map((v,i,_) => i%2==0?`<tr><td>${v}</td>`:`<td>${v}</td></tr>`).join('')} </table><p>URL: ${JSON.stringify(req.url)}</p><p>Method: ${JSON.stringify(req.method)}</p>`;
    let parsed_url = parseURL(req.url);
    let debugInfoTwo = `<p>${parsed_url}</p>`;
    res.end(debugInfoTwo+debugInfo);
})

s.listen(3000, "localhost");