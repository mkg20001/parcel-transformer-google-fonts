# parcel-transformer-google-fonts

Automagically rehost google fonts by bundeling them into your application

# Usage

Add parcel-transformer-google-fonts as a transformer for parcel by adding this to your package.json

```json
{
  "parcel": {
    "transforms": {
      "*.html": ["parcel-transformer-google-fonts"]
    }
  }
}
```

# What it does

Basically it takes google fonts urls like these

```html
<link href="https://fonts.googleapis.com/css?family=Roboto:regular,bold,italic,thin,light,bolditalic,black,medium&amp;lang=en" rel="stylesheet">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

And downloads them into a local cache while replacing them during the build process
