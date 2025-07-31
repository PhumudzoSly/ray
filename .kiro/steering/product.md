---
inclusion: always
---

---

## inclusion: always

# Product Overview

## Ray - SaaS Validation Platform

A modern business validation and research platform built as a comprehensive monorepo. Ray transforms quick business idea validation into deep, multi-phase research processes with AI-powered insights.

## Core Applications

- **Web App** (`apps/web`): Main SaaS application for business validation and research (port 3000)
- **Landing Page** (`apps/landing`): Marketing site for user acquisition (port 3002)
- **Documentation** (`apps/docs`): Technical documentation and user guides (port 3001)

## Product Architecture

### Research Workflow System

- **Multi-phase Research**: Market scan → Competitive analysis → Customer validation → Business modeling
- **Configurable Depth**: Quick scans (5-10 min) to exhaustive analysis (hours)
- **AI-Powered**: OpenAI and Google AI integration for intelligent research
- **Workflow Orchestration**: Inngest handles complex, long-running research processes

### Real-time Collaboration

- **Live Progress Updates**: Real-time research status via streaming
- **Collaborative Editing**: BlockNote editor with Liveblocks integration
- **Shared Workspaces**: Team-based research collaboration

## Design Philosophy

Inspired by Linear and Notion with emphasis on:

- **Minimal UI**: Clean, distraction-free interface prioritizing content
- **Progressive Disclosure**: Complex features revealed as needed
- **Performance First**: Fast loading, responsive interactions
- **Accessibility**: WCAG compliant components throughout

## Product Conventions

### User Experience Patterns

- **Loading States**: Always show progress for operations >200ms
- **Error Handling**: Graceful degradation with actionable error messages
- **Empty States**: Helpful guidance when no data exists
- **Confirmation Flows**: Destructive actions require explicit confirmation

### Content Guidelines

- **Tone**: Professional but approachable, avoid jargon
- **Microcopy**: Concise, action-oriented button and label text
- **Research Terminology**: Consistent naming across validation phases
- **Status Indicators**: Clear visual hierarchy for research progress

### Feature Development

- **Research-First**: All features should enhance the core research workflow
- **Data-Driven**: Metrics and analytics inform product decisions
- **Iterative**: Ship small, measure, iterate based on user feedback
- **Quality Gates**: No feature ships without proper testing and documentation
