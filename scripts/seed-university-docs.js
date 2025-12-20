
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding University/SOP Documentation...');

  const docs = [
    // I. Overview
    {
      title: "Overview and Introduction",
      slug: "overview-introduction",
      category: "1. Overview",
      type: "university",
      order: 1,
      content: "# Overview and Introduction\\n\\n## Purpose and Scope\\nCMS University is the central knowledge base for the Ledger1 CMS platform. It is designed to provide users, administrators, and developers with comprehensive standard operating procedures (SOPs), how-to guides, and technical references.\\n\\n## Key Features\\n- **SOP Management**: Create and organize standard operating procedures.\\n- **Role-Based Access**: Manage permissions for team members and admins.\\n- **Content Engine**: Powerful tools for managing blogs, documentation, and media.\\n- **CRM Integration**: Built-in customer relationship management with lead tracking.\\n\\n## System Architecture\\nThe CMS is built on a modern stack:\\n- **Next.js**: React framework for the frontend and API.\\n- **Prisma & MongoDB**: Database layer for flexible content storage.\\n- **Tailwind CSS**: Utility-first styling for a consistent design system."
    },

    // II. User and Role Management
    {
      title: "User Roles Explained",
      slug: "user-roles",
      category: "2. User Management",
      type: "university",
      order: 2,
      content: "# User Roles Explained\\n\\nUnderstanding permissions is critical for system security and workflow efficiency.\\n\\n- **Account Admin**: Full access to all modules, settings, and billing.\\n- **System Administrator**: Can manage users, integrations, and system-wide configurations.\\n- **Editor/Member**: Access to content (Blog, Media) and CRM features but restricted from sensitive system settings.\\n- **Viewer**: Read-only access to specific modules (if configured).\\n\\nPermissions can be customized in the **Roles** section of the Settings module."
    },
    {
      title: "Account Creation and Login",
      slug: "account-creation",
      category: "2. User Management",
      type: "university",
      order: 3,
      content: "# Account Creation and Login\\n\\n## Creating a New User\\n1. Navigate to **System > Users**.\\n2. Click **Create User**.\\n3. Fill in the required details:\\n   - Full Name\\n   - Email Address\\n   - Role (e.g., Administrator, Member)\\n4. The user will receive an email with login instructions (if email service is configured) or you can set a temporary password.\\n\\n## Logging In\\nAccess the CMS at your specific domain (e.g., `app.ledger1.ai`). Use your email and password."
    },
    {
      title: "Password Reset and Security",
      slug: "password-security",
      category: "2. User Management",
      type: "university",
      order: 4,
      content: "# Password Reset and Security\\n\\n## Resetting Passwords\\n- **Self-Service**: Users can click \"Forgot Password\" on the login screen.\\n- **Admin Reset**: Admins can manually reset a user's password from the **Users** dashboard by selecting the user and choosing \"Reset Password\".\\n\\n## Security Best Practices\\n- Enforce Multi-Factor Authentication (MFA) where possible.\\n- Regularly audit user roles and remove access for departed employees.\\n- Rotate API keys annually."
    },

    // III. Content Management
    {
      title: "Creating Knowledge Base Articles",
      slug: "creating-articles",
      category: "3. Content Management",
      type: "university",
      order: 5,
      content: "# Creating Knowledge Base Articles\\n\\nThe CMS features a robust documentation builder used for both public docs and internal SOPs.\\n\\n## Workflow\\n1. **Navigate**: Go to **Content > Documentation** (for public docs) or **System > University** (for internal SOPs).\\n2. **Create**: Click **Create New** (or \"Create SOP\").\\n3. **Drafting**:\\n   - **Title**: Enter a clear, descriptive title.\\n   - **Category**: Group related articles (e.g., \"Getting Started\", \"API\").\\n   - **Slug**: Automatically generated, but editable for SEO friendly URLs.\\n4. **Editor**: Use the Markdown editor to write your content.\\n5. **Save**: Click **Save Article** to publish changes immediately.\\n\\n## Tips\\n- Use headings (#, ##) to structure content.\\n- Use the **AI Create** button to generate initial drafts based on a topic."
    },
    {
      title: "Managing Media Assets",
      slug: "managing-media",
      category: "3. Content Management",
      type: "university",
      order: 6,
      content: "# Managing Media Assets\\n\\nThe **Media Library** is the central repository for images, videos, and documents.\\n\\n## Uploading\\n1. Go to **Content > Media Library**.\\n2. Drag and drop files or click **Upload**.\\n3. Supported formats: JPG, PNG, WEBP, PDF.\\n\\n## Editing & SEO\\n- Click on an image to view details.\\n- Add **Alt Text** and **Captions** for better accessibility and SEO.\\n- Use the **AI** tools to auto-generate descriptions if enabled."
    },
    {
      title: "Publishing and Unpublishing",
      slug: "publishing-workflow",
      category: "3. Content Management",
      type: "university",
      order: 7,
      content: "# Publishing Workflow\\n\\n## Publishing\\nContent in the CMS (Blogs, Docs) is generally \"live\" once saved, unless a specific \"Draft\" status is available for that module.\\n\\n## Taking Content Down\\n- **Delete**: Permanently removes the content.\\n- **Unpublish**: For Blogs, switch the status to \"Draft\" to hide from the public site.\\n- **Docs/SOPs**: Currently, deleting or removing the category is the primary way to hide content, or restricted by permissions."
    },

    // IV. Enrollment (Mapped to Team/CRM)
    {
      title: "Team Onboarding & Access",
      slug: "team-onboarding",
      category: "4. Team & Enrollment",
      type: "university",
      order: 8,
      content: "# Team Onboarding & Access\\n\\nWhile \"Enrollment\" typically refers to students, in the CMS context, it applies to onboarding team members to the platform.\\n\\n## Onboarding Methods\\n1. **Manual Invitation**: Admin invites user via email.\\n2. **Bulk Import**: (If supported) Import users via CSV in the Users module.\\n\\n## Tracking Activity\\n- Monitor user activity via **System > Activity Log**.\\n- Track login times and content changes to ensure compliance and engagement."
    },

    // V. System Administration
    {
      title: "System Configuration",
      slug: "system-configuration",
      category: "5. System Administration",
      type: "university",
      order: 9,
      content: "# System Configuration\\n\\nGlobal settings control the behavior of the CMS.\\n\\n## Key Settings\\n- **Branding**: Update logos, colors, and themes in **System > Settings**.\\n- **Modules**: Enable/Disable sidebar modules (e.g., hiding \"Recruitment\" if not used).\\n- **Localization**: Configure default language and regions."
    },
    {
      title: "Performance & Maintenance",
      slug: "performance-maintenance",
      category: "5. System Administration",
      type: "university",
      order: 10,
      content: "# Performance & Maintenance\\n\\n## Monitoring\\n- Check the **Dashboard** for realtime stats on database usage and API calls.\\n- Use **Activity Log** to trace errors or unexpected behaviors.\\n\\n## Backups\\n- The system relies on database-level backups (e.g., MongoDB Atlas / Cosmos DB automated backups).\\n- **Manual Export**: Regularly export critical lists (Leads, Users) to CSV for offline archiving."
    },

    // VI. API Usage
    {
      title: "API Authentication",
      slug: "api-authentication",
      category: "6. API & Developers",
      type: "university",
      order: 11,
      content: "# API Authentication\\n\\nThe CMS provides a RESTful API for integrating with external applications.\\n\\n## API Keys\\n1. Go to **Settings > API Keys** (or User Profile > Security).\\n2. Generate a new key.\\n3. Include the key in the `Authorization` header:\\n   ```http\\n   Authorization: Bearer <YOUR_API_KEY>\\n   ```\\n\\n*(Note: Implementation depends on specific auth provider configuration).*"
    },
    {
      title: "API Endpoints Reference",
      slug: "api-endpoints",
      category: "6. API & Developers",
      type: "university",
      order: 12,
      content: "# API Endpoints Reference\\n\\n## Common Resources\\n\\n### Documentation\\n- `GET /api/docs`: List all documentation.\\n- `POST /api/docs`: Create new documentation.\\n- `GET /api/docs/:id`: Retrieve specific doc.\\n\\n### Content\\n- `GET /api/blog`: Retrieve blog posts.\\n- `POST /api/upload`: Upload media assets.\\n\\n### University\\n- `GET /api/docs/categories?type=university`: Get SOP categories."
    },
    {
      title: "Data Models",
      slug: "data-models",
      category: "6. API & Developers",
      type: "university",
      order: 13,
      content: "# Data Models\\n\\n## User\\n```json\\n{\\n  \"id\": \"string\",\\n  \"email\": \"string\",\\n  \"name\": \"string\",\\n  \"role\": \"string\",\\n  \"cmsModules\": [\"string\"]\\n}\\n```\\n\\n## DocArticle (SOPs)\\n```json\\n{\\n  \"id\": \"string\",\\n  \"title\": \"string\",\\n  \"slug\": \"string\",\\n  \"category\": \"string\",\\n  \"type\": \"university\", // or \"docs\"\\n  \"content\": \"markdown string\",\\n  \"updatedAt\": \"date\"\\n}\\n```"
    }
  ];

  for (const doc of docs) {
    const exists = await prisma.docArticle.findUnique({
      where: { slug: doc.slug }
    });

    if (exists) {
      // If exists but not university type (very unlikely with unique slugs unless user reused a slug), or we want to update it
      if (exists.type !== 'university') {
        console.log('Existing doc ' + doc.slug + ' is type ' + exists.type + '. Skipping update to avoid conflicts.');
        continue;
      }

      console.log('Updating ' + doc.title + '...');
      await prisma.docArticle.update({ where: { id: exists.id }, data: doc });
    } else {
      await prisma.docArticle.create({
        data: doc
      });
      console.log('Created ' + doc.title);
    }
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
