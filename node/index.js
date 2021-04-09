const HOST = process.env.HOSTNAME;
const http = require("http");
  http
   .createServer(function(request, response){
    console.log("request received on " + HOST);
    response.end("Hello World, Hostname: " + HOST, "utf-8");
   })
   .listen(3000);

   process.on('SIGINT', function() {
    console.log( "\nShutting down" );
    process.exit(1);
  });

  console.log("server running: localhost:3000");