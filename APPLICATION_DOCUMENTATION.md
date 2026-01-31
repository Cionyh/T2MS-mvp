# Text2MySite™ (T2MS) - Application Documentation

## Overview

**Text2MySite™ (T2MS)** is a SaaS platform that enables small business owners to update their website content instantly by simply sending a text message. The application bridges the gap between SMS communication and web content management, allowing users to display messages on their websites in real-time without any technical knowledge or coding skills.

### Core Concept

The application allows business owners to:
1. **Register their website** with the T2MS platform
2. **Verify their phone number** to enable SMS updates
3. **Send text messages** from their registered phone
4. **Display messages instantly** on their website as customizable widgets (banners, popups, modals, etc.)

---

## Key Features

### 1. SMS-to-Website Widget System

The core functionality allows users to send SMS messages that automatically appear on their website as customizable widgets.

**Widget Types:**
- **Banner**: Horizontal banner at the top or bottom of the page
- **Popup**: Small notification popup in the corner
- **Fullscreen**: Covers the entire screen
- **Modal**: Centered dialog box requiring user interaction
- **Ticker**: Scrolling text banner

**Widget Customization:**
- Background colors
- Text colors
- Font selection
- Position (top-left, top-right, bottom-left, bottom-right, center)
- Animation types
- Auto-dismiss timing
- Logo integration
- Company website links
- Background images
- Custom CSS classes

### 2. Multi-Platform Widget Embedding

The widget can be embedded on various website platforms:

**Supported Platforms:**
- WordPress
- Wix
- Shopify
- Squarespace
- Webflow
- Weebly
- Joomla
- Ghost
- BigCommerce
- Duda
- GoDaddy
- HTML5 websites
- Google Sites (via iframe)

**Embed Methods:**
- **Script Embed**: JavaScript snippet for most platforms
- **iFrame Embed**: For restricted builders like Google Sites

### 3. User Management & Authentication

**User Roles:**
- **Account Owner**: Full access to all features
- **Team Members**: Can be invited with specific permissions
- **Admin**: Platform administrators (separate admin dashboard)
- **Workers**: (Phase 2) Staff members who handle customer messages

**Authentication:**
- Email and password authentication
- Better Auth integration
- Session management
- Organization-based access control

### 4. Organization & Team Management

**Features:**
- Create organizations
- Invite team members
- Role-based permissions (owner, admin, member)
- Organization-specific clients and messages
- Team member channel assignments

### 5. Client/Site Management

**Client Registration:**
- Register multiple websites
- Domain verification
- Website ownership acknowledgment
- Custom widget configurations per site

**Phone Number Management:**
- Add multiple phone numbers per client
- Phone number verification via OTP (for owners)
- Invite links for team members
- Phone number status tracking

### 6. Message Management

**Message Features:**
- Real-time message display
- Message history tracking
- Message threading (Phase 2)
- Message status (new, in-progress, completed)
- Search and filter messages
- Pagination for large message lists
- Message analytics

**Message Types:**
- Standard banner messages
- Popup messages (prefixed with "popup:")
- Custom widget types based on configuration

### 7. Subscription & Billing

**Stripe Integration:**
- Multiple subscription tiers:
  - **Starter**: 50 websites, 10,000 messages, 50GB storage
  - **Pro**: 200 websites, 50,000 messages, 200GB storage
  - **Enterprise**: Unlimited websites and messages, 1000GB storage
- 14-day free trial for all plans
- Automatic subscription management
- Webhook handling for subscription events

**Plan Limits:**
- Website limits
- Message limits
- Storage limits
- Automatic limit enforcement

### 8. Admin Dashboard

**Admin Features:**
- User management
- Client overview
- Message analytics
- Subscription statistics
- Platform-wide analytics
- User banning/management
- System monitoring

### 9. Analytics & Reporting

**Analytics Features:**
- Message count tracking
- Website performance metrics
- User activity tracking
- Subscription analytics
- PostHog integration for user behavior

### 10. Twilio SMS Integration

**SMS Features:**
- Receive incoming SMS messages
- Send SMS replies (Phase 2)
- OTP verification via Twilio Verify
- A2P messaging compliance
- Delivery status tracking (Phase 2)
- Message routing (Phase 2)

---

## How It Works

### Step 1: Registration & Setup

1. **User Registration**
   - User creates an account at Text2MySite™
   - Completes sign-up with email and password
   - Accepts SMS terms and conditions

2. **Website Registration**
   - User registers their website (client)
   - Provides website name and domain
   - Acknowledges website ownership

3. **Phone Number Verification**
   - User adds a phone number
   - For first phone (owner): OTP verification via Twilio
   - For team members: Invite link system
   - Phone number is linked to the website

4. **Widget Configuration**
   - User customizes widget appearance
   - Selects widget type, colors, fonts, position
   - Configures advanced options (logo, links, animations)

5. **Widget Embedding**
   - User receives embed code (script or iframe)
   - Embeds code on their website
   - Widget is now live and ready to receive messages

### Step 2: Sending Messages

1. **User sends SMS**
   - User sends a text message from their verified phone number
   - Message is sent to the T2MS Twilio phone number
   - Message content can include:
     - Standard message: "Your message here"
     - Popup message: "popup: Your message here"

2. **Message Processing**
   - Twilio receives the SMS
   - Webhook sends message to T2MS API
   - System identifies the sender's phone number
   - Looks up associated client/website
   - Validates message limits based on subscription plan
   - Saves message to database

3. **Widget Display**
   - Widget polls the API for new messages
   - When a new message is found, it displays:
     - As a banner, popup, modal, ticker, or fullscreen
     - With custom styling and configuration
     - In real-time on the website

### Step 3: Message Management

1. **Dashboard View**
   - Users can view all messages in their dashboard
   - Messages are organized by website/client
   - Search and filter capabilities

2. **Message Control**
   - Pin/unpin messages (control visibility)
   - View message history
   - Delete messages
   - Configure message settings

---

## Technical Architecture

### Frontend

**Technology Stack:**
- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type-safe development
- **Tailwind CSS v4**: Styling
- **Framer Motion**: Animations
- **Radix UI**: Accessible component primitives
- **React Hook Form**: Form management
- **Zod**: Schema validation
- **TanStack Query**: Data fetching and caching

**Key Components:**
- Landing pages (marketing site)
- User dashboard (app management)
- Admin dashboard (platform management)
- Widget builder (configuration UI)
- Team management
- Analytics dashboards

### Backend

**Technology Stack:**
- **Next.js API Routes**: Server-side API endpoints
- **Prisma ORM**: Database management
- **PostgreSQL**: Primary database
- **Better Auth**: Authentication and authorization
- **Twilio API**: SMS communication
- **Stripe API**: Payment processing

**API Endpoints:**
- `/api/auth/*`: Authentication endpoints
- `/api/client/*`: Client/website management
- `/api/message/*`: Message handling
- `/api/phone/*`: Phone number management
- `/api/twilio/*`: Twilio webhook handler
- `/api/admin/*`: Admin operations
- `/api/analytics/*`: Analytics data
- `/widget`: Widget JavaScript delivery

### Database Schema

**Key Models:**
- **User**: Platform users
- **Organization**: User organizations
- **Member**: Organization members
- **Client**: Registered websites
- **Message**: SMS messages
- **PhoneNumber**: Verified phone numbers
- **Subscription**: Stripe subscriptions
- **Session**: User sessions
- **Account**: Authentication accounts

### Widget System

**Widget Architecture:**
- JavaScript widget served from `/widget` endpoint
- Polls API every 15 seconds for new messages
- Renders messages based on configuration
- Supports multiple widget types
- Mobile-responsive design
- Cross-platform compatibility

---

## User Workflows

### For Business Owners

1. **Initial Setup**
   - Sign up for an account
   - Register website(s)
   - Verify phone number(s)
   - Customize widget appearance
   - Embed widget on website

2. **Daily Usage**
   - Send SMS from verified phone
   - Message appears on website instantly
   - Manage messages from dashboard
   - View analytics and statistics

3. **Team Management**
   - Invite team members
   - Assign channels/clients
   - Manage permissions
   - Monitor team activity

### For Team Members

1. **Invitation**
   - Receive invitation email
   - Accept invitation
   - Access assigned clients/channels

2. **Message Management**
   - View assigned messages
   - Reply to customer messages (Phase 2)
   - Mark messages as complete
   - Manage availability

### For Website Visitors

1. **Viewing Messages**
   - Visit website with T2MS widget
   - See real-time messages
   - Interact with widgets (close, dismiss)
   - View company links and branding

---

## Use Cases

### 1. Restaurant Specials
- Restaurant owner sends daily specials via SMS
- Specials appear as banner on website homepage
- Customers see current promotions instantly

### 2. Event Announcements
- Event organizer sends event updates
- Updates appear as popup notifications
- Real-time event information for attendees

### 3. Service Availability
- Service business updates availability
- Status changes appear on website
- Customers see current availability without calling

### 4. Promotional Campaigns
- Marketing team sends promotional messages
- Campaigns appear as fullscreen announcements
- High-visibility promotional content

### 5. Emergency Notifications
- Business sends urgent updates
- Critical information displayed prominently
- Real-time communication with customers

---

## Security & Compliance

### Security Features

- **Authentication**: Secure user authentication with Better Auth
- **Authorization**: Role-based access control
- **Data Encryption**: Secure data transmission (HTTPS)
- **Phone Verification**: OTP verification for phone numbers
- **API Security**: Secure API endpoints with authentication
- **CORS Protection**: Proper CORS configuration
- **Input Validation**: Comprehensive input validation with Zod

### Compliance

- **SMS Terms**: Clear SMS terms and conditions
- **Privacy Policy**: Comprehensive privacy policy
- **Terms of Service**: User terms and conditions
- **GDPR Compliance**: Data protection compliance
- **A2P Messaging**: Twilio A2P compliance for SMS

---

## Integration Points

### Twilio Integration
- **SMS Receiving**: Webhook endpoint for incoming SMS
- **SMS Sending**: (Phase 2) Outbound SMS for replies
- **OTP Verification**: Twilio Verify for phone verification
- **Status Tracking**: (Phase 2) Delivery status webhooks

### Stripe Integration
- **Subscription Management**: Create and manage subscriptions
- **Webhook Handling**: Process subscription events
- **Customer Management**: Stripe customer creation
- **Plan Limits**: Enforce subscription limits

### PostHog Integration
- **User Analytics**: Track user behavior
- **Feature Usage**: Monitor feature adoption
- **Event Tracking**: Custom event tracking

---

## Phase 2 Enhancements (Planned)

### Worker Dashboard
- Dedicated worker login
- Job/message inbox
- Assigned clients view
- Reply interface
- Mark-complete functionality
- Availability toggle
- Earnings summary
- Client notes

### Message Routing
- Intelligent message routing to workers
- Offline worker fallback
- No message loss guarantee
- Message threading
- Conversation management

### Enhanced Features
- Advanced message filtering
- Improved search functionality
- Better analytics
- Performance optimizations
- Multi-platform testing
- Enhanced documentation

---

## Technical Requirements

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Twilio account
- Stripe account (for payments)
- Domain with SSL certificate (for production)

### Environment Variables
- Database connection string
- Better Auth secret
- Twilio credentials
- Stripe API keys
- PostHog key (optional)

---

## Deployment

### Production Considerations
- Database backups
- Environment variable security
- SSL certificates
- CDN for static assets
- Monitoring and error tracking
- Rate limiting
- Caching strategy

### Hosting Options
- Vercel (recommended for Next.js)
- AWS
- Google Cloud
- DigitalOcean
- Any Node.js-compatible hosting

---

## Support & Resources

### Documentation
- Setup guide (SETUP.md)
- Phase 2 implementation plan
- Architecture improvements guide
- Platform-specific integration guides

### Support Channels
- Email support
- Documentation site
- Video tutorials (Loom)
- FAQ section

---

## Future Roadmap

### Short-term (Phase 2)
- Worker dashboard
- Message routing
- Enhanced admin features
- Multi-platform testing

### Long-term
- Mobile app
- Advanced analytics
- API for third-party integrations
- White-label options
- Multi-language support
- Advanced widget customization
- A/B testing for messages
- Scheduled messages
- Message templates

---

## Conclusion

Text2MySite™ is a powerful platform that democratizes website content management by allowing business owners to update their websites through simple text messages. It combines the convenience of SMS with the power of real-time web updates, making it accessible to users without technical expertise.

The platform is built with modern technologies, follows best practices for security and scalability, and provides a comprehensive solution for businesses looking to streamline their website content management process.

---

**Version**: 1.0 (MVP)
**Last Updated**: December 2024
**Status**: Active Development (Phase 2)



