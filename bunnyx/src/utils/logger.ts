// bunny/src/utils/logger.ts

const C = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  cyan:    '\x1b[36m',
  red:     '\x1b[31m',
  gray:    '\x1b[90m',
  magenta: '\x1b[35m',
};

function ts() {
  return `${C.gray}${new Date().toLocaleTimeString('en-US', { hour12: false })}${C.reset}`;
}

export const logger = {
  info:    (msg: string) => console.log(`${ts()} ${C.blue}ℹ${C.reset}  ${msg}`),
  success: (msg: string) => console.log(`${ts()} ${C.green}✓${C.reset}  ${msg}`),
  warn:    (msg: string) => console.log(`${ts()} ${C.yellow}⚠${C.reset}  ${C.yellow}${msg}${C.reset}`),
  error:   (msg: string) => console.log(`${ts()} ${C.red}✗${C.reset}  ${C.red}${msg}${C.reset}`),
  step:    (msg: string) => console.log(`${ts()} ${C.cyan}→${C.reset}  ${msg}`),
  dim:     (msg: string) => console.log(`${C.dim}  ${msg}${C.reset}`),

  banner() {
    const bar = '─'.repeat(46);
    console.log(`\n${C.magenta}${C.bold}  🐰 BUNNYX${C.reset}`);
    console.log(`${C.gray}  ${bar}${C.reset}`);
    console.log(`${C.gray}  BertUI + Elysia — One server, zero abstraction${C.reset}`);
    console.log(`${C.gray}  ${bar}${C.reset}\n`);
  },

  ready(port: number) {
    console.log(`\n  ${C.green}${C.bold}▶  Ready on http://localhost:${port}${C.reset}\n`);
  },
};
