exports.handler = async function(event, context) {
  if(event.httpMethod === "POST"){
    const request = JSON.parse(event.body)
  } else {
    return {
      statusCode: 200,
      body: "you should use a POST request"
    }
  }    
}
