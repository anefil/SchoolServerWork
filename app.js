const fs = require("fs");
const http = require("http");

/** @typedef {Object} ParsedURL
 *  @property {string[]} body
 *  @property {[string,string][]} getParams
 * @returns {ParsedURL} 
 * */
function parseURL(URL) {

    if (process.env.RUN_TYPE.trim() == "debug" && URL[1] != "p"){ // local server
        return {
            body: URL.slice(1).replace(/\?.*/,"").split("/").filter(v=>v.length!=0),
            getParams: URL.slice(1).replace(/.*\?/,"").split("&").map(v => v.split("=")).filter(v=>v[0].length!=0||v[1].length!=0)
        };
    } else if (process.env.RUN_TYPE.trim() != "debug" && URL[1] == "p") {
        return {
            body: URL.slice(8).replace(/\?.*/,"").split("/").filter(v=>v.length!=0),
            getParams: URL.slice(8).replace(/.*\?/,"").split("&").map(v => v.split("=")).filter(v=>v[0].length!=0||v[1].length!=0)
        };
    } else {
        throw new Error("enviroment setup error");
    }
}


let s = http.createServer((req,res) => {
    res.setHeader("Content-Type", "text/html");
    try {
        let parsed_url = parseURL(req.url);
        let debugInfo;
        if (process.env.RUN_TYPE.trim() == "debug") 
            debugInfo = `<hr><table> ${req.rawHeaders.map((v,i,_) => i%2==0?`<tr><td>${v}</td>`:`<td>${v}</td></tr>`).join('')} </table><p>URL: ${JSON.stringify(req.url)}</p><p>Method: ${JSON.stringify(req.method)}</p> <p>Parsed URL: ${JSON.stringify(parsed_url)}</p>`;
        else
            debugInfo = "Debug info is disabled for the release";
        
        if(parsed_url.body.length == 0) { //root
            let html = fs.readFileSync("main_screen.html").toString();
            html = html.replace("##INJECT##", debugInfo);
            res.end(html);
        }
        //  else if(parsed_url.body.length == 1 && parsed_url.body[0] == "") {

        // }
        else {
            res.end(debugInfo);
        }

    } catch (e) {
        res.end(`${e.message}`);
    }
})


s.listen(3000, "localhost");
s.listen(3000, "localhost");