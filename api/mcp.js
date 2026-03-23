import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uniforms = JSON.parse(readFileSync(join(__dirname, '..', 'uniforms.json'), 'utf8'));

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getUniform(child, dateStr) {
  const childData = uniforms.children[child];
  if (!childData) return `Unknown child: ${child}`;

  if (uniforms.nonSchoolDays.includes(dateStr)) {
    return 'no school (holidays)';
  }

  const dayIndex = new Date(`${dateStr}T12:00:00`).getDay();
  if (dayIndex === 0 || dayIndex === 6) {
    return 'no school (weekend)';
  }

  if (childData.exceptions[dateStr]) {
    return childData.exceptions[dateStr];
  }

  const day = DAYS[dayIndex];
  return childData.schedule[day] || 'no school';
}

function formatResult(dateStr) {
  const day = DAYS[new Date(`${dateStr}T12:00:00`).getDay()];
  const frankie = getUniform('frankie', dateStr);
  const maisie = getUniform('maisie', dateStr);
  return `${day} ${dateStr}\nFrankie: ${frankie}\nMaisie: ${maisie}`;
}

function createServer() {
  const server = new McpServer({
    name: 'uniforms',
    version: '1.0.0',
  });

  server.tool(
    'get_today_uniform',
    'Get the uniform each child needs to wear today',
    {},
    async () => {
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Sydney' });
      return { content: [{ type: 'text', text: formatResult(today) }] };
    }
  );

  server.tool(
    'get_uniform_for_date',
    'Get the uniform each child needs to wear on a specific date',
    { date: z.string().describe('Date in YYYY-MM-DD format') },
    async ({ date }) => {
      return { content: [{ type: 'text', text: formatResult(date) }] };
    }
  );

  return server;
}

export default async function handler(req, res) {
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  res.on('close', () => {
    transport.close();
    server.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
}
