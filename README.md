# responsible-tech-api 

## Framework API

One of our efforts under the Responsible and Inclusive Tech initiative is to create a framework to help people to reflect about their projects and their actions so that they can anticipate and mitigate negative impacts very early in projects.

The proposed framework comprises 3 perspectives/forces (self, business, and society), shedding light on each of their intentions, motivations, and past actions, while actively working in the present to build a responsible and inclusive future.

On top of these perspectives, the framework puts forth a richer context of use and design mapping to promote awareness and reveal a wider range of impacts and considerations.

### Self

Self accounts for individual interests or smaller team goals when tackling technical challenges, such as creating scientific breakthroughs, advancing knowledge, or increasing eminence and recognition.

### Business

Business accounts for larger teams, internal organizations, clients, and potential competitors when addressing technical and user needs, increasing efficiency, lowering costs, defining strategy, or conforming to regulations.

### Society

Society accounts for people and their communities, as well as any associated laws and cultural norms, concerned primarily with (in)direct impacts on work, environment, wealth, health, and fundamental rights.

This framework was developed to generate a collective and collaborative understanding about various IBM-wide research efforts in the context of societal benefit, impact, and inclusion. We recognize that deeply understanding various aspects of potential outcomes of the technology we create is important to our research community, as is anticipating and mitigating unintended harms.

### The API

Part of the framework considers a <a href="./static/json/framework_questions.json">set of questions</a> covering different types, different project stages, and different perspectives.
Thus, this API aims at supporting people to use the R&I Framework, enabling easier connection of multiple content management systems to a recommendation service that brings contextualized R&I information. The planned recommendations include questions from the framework, stakeholders, and definitions about R&I terms.

- /incltech/question/
- /incltech/stakeholder/
- /incltech/define/
- /incltech/initgame/

You can play with our Responsible Tech Cards here: https://incltech.mybluemix.net/incltech/static/game.html

Or, you can play with our Swagger API here: https://incltech.mybluemix.net/incltech/api-docs/

## Usage

This repository contains some example best practices for open source repositories:

* [LICENSE](LICENSE)
* [README.md](README.md)
* [CONTRIBUTING.md](CONTRIBUTING.md)
* [MAINTAINERS.md](MAINTAINERS.md)
<!-- A Changelog allows you to track major changes and things that happen, https://github.com/github-changelog-generator/github-changelog-generator can help automate the process -->
* [CHANGELOG.md](CHANGELOG.md)

> These are optional

<!-- The following are OPTIONAL, but strongly suggested to have in your repository. -->
* [dco.yml](.github/dco.yml) - This enables DCO bot for you, please take a look https://github.com/probot/dco for more details.
* [travis.yml](.travis.yml) - This is a example `.travis.yml`, please take a look https://docs.travis-ci.com/user/tutorial/ for more details.

These may be copied into a new or existing project to make it easier for developers not on a project team to collaborate.

<!-- A notes section is useful for anything that isn't covered in the Usage or Scope. Like what we have below. -->
## Notes

**NOTE: While this boilerplate project uses the Apache 2.0 license, when
establishing a new repo using this template, please use the
license that was approved for your project.**

**NOTE: This repository has been configured with the [DCO bot](https://github.com/probot/dco).
When you set up a new repository that uses the Apache license, you should
use the DCO to manage contributions. The DCO bot will help enforce that.
Please contact one of the IBM GH Org stewards.**

<!-- Questions can be useful but optional, this gives you a place to say, "This is how to contact this project maintainers or create PRs -->
If you have any questions or issues you can create a new [issue here][issues].

Pull requests are very welcome! Make sure your patches are well tested.
Ideally create a topic branch for every separate change you make. For
example:

1. Fork the repo
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Added some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## License

All source files must include a Copyright and License header. The SPDX license header is 
preferred because it can be easily scanned.

If you would like to see the detailed LICENSE click [here](LICENSE).

```text
#
# Copyright 2020- IBM Inc. All rights reserved
# SPDX-License-Identifier: Apache2.0
#
```
## Authors

Optionally, you may include a list of authors, though this is redundant with the built-in
GitHub list of contributors.

- Author: Vagner Santana <vsantana@ibm.com>

[issues]: https://github.com/IBM/repo-template/issues/new