
const tickettoastsDefaultHost = 'https://feierabendkollektiv.tickettoaster.de';
const tickettoastsDefaultQuerySelector = '.tickettoasts-wrapper';
const tickettoastsDefaultConfig = {
    fetch: {
        host: tickettoastsDefaultHost,
        url: 'faceless/api/1/public/products.json',
        filter: [['type', '=', 'Ticket']],
        sort: {
            field: 'valid_start_on',
            order: 'asc',
        },
        limit: Infinity,
    },
    html: {
        querySelector: tickettoastsDefaultQuerySelector,
        hiddenCities: ['Stuttgart'],
        linkTarget: '_blank',
    },
};

function tickettoasterIsoDateToGerman(dateString) {
    const d = new Date(dateString);
    const day = `${d.getDate()}`;
    const month = `${d.getMonth() + 1}`;
    return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${d.getFullYear() % 100}`;
}

function fetchTickettoasterProducts(config = tickettoastsDefaultConfig) {
    const api = `${config.fetch.host}/${config.fetch.url}`;
    const params = Object.fromEntries(
        config.fetch.filter.map(([key, op, val]) => [`filter[${key}][${op}]`, val])
    );
    params.order_by = config.fetch.sort.field;
    params.order = config.fetch.sort.order;
    if (config.fetch.limit !== Infinity) params.limit = config.fetch.limit;
    const search = new URLSearchParams(params);
    return fetch(`${api}?${search.toString()}`)
        .then(response => response.json())
        .then(({ products }) => products);
}

function htmlTickettoast(product, config = tickettoastsDefaultConfig) {
    const imageUrl = product.image.productthumb ? product.image.productthumb.url : product.image.url;
    const dates = product.count
        ? `${product.count} Termine ab ${tickettoasterIsoDateToGerman(product.valid_start_on)}`
        : tickettoasterIsoDateToGerman(product.valid_start_on);
    const city = config.html.hiddenCities.includes(product.location_city) || product.location.includes(product.location_city)
        ? ''
        : `, ${product.location_city}`;
    const location = `${product.location}${city}`

    const image = document.createElement('div');
    image.classList.add('tickettoast-image');
    image.style.setProperty('background-image', `url(\'${config.fetch.host}${imageUrl}\')`);

    const labelText = document.createTextNode(dates);
    const label = document.createElement('div');
    label.classList.add('tickettoast-label');
    label.appendChild(labelText);

    const heightDeterminator = document.createElement('div');
    heightDeterminator.classList.add('tickettoast-heightdeterminator');

    const imagewrapper = document.createElement('div');
    imagewrapper.classList.add('tickettoast-imagewrapper');
    [heightDeterminator, image].forEach(el => imagewrapper.appendChild(el));

    const titleText = document.createTextNode(product.event || product.title);
    const title = document.createElement('div');
    title.classList.add('tickettoast-title');
    title.appendChild(titleText);

    const hr = document.createElement('hr');
    hr.classList.add('tickettoast-caption-hr');

    const subtitleText = document.createTextNode(location);
    const subtitle = document.createElement('div');
    subtitle.classList.add('tickettoast-subtitle');
    subtitle.appendChild(subtitleText);
    
    const buttonText = document.createTextNode(product.type);
    const button = document.createElement('div');
    button.classList.add('tickettoast-button');
    button.appendChild(buttonText);

    const caption = document.createElement('div');
    caption.classList.add('tickettoast-caption');
    [title, hr, subtitle, button].forEach(el => caption.appendChild(el));

    const tickettoast = document.createElement('a');
    tickettoast.href = product.url;
    tickettoast.target = config.html.linkTarget;
    tickettoast.classList.add('tickettoast');
    [label, imagewrapper, caption].forEach(el => tickettoast.appendChild(el));

    return tickettoast;
}

function displayTickettoasts(products, config = tickettoastsDefaultConfig) {
    const elements = document.querySelectorAll(config.html.querySelector);
    const productsByEvent = products
        .map(p => !p.event_id ? p : { ...p, count: products.filter(o => o.event_id === p.event_id).length })
        .filter((p, i, arr) => p.event_id === null || arr.findIndex(o => o.event_id === p.event_id) >= i);
    let sortedProducts = config.fetch.sort.field !== 'valid_start_on' ? productsByEvent :
        productsByEvent.sort((a, b) => a.valid_start_on < b.valid_start_on ? -1 : (a.valid_start_on > b.valid_start_on ? 1 :
            (a.time_begin < b.time_begin ? -1 : (a.time_begin > b.time_begin ? 1 :
                (a.title < b.title ? -1 : (a.title > b.title ? 1 : 0))))));
    if (config.fetch.sort.field === 'valid_start_on' && config.fetch.sort.order === 'desc') sortedProducts = sortedProducts.reverse();
    elements.forEach(element => {
        const tickettoasts = document.createElement('div');
        tickettoasts.classList.add('tickettoasts');
        element.append(tickettoasts)
        sortedProducts.forEach(product => tickettoasts.appendChild(htmlTickettoast(product, config)));
    });
    return sortedProducts;
}

function tickettoasts(config = tickettoastsDefaultConfig, fetchHost = tickettoastsDefaultHost, querySelector = tickettoastsDefaultQuerySelector) {
    if (!fetchHost || !querySelector || !config) return console.error('')
    const options = tickettoastsDefaultConfig;
    options.fetch.host = fetchHost;
    options.html.querySelector = querySelector;
    if (config.fetch) {
        if (config.fetch.url) options.fetch.url = config.fetch.url;
        if (config.fetch.filter && Array.isArray(config.fetch.filter) && config.fetch.filter.every(f => Array.isArray(f) && f.length === 3)) options.fetch.filter = config.fetch.filter;
        if (config.fetch.sort && config.fetch.sort.field) options.fetch.sort.field = config.fetch.sort.field;
        if (config.fetch.sort && config.fetch.sort.order) options.fetch.sort.order = config.fetch.sort.order;
        if (config.fetch.limit) options.fetch.limit = config.fetch.limit;
    }
    if (config.html) {
        if (config.html.hiddenCities && Array.isArray(config.html.hiddenCities)) options.html.hiddenCities = config.html.hiddenCities;
        if (config.html.linkTarget) options.html.linkTarget = config.html.linkTarget;
    }

    return fetchTickettoasterProducts(options)
        .then(products => displayTickettoasts(products, options))
        .catch(error => {
            console.log('displaying tickettoasts failed');
            console.error(error);
        })
}