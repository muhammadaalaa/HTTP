// i used HttpIe to test the tokens 
const http = require("http");
const qs = require("querystring");
const { Buffer } = require("buffer");
const { buffer } = require("stream/consumers");
const crypto = require("crypto");
const fs = require("fs");
// //==========creating http server==================================
const server = http.createServer(async (req, res) => {
  //   // =============================creating HTTP request===============
  //   //   console.log(req.headers);
  //   //   console.log(req.url);
  //   //   console.log(req.headers["accept-encoding"]);
  //   //   if (req.headers["accept-encoding"]) {
  //   //     res.statusCode = 403;
  //   //     res.statusMessage = "we will not serve you";
  //   //     res.end("we will not serve you");
  //   //     return;
  //   //   }
  //   //   if (req.url != "/") {
  //   //     res.statusCode = 404;
  //   //     res.statusMessage = "not found";
  //   //     res.end("not found");
  //   //     return;
  //   //   }
  //   //===========================testing the query part=====================================
  // let route = req.url.split("?")[0]; // with the extract function
  // let queries = extractQuery(route);

  const routingWithQs = withQs(req.url);
  // switch (routingWithQs.path) {
  //   case "/":
  //     res.statusCode = 200;
  //     res.statusMessage = "ok";
  //     res.end("hello from server");
  //     return;
  //   case "/auth":
  //     res.statusCode = 200;
  //     res.statusMessage = "ok";
  //     res.end("hello from server route auth " + routingWithQs.QueryPart.name);
  //     return;
  //   case "/login":
  //     res.statusCode = 200;
  //     res.statusMessage = "ok";
  //     res.end("hello from server route login " + routingWithQs.QueryPart.name);
  //     break;
  //   default:
  //     res.end("hello from server route from default  ");
  // }
  //=============================withAuthentcation
  switch (routingWithQs.path) {
    case "/":
      res.statusCode = 200;
      res.statusMessage = "ok";
      res.end("hello from server");
      return;
    case "/auth":
      if (await checkAuth(req.headers["authorization"])) {
        res.statusCode = 200;
        res.statusMessage = "ok";
        res.end(" you are auth");
        break;
      } else {
        res.end("you are not auth");
        break;
      }
    case "/login":
      if (await checkAuth(req.headers["authorization"])) {
        let token = await generateToken();
        res.statusCode = 200;
        res.statusMessage = "ok";
        res.end(token);
        break;
      } else {
        res.end("hello from server route from default  ");
        break;
      }
    default:
      res.end("hello from server route from default  ");
  }
});

server.listen(8000, () => {
  console.log("server is running on port 8000");
});

// //=========creating function textract query=================
// function extractQuery(str) {
//   let obj = {};
//   let reg = /.+\?(.+)/;
//   let response = reg.exec(str);
//   if (response != null) {
//     // res[1] = param1=anything&param2=anything  == > want to separate each value
//     // regular execration to extract all thing except the & and =
//     let singleQuery = "";
//     let regTwo = /([^=&+]+)=([^=&+]+)/g;
//     //  the response =  'name=ali&age=53&gender=male'
//     // this loop mean execute this req exe each time match key and value
//     while ((singleQuery = regTwo.exec(response[1]))) {
//       obj[singleQuery[1]] = singleQuery[2];
//     }
//   }
//   return obj;
// }
//=====================================an existing built in module to extract the query part using Query string========

function withQs(str) {
  const arr = str.split("?");
  return {
    path: arr[0],
    QueryPart: qs.parse(arr[1]),
  };
}

// httpIe when you enter the username and the password it convert it into base64 hexadecimal
async function checkAuth(str) {
  if (str == null) return false;
  if (str.startsWith("Basic ")) {
    console.log("here");

    let replacedText = str.replace("Basic ", "");
    // to convert the text from hexadecimal to string we use buffer
    // i usd the credential and use the this to create buffer and convert that buffer in to string
    let convertedText = Buffer.from(replacedText, "base64").toString();
    console.log(convertedText);
    convertedText = convertedText.split(":");
    console.log(convertedText);
    return (convertedText[0] == "mohamed") & (convertedText[1] == 123);
  } else if (str.startsWith("Bearer ")) {
    console.log(str);
    let replacedText = str.replace("Bearer ", "");
    const getToken = await fs.promises.readFile("tokens", "utf-8");
    return getToken.indexOf(replacedText) >= 0;
  }
  return false;
}

async function generateToken() {
  let token = crypto.randomBytes(16).toString("hex");
  await fs.promises.writeFile("tokens", token + "\n ", "utf-8");
  setTimeout(resetToken, 20000);
  return token;
}

async function resetToken() {
  await fs.promises.writeFile("tokens", "", "utf-8");
}
