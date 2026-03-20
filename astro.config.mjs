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
            { label: 'Configuration', slug: 'getting-started/configuration' },
          ],
        },
        {
          label: 'Concepts',
          items: [
            { label: 'Authentication', slug: 'concepts/authentication' },
            { label: 'API Envelope & Errors', slug: 'concepts/envelope' },
            { label: 'Pagination & Filtering', slug: 'concepts/pagination' },
            { label: 'Compact Format', slug: 'concepts/compact-format' },
            { label: 'WebSocket', slug: 'concepts/websocket' },
            { label: 'Soft Deletes', slug: 'concepts/soft-deletes' },
          ],
        },
        {
          label: 'API Reference',
          items: [
            { label: 'Overview', slug: 'api/overview' },
            { label: 'Notes', slug: 'api/notes' },
            { label: 'Events', slug: 'api/events' },
            { label: 'Contacts', slug: 'api/contacts' },
            { label: 'Emails', slug: 'api/emails' },
            { label: 'Email Accounts', slug: 'api/email-accounts' },
            { label: 'Files & Drive', slug: 'api/files' },
            { label: 'Photos', slug: 'api/photos' },
            { label: 'Diary', slug: 'api/diary' },
            { label: 'Bookmarks', slug: 'api/bookmarks' },
            { label: 'Feeds (RSS)', slug: 'api/feeds' },
            { label: 'Search', slug: 'api/search' },
            { label: 'Entity Links & Graph', slug: 'api/entity-links' },
            { label: 'Kanban (Projects)', slug: 'api/kanban' },
            { label: 'Diagrams', slug: 'api/diagrams' },
          ],
        },
        {
          label: 'Infrastructure API',
          items: [
            { label: 'Storage (HAL)', slug: 'infrastructure/storage' },
            { label: 'Network & Proxy', slug: 'infrastructure/network' },
            { label: 'DNS', slug: 'infrastructure/dns' },
            { label: 'VPN', slug: 'infrastructure/vpn' },
            { label: 'Processes', slug: 'infrastructure/processes' },
            { label: 'Managed Services', slug: 'infrastructure/managed-services' },
          ],
        },
        {
          label: 'AI & Intelligence',
          items: [
            { label: 'Digest Engine', slug: 'intelligence/digest' },
            { label: 'Knowledge Graph', slug: 'intelligence/knowledge-graph' },
            { label: 'Entity Extraction', slug: 'intelligence/entity-extraction' },
            { label: 'Voice (STT/TTS)', slug: 'intelligence/voice' },
          ],
        },
        {
          label: 'Integrations',
          items: [
            { label: 'Finance Suite', slug: 'integrations/finance' },
            { label: 'Crypto Stack', slug: 'integrations/crypto' },
            { label: 'Mail Server', slug: 'integrations/mail-server' },
            { label: 'Multimedia Suite', slug: 'integrations/multimedia' },
          ],
        },
        {
          label: 'Skills & Apps',
          items: [
            { label: 'What Are Skills?', slug: 'skills/what-are-skills' },
            { label: 'Creating a Skill', slug: 'skills/creating-a-skill' },
            { label: 'Skill API', slug: 'skills/skill-api' },
            { label: 'What Are Apps?', slug: 'apps/what-are-apps' },
            { label: 'Creating an App', slug: 'apps/creating-an-app' },
            { label: 'App API', slug: 'apps/app-api' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Self-Hosting', slug: 'guides/self-hosting' },
            { label: 'Backups & Restore', slug: 'guides/backups' },
            { label: 'Custom Themes', slug: 'guides/custom-theme' },
            { label: 'Sync (Google, IMAP, CardDAV)', slug: 'guides/sync' },
            { label: 'Multi-User Setup', slug: 'guides/multi-user' },
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
