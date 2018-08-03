# dash-html-components

Vanilla HTML components for [Dash][]


## Getting Started

### Installation

```sh
# Install dependencies
$ npm install

# Watch source for changes and build to `lib/`
$ npm start
```

### Generating HTML Components

The components in `src/components`, as well as the export index in
`src/index.js` are programmatically generated from element definitions in
`scripts/`. To regenerate:

The list of attributes is regenerated by scraping the
[MDN HTML attribute reference][].

```sh
$ npm run generate-components
```
### Development

#### Testing your components in Dash

1. Build development bundle to `lib/` and watch for changes

        # Once this is started, you can just leave it running.
        $ npm start

2. Install module locally (after every change)

        # Generate metadata, and build the JavaScript bundle
        $ npm run install-local

        # Now you're done. For subsequent changes, if you've got `npm start`
        # running in a separate process, it's enough to just do:
        $ python setup.py install

3. Run the dash layout you want to test

        # Import dash_html_components to your layout, then run it:
        $ python my_dash_layout.py

#### Installing python package locally

Before publishing to PyPi, you can test installing the module locally:

```sh
# Install in `site-packages` on your machine
$ npm run install-local
```

#### Uninstalling python package locally

```sh
$ npm run uninstall-local
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) for guidelines on contributing to this project.

## Publishing

## Builder / Archetype

We use [Builder][] to centrally manage build configuration, dependencies, and
scripts. See the [dash-components-archetype][] repo for more information.


[Builder]: https://github.com/FormidableLabs/builder
[Dash]: https://plot.ly/dash
[dash-components-archetype]: https://github.com/plotly/dash-components-archetype
[MDN HTML attribute reference]: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
[NPM package authors]: https://www.npmjs.com/package/dash-html-components/access
[PyPi]: https://pypi.python.org/pypi
