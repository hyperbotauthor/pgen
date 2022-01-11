# pgen

Npm package generator.

# Resources

https://docs.npmjs.com/cli/v7/configuring-npm/package-json

## Linking Netlify site

put a `state.json` file in the `.netlify` folder ( change `siteId` to your actual `API ID`, you can look this up at https://app.netlify.com/sites/authstore/settings/general, in the link again change `authstore` to your actual site name )

```json
{
	"siteId": "2f53b648-bdcd-4d21-a809-9f997a8b4b7f"
}
```