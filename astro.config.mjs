// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://docs.micelclaw.com',
  output: 'static',
  integrations: [
    starlight({
      title: 'Micelclaw Docs',
      customCss: ['./src/styles/custom.css'],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/micelclaw' },
      ],
      editLink: {
        baseUrl: 'https://github.com/micelclaw/docs/edit/main/',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Welcome', slug: 'getting-started/welcome' },
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'Quickstart', slug: 'getting-started/quickstart' },
          ],
        },
        {
          label: 'Architecture',
          items: [
            { label: 'Overview', slug: 'architecture/overview' },
            { label: 'Database', slug: 'architecture/database' },
            { label: 'Hook Pipeline', slug: 'architecture/hook-pipeline' },
            { label: 'Event System', slug: 'architecture/event-system' },
          ],
        },
        {
          label: 'API Reference',
          items: [
            { label: 'Authentication', slug: 'api/authentication' },
            { label: 'REST Endpoints', slug: 'api/rest-endpoints' },
            { label: 'WebSocket', slug: 'api/websocket' },
          ],
        },
        {
          label: 'Skills',
          items: [
            { label: 'What Are Skills?', slug: 'skills/what-are-skills' },
            { label: 'Creating a Skill', slug: 'skills/creating-a-skill' },
            { label: 'Skill API', slug: 'skills/skill-api' },
          ],
        },
        {
          label: 'Apps',
          items: [
            { label: 'What Are Apps?', slug: 'apps/what-are-apps' },
            { label: 'Creating an App', slug: 'apps/creating-an-app' },
            { label: 'App API', slug: 'apps/app-api' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Self-Hosting', slug: 'guides/self-hosting' },
            { label: 'Backups', slug: 'guides/backups' },
            { label: 'Custom Theme', slug: 'guides/custom-theme' },
          ],
        },
        {
          label: 'Contributing',
          items: [
            { label: 'Development Setup', slug: 'contributing/development-setup' },
            { label: 'Code Style', slug: 'contributing/code-style' },
            { label: 'Pull Requests', slug: 'contributing/pull-requests' },
          ],
        },
      ],
    }),
  ],
});
