# Deployment Guide

This document describes the deployment architecture for staging and production environments.

## Deployment Stack
- **Frontend Hosting**: Vercel / Netlify (SPA static build).
- **Backend Hosting**: AWS ECS / Heroku / Render (Dockerized containers).
- **Database**: MongoDB Atlas (Managed DB Cluster).

## Basic CI/CD Pipeline
1. **Linting & Code Quality**: Run ESLint and Prettier.
2. **Automated Testing**: Run unit and integration test blocks.
3. **Build Target**: Compile React app via Vite (`npm run build`).
4. **Deploy Container**: Build Server Docker image and push to ECS.
