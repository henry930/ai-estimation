/**
 * API Documentation Generator
 * Analyzes all route.ts files and generates comprehensive API documentation
 */

import fs from 'fs';
import path from 'path';

interface APIEndpoint {
    path: string;
    methods: string[];
    description: string;
    authentication: boolean;
    requestBody?: any;
    responseFormat?: any;
    parameters?: any;
}

const apiDir = 'src/app/api';
const endpoints: APIEndpoint[] = [];

function analyzeRouteFile(filePath: string): APIEndpoint | null {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = filePath.replace('src/app/api/', '').replace('/route.ts', '');

    // Detect HTTP methods
    const methods: string[] = [];
    if (content.includes('export async function GET')) methods.push('GET');
    if (content.includes('export async function POST')) methods.push('POST');
    if (content.includes('export async function PUT')) methods.push('PUT');
    if (content.includes('export async function DELETE')) methods.push('DELETE');
    if (content.includes('export async function PATCH')) methods.push('PATCH');

    if (methods.length === 0) return null;

    // Extract description from comments
    const descMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\n/);
    const description = descMatch ? descMatch[1] : '';

    // Check for authentication
    const hasAuth = content.includes('getServerSession') ||
        content.includes('auth') ||
        content.includes('Unauthorized');

    return {
        path: `/api/${relativePath}`,
        methods,
        description,
        authentication: hasAuth,
    };
}

function scanDirectory(dir: string) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scanDirectory(fullPath);
        } else if (file === 'route.ts') {
            const endpoint = analyzeRouteFile(fullPath);
            if (endpoint) {
                endpoints.push(endpoint);
            }
        }
    }
}

// Scan all API routes
scanDirectory(apiDir);

// Sort by path
endpoints.sort((a, b) => a.path.localeCompare(b.path));

// Generate markdown documentation
let markdown = `# API Documentation

**Generated**: ${new Date().toISOString()}  
**Total Endpoints**: ${endpoints.length}

## Table of Contents

`;

// Group by category
const categories: Record<string, APIEndpoint[]> = {
    'Authentication': [],
    'Projects': [],
    'Tasks': [],
    'GitHub Integration': [],
    'Estimates': [],
    'Subscriptions': [],
    'Health & Diagnostics': [],
    'Other': []
};

for (const endpoint of endpoints) {
    if (endpoint.path.includes('/auth')) categories['Authentication'].push(endpoint);
    else if (endpoint.path.includes('/projects')) categories['Projects'].push(endpoint);
    else if (endpoint.path.includes('/tasks') || endpoint.path.includes('/groups')) categories['Tasks'].push(endpoint);
    else if (endpoint.path.includes('/github')) categories['GitHub Integration'].push(endpoint);
    else if (endpoint.path.includes('/estimate')) categories['Estimates'].push(endpoint);
    else if (endpoint.path.includes('/subscription') || endpoint.path.includes('/stripe')) categories['Subscriptions'].push(endpoint);
    else if (endpoint.path.includes('/health') || endpoint.path.includes('/diag')) categories['Health & Diagnostics'].push(endpoint);
    else categories['Other'].push(endpoint);
}

// Generate TOC
for (const [category, items] of Object.entries(categories)) {
    if (items.length > 0) {
        markdown += `- [${category}](#${category.toLowerCase().replace(/ & /g, '--').replace(/ /g, '-')})\n`;
    }
}

markdown += '\n---\n\n';

// Generate detailed documentation
for (const [category, items] of Object.entries(categories)) {
    if (items.length === 0) continue;

    markdown += `## ${category}\n\n`;

    for (const endpoint of items) {
        markdown += `### \`${endpoint.methods.join(', ')}\` ${endpoint.path}\n\n`;

        if (endpoint.description) {
            markdown += `**Description**: ${endpoint.description}\n\n`;
        }

        markdown += `**Authentication**: ${endpoint.authentication ? '🔒 Required' : '🔓 Public'}\n\n`;

        markdown += `**Methods**: ${endpoint.methods.map(m => `\`${m}\``).join(', ')}\n\n`;

        markdown += '---\n\n';
    }
}

// Write to file
fs.writeFileSync('docs/API_DOCUMENTATION.md', markdown);
console.log('✅ API Documentation generated: docs/API_DOCUMENTATION.md');
console.log(`📊 Total endpoints documented: ${endpoints.length}`);
