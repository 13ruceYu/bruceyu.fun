import type { Site, Metadata, Socials } from '@types'

export const SITE: Site = {
  NAME: 'Bruce Yu',
  EMAIL: 'bruceyuhongbo@gmail.com',
  DESCRIPTION: 'Bruce\'s Portfolio',
  NUM_POSTS_ON_HOMEPAGE: 10,
  NUM_WORKS_ON_HOMEPAGE: 2,
  NUM_PROJECTS_ON_HOMEPAGE: 8,
}

export const HOME: Metadata = {
  TITLE: '',
  DESCRIPTION: 'Bruce\'s Portfolio',
}

export const BLOG: Metadata = {
  TITLE: 'Blog',
  DESCRIPTION: 'A collection of articles on topics I am passionate about.',
}

export const WORK: Metadata = {
  TITLE: 'Work',
  DESCRIPTION: 'Where I have worked and what I have done.',
}

export const PROJECTS: Metadata = {
  TITLE: 'Projects',
  DESCRIPTION: 'A collection of my projects, with links to repositories and demos.',
}

export const THOUGHTS: Metadata = {
  TITLE: 'Thoughts',
  DESCRIPTION: '一些我的愚蠢的，天才的，幽默的，无聊的想法。',
}

export const SOCIALS: Socials = [
  {
    NAME: 'GitHub',
    HREF: 'https://github.com/13ruceYu'
  },
]
