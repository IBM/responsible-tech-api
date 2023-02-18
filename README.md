# responsible-tech-api 

## Responsible and Inclusive Framework 

Technology development practices in industry are often primarily focused on business results, which risks creating unbalanced power relations between corporate interests and the needs or concerns of people who are affected by technology implementation and use. These practices, and their associated cultural norms, may result in uses of technology that have direct, indirect, short-term, and even long-term negative effects on groups of people, communities, and/or the environment.

The work the Responsible and Inclusive Tech Team develops is grounded on a formative framework (R&I Framework) that orients critical reflection around the social contexts of technology creation and use; the power dynamics between self, business, and societal stakeholders; the impacts of technology on various communities across past, present, and future dimensions; and the practical decisions that imbue technological artifacts with cultural values.

### The API

The API aims at providing multiple instantiations of the framework from high-granularity endpoints to standalone tools to be added to existing development methods, design activities, research practices, and/or business proceses already in place.

The API aims at supporting people to use the R&I Framework, enabling easier connection to contextualized information from R&I Framework, including questions from the framework, stakeholders, and definitions about R&I terms, and different ways of navigating through R&I Framework <a href="./static/json/framework_questions.json">questions</a> (e.g., Responsible Tech Cards).

- /incltech/question/
- /incltech/stakeholder/
- /incltech/define/
- /incltech/initgame/

You can play with our Swagger API here: https://incltech.mybluemix.net/incltech/api-docs/

## Reponsible Tech Cards

Societal implications of technology are often considered after public deployment. However, broader impacts ought to be considered during the onset and throughout development to reduce potential for harmful uses, biases, and exclusions. There is a need for tools and frameworks that help technologists become more aware of broader contexts of their work and engage in more responsible and inclusive practices. In this context, we introduce an online card tool containing questions to scaffold critical reflection about projects’ impacts on society, business, and research. The tool was developed considering findings from five internal workshops with teams distributed across IBM, as well as interviews with people with disabilities to assess gameplay and mental models. The tool promoted discussions about challenging topics, reduced power gaps through democratized turn-taking, and enabled participants to identify concrete areas to improve their practice.

![Responsible Tech Cards demo](./static/images/card_tool-demo.gif)

You can play with Responsible Tech Cards here: https://incltech.mybluemix.net/incltech/static/game.html

**Please cite as:** Salma Elsayed-Ali, Sara E Berger, Vagner Figueredo de Santana, and Juana Catalina Becerra Sandoval. 2023. Responsible & Inclusive Cards: An Online Card Tool to Promote Critical Reflection in Technology Industry Work Practices. In Proceedings of the 2023 CHI Conference on Human Factors in Computing Systems (CHI ’23), April 23–28, 2023, Hamburg, Germany. ACM, New York, NY, USA, 14 pages. https://doi.org/10.1145/3544548.3580771

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