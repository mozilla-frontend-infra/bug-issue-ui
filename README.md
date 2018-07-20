# Codetribute

Codetribute is a site that guides contributors to
their first contribution. It helps new contributors 
find a project they want to work with, learn about 
that project, and then find a task that is suitable 
to their skills and interests and not already assigned to 
someone else.

## Development

### Prerequisites

- Node version v8+
- [Yarn](https://www.npmjs.com/package/yarn)

### Building

First, fork this repository to another GitHub account (your account).
Then you can clone and install:

```
git clone https://github.com/<YOUR_ACCOUNT>/codetribute.git
cd codetribute
yarn
```

### Web Server
Codetribute relies on two servers, namely, GitHub’s GraphQL API v4 (managed by GitHub) and
[bugzilla-graphql-gateway](http://github.com/mozilla-frontend-infra/bugzilla-graphql-gateway). 
The latter is required to perform queries to the Bugzilla API. For a local setup, clone the repo 
and follow the instruction for starting it prior to launching this application. You will need to
launch the bugzilla-graphql-gateway in a terminal instance separate from this application in order 
to run both simultaneously.

### Environment variables

To get started with local development, create a file in the root of the repo named
`.env` with the following content. You can also set the variables in your shell environment.

```bash
GITHUB_PERSONAL_API_TOKEN=<your_github_api_token>
BUGZILLA_ENDPOINT=http://localhost:3090
```

Generate a GitHub personal access token [here](https://github.com/settings/tokens). When prompted
about scopes, access to public repositories is the only one required.

### Code Organization

- `src/`: source code
- `src/App`: top-level component
- `src/components`: generic components that can be used in any view (not view-specific)

### Tasks and Configuration

Building this project uses [Neutrino](https://github.com/mozilla-neutrino/neutrino-dev),
[neutrino-preset-mozilla-frontend-infra](https://github.com/mozilla-frontend-infra/neutrino-preset-mozilla-frontend-infra)

### Testing changes

Install npm dependencies and start it up:

- `yarn`
- `yarn start`

This will start a local development server on port 5000 (http://localhost:5000).

Additionally if you wish to query the Bugzilla GraphQL API locally instead of
the production instance, you'll need to clone and run
[mozilla-frontend-infra/bugzilla-graphql-gateway](https://github.com/mozilla-frontend-infra/bugzilla-graphql-gateway).

## Adding a project

Codetribute can read from both GitHub and Bugzilla. Regarding the latter, only bugs with the `good-first-bug` keyword will appear in the list.
To add a new entry to the site, create a file `<project-name>.yml` in `src/data` using the [template example](#template-example) as the initial setup. 
For inspiration, check out the [Taskcluster](https://github.com/mozilla-frontend-infra/codetribute/blob/master/src/data/taskcluster.yaml) yaml file.

### Template Example

```yaml
name: <Project Name>
summary: A short summary of the project
introduction: |
  ## About <Project Name>

  <A short summary to capture the curiosity of interested contributors>

  ## Who Works on <Project Name>?

  <Give a contributor an idea of what kind of people they'll meet>

  ## How Do I Get Started?

  <General advice - tutorials to learn about the project, development setup, repo to clone if there is only one>

  ### How Do I Write the Code?

  <Summary of the development and patch-submission process -- pull requests? patches on bugzilla? tests?>

  ## How Do I Get Help?

  <Suggestions for how, and when, to ask for help -- mailing lists, irc channels, bug or issue comments, etc.>

products:
- <Bugzilla Product>
- <Bugzilla Product>: [<Bugzilla Component 1>, <Bugzilla Component 2>]
repositories:
- <Organization Name>/<Repository Name> : <Github Label>
- <Organization Name>/<Repository Name> : [<Github Label 1>, <Github Label 2>]

```
_Note: The `summary` and `introduction` fields are to be rendered as markdown, allowing for bullet points, links and other simple formatting._

### Best Practices
To have github issues shown in the site, it has to have any of the label stated in the project's yaml file. To have bugzilla bugs to appear in the site, 
it has to have good-first-bug as keywords. For both bugzilla bugs and github issues, we only display unassigned bugs / issues by default. You can
view the assigned bugs / issues by clicking on the filter icon besides the Feeling Adventurous Button.

## Data Flow

![data flow image](codetribute-data-flow.png)

## Contributing

This project welcomes contributors. If you are interested, please feel free to
join [the mailing list](https://mail.mozilla.org/listinfo/bugsahoy-devel)


