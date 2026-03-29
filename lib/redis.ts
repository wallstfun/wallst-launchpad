import { Redis } from '@upstash/redis';

console.log('🔧 Redis client being initialized...');
console.log('URL length:', "https://moving-giraffe-87987.upstash.io".length);
console.log('Token length:', "gQAAAAAAAVezAAIncDEwMzA1ODViOWQyMjI0MzYwOTU5YWMzMTgwOTlmZTUzZHAxODc5ODc".length);
console.log('Token starts with:', "gQAAAAAAAVezAAIncDEwMzA1ODViOWQyMjI0MzYwOTU5YWMzMTgwOTlmZTUzZHAxODc5ODc".substring(0, 20));

export const redis = new Redis({
  url: "https://moving-giraffe-87987.upstash.io",
  token: "gQAAAAAAAVezAAIncDEwMzA1ODViOWQyMjI0MzYwOTU5YWMzMTgwOTlmZTUzZHAxODc5ODc",
});