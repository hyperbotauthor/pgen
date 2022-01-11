export function api(endpoint: string, payload?: any): Promise<any> {
  console.info("api", endpoint, payload);
  return new Promise((resolve, reject) => {
    fetch(`/api/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload || {}),
    }).then(
      (resp) => {
        resp.text().then(
          (text) => {
            try {
              const json = JSON.parse(text);

              resolve(json);
            } catch (err) {
              console.error("api json failed", text, err);

              reject(err);
            }
          },
          (err) => {
            console.error("api text failed", err);
            reject(err);
          }
        );
      },
      (err) => {
        console.error("api fetch failed", err);
        reject(err);
      }
    );
  });
}