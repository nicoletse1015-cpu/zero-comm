exports.handler = async (event, context) => {
  console.log("Received webhook:", event.body);

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};
