///
/// Вихідний код також розміщено на гітхаб: https://github.com/anefil/SchoolServerWork 
///
///
///
///
///


const fs = require("fs");
const http = require("http");

let isDebug = process.env.RUN_TYPE.trim() == "debug";
//  isDebug = false;

/** @typedef {Object} ParsedURL
 *  @property {string[]} body
 *  @property {[string,string][]} getParams
 * @returns {ParsedURL} 
 * */
function parseURL(URL) {
    if (isDebug && (URL.length < 2 || URL[1] != "p")){ // local server
        return {
            body: URL.slice(1).replace(/\?.*/,"").split("/").filter(v=>v.length!=0),
            getParams: URL.slice(1).replace(/.*\?/,"").split("&").map(v => v.split("=")).filter(v=>v.length==2&&v[0].length!=0&&v[1].length!=0)
        };
    } else if (!isDebug && URL.length >= 2 && URL[1] == "p") {
        return {
            body: URL.slice(8).replace(/\?.*/,"").split("/").filter(v=>v.length!=0),
            getParams: URL.slice(8).replace(/.*\?/,"").split("&").map(v => v.split("=")).filter(v=>v.length==2&&v[0].length!=0||v[1].length!=0)
        };
    } else {
        throw new Error("enviroment setup error");
    }
}

/**
 * 
 * @param {string} csva 
 */
function parseCSVA(csva) {
    let lines = csva.split(/\r?\n/g);
    let delimiter = lines[0];
    console.log(`Delimiter: |${delimiter}|`);
    let objectNames = lines[1].split(delimiter);
    console.log(`Object names: |${objectNames}|`);
    let result = [];
    for(let i = 2; i < lines.length; i++) {
        let objects = lines[i].split(delimiter);
        result[i-2] = {};
        for (let j = 0; j < objects.length; j++) {
            let objectNameId = Math.min(j,objectNames.length-1);
            if (j<=objectNames.length-1) {
                result[i-2][objectNames[j]] = objects[j];
            } else {
                if(!(result[i-2]["other"] && result[i-2]["other"].length)) {
                    result[i-2]["other"] = [];
                }
                result[i-2]["other"].push(objects[j]);
            }
        }
    }
    return result;
}


let s = http.createServer((req,res) => {
    res.setHeader("Content-Type", "text/html");
    let parsed_url;
    try {
        parsed_url = parseURL(req.url);
    } catch (e) {
        res.end(`${e.message}`);
        return;
    }
        let debugInfo;
        // if (isDebug) 
            debugInfo = `<hr><table> ${req.rawHeaders.map((v,i,_) => i%2==0?`<tr><td>${v}</td>`:`<td>${v}</td></tr>`).join('')} </table><p>URL: ${JSON.stringify(req.url)}</p><p>Method: ${JSON.stringify(req.method)}</p> <p>Parsed URL: ${JSON.stringify(parsed_url)}</p>`;
        // else
        //     debugInfo = "Debug info is disabled for the release";
        
        if(parsed_url.body.length == 0) { //root
            let html = fs.readFileSync("main_screen.html").toString();
            html = html.replace("##INJECT##", debugInfo);
            res.end(html);
        }
         else if(parsed_url.body.length == 1 && parsed_url.body[0] == "results") {
            let csva = fs.readFileSync("database.csva").toString();
            let csva_parsed = parseCSVA(csva);
            let first_name = decodeURIComponent(parsed_url.getParams.filter(v => v[0]=="first_name")[0][1]);
            let surname = decodeURIComponent(parsed_url.getParams.filter(v => v[0]=="surname")[0][1]);
            let filtered_result = csva_parsed.filter(v => {
                return v["Name"] == first_name && v["Surname"] == surname;
            });
            fs.writeFileSync("result.txt", JSON.stringify(filtered_result));
            let html = fs.readFileSync("action_done.html").toString();
            html = html.replace("##INJECT##", debugInfo);
            res.end(html);
        }
        else {
            res.end(debugInfo);
        }

    
})

// if(isDebug)
    s.listen(3000, "localhost");
// else
    // s.listen(2078, "prg.oit.dp.ua");