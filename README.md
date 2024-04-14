# tickettoasts

integrate tickettoaster products list into your website

... by simply loading the library

```html
    <script src="https://cdn.jsdelivr.net/gh/guischdi/tickettoasts/tickettoasts.js"></script>
```
... and invoking it

```html
  <script lang="text/javascript">tickettoasts({}, 'https://myshop.tickettoaster.de')</script>
```

This will load all public tickets of your shop and render it to all `class="ticketoasts"` DOM elements. The behaviour is heavily customizable (see _config_ section).

Of course your permitted to download the js and css files from the repository and deploy it to your own webspace for performance reasons.

## style

... the list (it's just a bunch `<a />` elements actually) to your needs, or use our tickettoaster-styled css

```html
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/guischdi/tickettoasts/tickettoasts.css">
```

## config

The configuration is straight forward. The function parameters are

```javascript
  tickettoasts(config, fetchHost, querySelector) {
```

... with the following contents expected

* `config` defaults to
```javascript
    {
      fetch: {
        host: 'https://feierabendkollektiv.tickettoaster.de', // host of your tickettoaster shop, usually https://<myshop>.tickettoaster.de
        url: 'faceless/api/1/public/products.json', // endpoint to be used for fetching, do not alter if you're not familiar with the tickettoaster api docs
        filter: [['type', '=', 'Ticket']], // filter to be applied while fetching (array of [field, operator, value] tuples, where operator can be one of = < <= > >= <> like ilike in
        sort: { // sort to be applied while fetching products
            field: 'valid_start_on', // field to be sorted by
            order: 'asc', // order of the sort, on of asc or desc
        },
        limit: Infinity, // maximum number of products to be fetched
      },
      html: {
        querySelector: '.tickettoasts-wrapper', // css query selector to determine which elements should be filled (appendChild()-ed) with product `<a />` elements
        hiddenCities: ['Stuttgart'], // list of cities not to be shown in the location part of a product element (the part after the title, before the button)
        linkTarget: '_blank', // target of the product `<a />` elements, see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#target
      },
    }
```
* `fetchHost` overrides `config.fetch.host` and defaults to `'https://feierabendkollektiv.tickettoaster.de'`
* `querySelector` overrides `config.html.querySelector` and defaults to `'.tickettoasts-wrapper'`
