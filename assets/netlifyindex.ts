import { Handler } from '@netlify/functions'

const handler: Handler = async (event, context) => {
  if(event.httpMethod === "POST"){
    const request = JSON.parse(event.body)
  } else {
    return {
      statusCode: 200,
      body: "you should use a POST request"
    }
  }    
}

export { handler }
