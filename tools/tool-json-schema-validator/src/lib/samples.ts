/**
 * 5 组内置样例：Schema + Data 成对出现，覆盖典型场景。
 * 注：所有字符串都已是合法 JSON 文本（trailing newline 友好）。
 */

export type SampleKey =
  | 'user'
  | 'productList'
  | 'openApi'
  | 'anyOfOneOf'
  | 'formats'

export interface SamplePair {
  key: SampleKey
  schema: string
  data: string
}

const userSchema = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "id": { "type": "integer", "minimum": 1 },
    "name": { "type": "string", "minLength": 1 },
    "email": { "type": "string", "format": "email" },
    "active": { "type": "boolean" }
  },
  "required": ["id", "name", "email"],
  "additionalProperties": false
}
`

const userData = `{
  "id": 1,
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "active": true
}
`

const productListSchema = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "sku": { "type": "string", "pattern": "^[A-Z0-9-]+$" },
      "name": { "type": "string" },
      "price": { "type": "number", "exclusiveMinimum": 0 },
      "tags": {
        "type": "array",
        "items": { "type": "string" },
        "uniqueItems": true
      }
    },
    "required": ["sku", "name", "price"]
  },
  "minItems": 1
}
`

const productListData = `[
  { "sku": "AB-001", "name": "Mug", "price": 12.5, "tags": ["kitchen", "ceramic"] },
  { "sku": "AB-002", "name": "Notebook", "price": 4.99, "tags": ["paper"] }
]
`

const openApiSchema = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "openapi": { "type": "string", "pattern": "^3\\\\.[0-9]+\\\\.[0-9]+$" },
    "info": {
      "type": "object",
      "properties": {
        "title": { "type": "string" },
        "version": { "type": "string" }
      },
      "required": ["title", "version"]
    },
    "paths": { "type": "object" }
  },
  "required": ["openapi", "info", "paths"]
}
`

const openApiData = `{
  "openapi": "3.0.3",
  "info": { "title": "Sample API", "version": "1.0.0" },
  "paths": {
    "/users": {
      "get": { "summary": "List users" }
    }
  }
}
`

const anyOfOneOfSchema = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "payment": {
      "oneOf": [
        {
          "type": "object",
          "properties": {
            "kind": { "const": "card" },
            "last4": { "type": "string", "pattern": "^[0-9]{4}$" }
          },
          "required": ["kind", "last4"]
        },
        {
          "type": "object",
          "properties": {
            "kind": { "const": "wallet" },
            "provider": { "type": "string" }
          },
          "required": ["kind", "provider"]
        }
      ]
    },
    "contact": {
      "anyOf": [
        { "type": "object", "properties": { "email": { "type": "string", "format": "email" } }, "required": ["email"] },
        { "type": "object", "properties": { "phone": { "type": "string", "pattern": "^[0-9+ -]+$" } }, "required": ["phone"] }
      ]
    }
  },
  "required": ["payment", "contact"]
}
`

const anyOfOneOfData = `{
  "payment": { "kind": "card", "last4": "4242" },
  "contact": { "email": "alice@example.com" }
}
`

const formatsSchema = `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "email": { "type": "string", "format": "email" },
    "homepage": { "type": "string", "format": "uri" },
    "birthday": { "type": "string", "format": "date" },
    "lastLogin": { "type": "string", "format": "date-time" },
    "ip": { "type": "string", "format": "ipv4" },
    "uuid": { "type": "string", "format": "uuid" }
  },
  "required": ["email"]
}
`

const formatsData = `{
  "email": "user@example.com",
  "homepage": "https://example.com",
  "birthday": "1990-05-12",
  "lastLogin": "2024-09-15T10:00:00Z",
  "ip": "127.0.0.1",
  "uuid": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
}
`

export const SAMPLES: Record<SampleKey, SamplePair> = {
  user: { key: 'user', schema: userSchema, data: userData },
  productList: { key: 'productList', schema: productListSchema, data: productListData },
  openApi: { key: 'openApi', schema: openApiSchema, data: openApiData },
  anyOfOneOf: { key: 'anyOfOneOf', schema: anyOfOneOfSchema, data: anyOfOneOfData },
  formats: { key: 'formats', schema: formatsSchema, data: formatsData },
}

export const SAMPLE_ORDER: SampleKey[] = [
  'user',
  'productList',
  'openApi',
  'anyOfOneOf',
  'formats',
]
